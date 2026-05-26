import { DDS_safe, DoD_safe, B2D_safe, EoC_safe, calculateFSR, applyRiskBoost, getSafeDaysLeft } from './algorithms';
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

  // Impact / Difficulty Tags
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

  // Step 1: Compute scores for all pending tasks
  const computedAssignments: ComputedAssignment[] = assignments
    .filter(task => task.status !== 'completed')
    .map(task => {
      const safeDaysLeft = getSafeDaysLeft(task.dueAt, settings.epsilon);
      const isOverdue = new Date(task.dueAt).getTime() < now;
      
      let baseScore = 0;
      switch (task.mode) {
        case 'DoD': baseScore = DoD_safe(task, settings); break;
        case 'B2D': baseScore = B2D_safe(task, settings); break;
        case 'EoC': baseScore = EoC_safe(task, settings); break;
        case 'DDS': 
        default: 
          baseScore = DDS_safe(task, settings); break;
      }

      const fsrRatio = calculateFSR(task, settings);
      const finalPriorityScore = applyRiskBoost(baseScore, fsrRatio);
      
      // [x] Reason tags are generated for transparent scoring
      const explanationReasons = generateExplanationTags(task, safeDaysLeft, fsrRatio, isOverdue);

      return {
        ...task,
        safeDaysLeft,
        baseScore,
        riskScore: finalPriorityScore - baseScore,
        finalPriorityScore,
        explanationReasons // [x] Tags are assigned to the output model
      };
    });

  // Step 2: Sort into buckets and apply tie-breakers
  return computedAssignments.sort((a, b) => {
    const aIsOverdue = new Date(a.dueAt).getTime() < now;
    const bIsOverdue = new Date(b.dueAt).getTime() < now;

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1; 

    if (b.finalPriorityScore !== a.finalPriorityScore) {
      return b.finalPriorityScore - a.finalPriorityScore;
    }

    const dueA = new Date(a.dueAt).getTime();
    const dueB = new Date(b.dueAt).getTime();
    if (dueA !== dueB) return dueA - dueB;

    return a.title.localeCompare(b.title);
  });
};