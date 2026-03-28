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

const formatAssignmentContext = (task: Assignment): string => {
  const parts: string[] = [];

  if (task.course) {
    parts.push(`Course: ${task.course}`);
  }

  if (task.difficulty != null) {
    const diffLevel = task.difficulty >= 7 ? 'High' : task.difficulty >= 4 ? 'Medium' : 'Low';
    parts.push(`Difficulty: ${diffLevel} (${task.difficulty}/10)`);
  }

  if (task.effortHours != null) {
    parts.push(`Effort: ${task.effortHours}h`);
  }

  if (task.currentGrade != null) {
    parts.push(`Current Grade: ${task.currentGrade}%`);
  }

  if (task.benefitPoints != null) {
    parts.push(`Impact: ${task.benefitPoints} pts`);
  }

  return parts.length > 0 ? `\n${parts.join('\n')}` : '';
};

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
    const pendingIds = new Set(pendingAssignments.map((a) => a.id));

    const existingState = await getReminderState();
    const nextState: ReminderStateMap = {};

    // [P4.3] Overdue detection and once-per-policy alerts
    // Only pending tasks are processed; completed tasks never trigger overdue alerts.
    // Per-task overdue state is cleaned up if the task is marked complete.
    for (const task of pendingAssignments) {
      const dueInHours = hoursUntilDue(task.dueAt);
      const previous = existingState[task.id];

      // [P4.3] Reset state if due date changed (task updated)
      let taskState: TaskReminderState = previous && previous.dueAt === task.dueAt
        ? previous
        : { dueAt: task.dueAt, sentWindows: [], overdueSent: false };

      for (const windowHours of reminderWindows) {
        const alreadySent = taskState.sentWindows.includes(windowHours);
        const shouldSendWindowReminder = dueInHours > 0 && dueInHours <= windowHours && !alreadySent;

        if (shouldSendWindowReminder) {
          const roundedDueHours = Math.max(0.1, Number(dueInHours.toFixed(1)));
          const dueDate = new Date(task.dueAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const contextDetails = formatAssignmentContext(task);
          const message = `Due: ${dueDate} (in ${roundedDueHours}h)${contextDetails}`;
          const sent = await sendNotification(
            task,
            '⏰ PrioriTask Upcoming',
            message,
          );

          if (sent) {
            taskState = {
              ...taskState,
              sentWindows: [...taskState.sentWindows, windowHours],
            };
          }
        }
      }

      // [P4.3] Overdue detection: triggers when dueInHours <= 0 (task has passed deadline)
      // [P4.3] Once-per-policy: overdueSent flag ensures only one alert per task lifetime
      const shouldSendOverdue = dueInHours <= 0 && !taskState.overdueSent;
      if (shouldSendOverdue) {
        const daysOverdue = Math.abs(Math.floor(dueInHours / 24));
        const contextDetails = formatAssignmentContext(task);
        const overdueLabel = daysOverdue > 0 ? `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue` : 'overdue';
        const message = `${overdueLabel}${contextDetails}`;
        const sent = await sendNotification(
          task,
          '🚨 PrioriTask Overdue',
          message,
        );

        if (sent) {
          // [P4.3] Mark as sent to prevent repeat alerts for same task
          taskState = {
            ...taskState,
            overdueSent: true,
          };
        }
      }

      nextState[task.id] = taskState;
    }

    // [P4.3] Cleanup: remove reminder state for completed/deleted tasks to prevent state bloat
    for (const taskId of Object.keys(existingState)) {
      if (!pendingIds.has(taskId)) {
        // Task is no longer pending (completed or deleted); don't carry over old state
        // This prevents the reminder state from growing unbounded
        continue;
      }
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
