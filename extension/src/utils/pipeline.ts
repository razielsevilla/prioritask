import { calculateTimePressure, calculateFSR, getSafeDaysLeft, mapToBucket } from './algorithms';
import type { Assignment, UserSettings, ComputedAssignment } from '../types/models';

/**
 * Helper to generate human-readable, UI-ready tags explaining the score.
 */
const generateExplanationTags = (
  task: Assignment,
  safeDaysLeft: number,
  fsrRatio: number,
  isOverdue: boolean
): string[] => {
  const tags: string[] = [];

  // Urgency / Overdue Tags
  if (isOverdue) {
    tags.push('🚨 Overdue');
  } else if (safeDaysLeft <= 1.5) { // Roughly within 24-36 hours
    tags.push('🔥 High Urgency (Due soon)');
  }

  // Risk Tags
  if (fsrRatio >= 1.0) {
    tags.push('⚠️ Critical Risk (Exceeds Capacity)');
  } else if (fsrRatio >= 0.75) {
    tags.push('⚡ High Risk (Near Capacity)');
  }

  // Legacy Impact / Difficulty Tags (if old data exists)
  if (task.difficulty && task.difficulty >= 8) {
    tags.push('🧗 High Difficulty');
  }
  if ((task.benefitPoints && task.benefitPoints >= 8) || (task.weight && task.weight >= 20)) {
    tags.push('⭐ High Impact');
  }

  return tags;
};

/**
 * The master pipeline that transforms raw assignments into ranked, computed assignments.
 */
export const rankAssignments = (
  assignments: Assignment[],
  settings: UserSettings
): ComputedAssignment[] => {
  const now = Date.now();

  // Step 1: Compute scores and buckets for all pending tasks
  const computedAssignments: ComputedAssignment[] = assignments
    .filter(task => task.status !== 'completed')
    .map(task => {
      const safeDaysLeft = getSafeDaysLeft(task.dueAt, settings.epsilon);
      const isOverdue = new Date(task.dueAt).getTime() < now;
      
      const pressureScore = calculateTimePressure(task, settings);
      const fsrRatio = calculateFSR(task, settings);
      const bucket = mapToBucket(pressureScore, fsrRatio, safeDaysLeft);
      
      const explanationReasons = generateExplanationTags(task, safeDaysLeft, fsrRatio, isOverdue);

      return {
        ...task,
        safeDaysLeft,
        pressureScore,
        fsrRatio,
        bucket,
        explanationReasons
      };
    });

  // Step 2: Sort by Bucket (NOW > NEXT > LATER), then by pressure, then by due date
  const bucketOrder = { 'NOW': 1, 'NEXT': 2, 'LATER': 3 };

  return computedAssignments.sort((a, b) => {
    // 1. Sort by Bucket
    if (bucketOrder[a.bucket] !== bucketOrder[b.bucket]) {
      return bucketOrder[a.bucket] - bucketOrder[b.bucket];
    }

    // 2. Sort by Overdue status within the same bucket
    const aIsOverdue = new Date(a.dueAt).getTime() < now;
    const bIsOverdue = new Date(b.dueAt).getTime() < now;
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1; 

    // 3. Sort by Pressure Score (higher is more urgent)
    if (b.pressureScore !== a.pressureScore) {
      return b.pressureScore - a.pressureScore;
    }

    // 4. Sort by Due Date
    const dueA = new Date(a.dueAt).getTime();
    const dueB = new Date(b.dueAt).getTime();
    if (dueA !== dueB) return dueA - dueB;

    // 5. Alphabetical fallback
    return a.title.localeCompare(b.title);
  });
};