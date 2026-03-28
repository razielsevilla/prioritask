import { repository } from '../storage/repository';
import type { Assignment, UserSettings } from '../types/models';

const SETTINGS_KEY = 'prioritask.settings';
const ASSIGNMENTS_KEY = 'prioritask.assignments';
const REMINDER_STATE_KEY = 'prioritask.reminder-state';
const PERIODIC_ALARM_NAME = 'prioritask.periodic-check';

type TaskReminderState = {
  dueAt: string;
  sentWindows: number[];
  overdueSent: boolean;
};

type ReminderStateMap = Record<string, TaskReminderState>;

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'DDS',
  alpha: 0.5,
  epsilon: 0.1,
  gamma: 0.5,
  defaultNeed: 5,
  uncertaintyDefault: 5,
  availableHoursPerDay: 4,
  reminderWindows: [48, 24, 6],
  checkIntervalMinutes: 30,
  notificationEnabled: true,
  updatedAt: new Date().toISOString(),
};

const normalizeInterval = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_SETTINGS.checkIntervalMinutes;
  }

  return Math.min(180, Math.max(1, Math.floor(value)));
};

const normalizeReminderWindows = (windows: number[]): number[] => {
  return [...new Set(windows.map((window) => Math.floor(window)).filter((window) => window > 0))]
    .sort((a, b) => b - a);
};

const getActiveSettings = async (): Promise<UserSettings> => {
  const stored = await repository.getSettings();
  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    reminderWindows: stored.reminderWindows?.length
      ? normalizeReminderWindows(stored.reminderWindows)
      : DEFAULT_SETTINGS.reminderWindows,
    checkIntervalMinutes: normalizeInterval(stored.checkIntervalMinutes),
  };
};

const getReminderState = async (): Promise<ReminderStateMap> => {
  const result = await chrome.storage.local.get(REMINDER_STATE_KEY);
  return (result[REMINDER_STATE_KEY] as ReminderStateMap | undefined) ?? {};
};

const saveReminderState = async (state: ReminderStateMap): Promise<void> => {
  await chrome.storage.local.set({ [REMINDER_STATE_KEY]: state });
};

const hoursUntilDue = (dueAt: string): number => {
  const dueMs = new Date(dueAt).getTime();
  return (dueMs - Date.now()) / (1000 * 60 * 60);
};

const FALLBACK_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAOt0i5cAAAAASUVORK5CYII=';

const sendNotification = async (
  task: Assignment,
  title: string,
  message: string,
): Promise<boolean> => {
  const notificationId = `prioritask-${task.id}-${Date.now()}`;

  try {
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('favicon.svg'),
      title,
      message,
      priority: 1,
    });
    return true;
  } catch {
    try {
      await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: FALLBACK_ICON,
        title,
        message,
        priority: 1,
      });
      return true;
    } catch (error) {
      console.error('PrioriTask notification dispatch failed:', error);
      return false;
    }
  }
};

const runReminderCheck = async (): Promise<void> => {
  try {
    const settings = await getActiveSettings();
    if (!settings.notificationEnabled) {
      return;
    }

    const reminderWindows = normalizeReminderWindows(settings.reminderWindows);
    const assignments = await repository.getAssignments();
    const pendingAssignments = assignments.filter((assignment) => assignment.status === 'pending');

    const existingState = await getReminderState();
    const nextState: ReminderStateMap = {};

    for (const task of pendingAssignments) {
      const dueInHours = hoursUntilDue(task.dueAt);
      const previous = existingState[task.id];

      let taskState: TaskReminderState = previous && previous.dueAt === task.dueAt
        ? previous
        : { dueAt: task.dueAt, sentWindows: [], overdueSent: false };

      for (const windowHours of reminderWindows) {
        const alreadySent = taskState.sentWindows.includes(windowHours);
        const shouldSendWindowReminder = dueInHours > 0 && dueInHours <= windowHours && !alreadySent;

        if (shouldSendWindowReminder) {
          const roundedDueHours = Math.max(0.1, Number(dueInHours.toFixed(1)));
          const sent = await sendNotification(
            task,
            'PrioriTask reminder',
            `${task.title} is due in about ${roundedDueHours} hours (window: ${windowHours}h).`,
          );

          if (sent) {
            taskState = {
              ...taskState,
              sentWindows: [...taskState.sentWindows, windowHours],
            };
          }
        }
      }

      const shouldSendOverdue = dueInHours <= 0 && !taskState.overdueSent;
      if (shouldSendOverdue) {
        const sent = await sendNotification(
          task,
          'PrioriTask overdue task',
          `${task.title} is overdue.`,
        );

        if (sent) {
          taskState = {
            ...taskState,
            overdueSent: true,
          };
        }
      }

      nextState[task.id] = taskState;
    }

    await saveReminderState(nextState);
  } catch (error) {
    console.error('PrioriTask reminder check failed:', error);
  }
};

const schedulePeriodicCheck = async (): Promise<void> => {
  try {
    const settings = await getActiveSettings();
    const periodInMinutes = normalizeInterval(settings.checkIntervalMinutes);

    await chrome.alarms.clear(PERIODIC_ALARM_NAME);
    chrome.alarms.create(PERIODIC_ALARM_NAME, {
      delayInMinutes: 0.1,
      periodInMinutes,
    });
  } catch (error) {
    console.error('PrioriTask scheduling failed:', error);
  }
};

const initializeScheduler = async (): Promise<void> => {
  await schedulePeriodicCheck();
  await runReminderCheck();
};

chrome.runtime.onInstalled.addListener(() => {
  void initializeScheduler();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeScheduler();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== PERIODIC_ALARM_NAME) {
    return;
  }

  void runReminderCheck();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') {
    return;
  }

  if (changes[SETTINGS_KEY]) {
    void schedulePeriodicCheck();
  }

  if (changes[SETTINGS_KEY] || changes[ASSIGNMENTS_KEY]) {
    void runReminderCheck();
  }
});

void initializeScheduler();
