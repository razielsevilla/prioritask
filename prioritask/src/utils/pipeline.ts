import { DDS_safe, DoD_safe, B2D_safe, EoC_safe, calculateFSR, applyRiskBoost, getSafeDaysLeft } from './algorithms';
import type { Assignment, UserSettings, ComputedAssignment } from '../types/models';

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
    .filter(task => task.status !== 'completed') // We only rank pending tasks
    .map(task => {
      const safeDaysLeft = getSafeDaysLeft(task.dueAt, settings.epsilon);
      
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

      return {
        ...task,
        safeDaysLeft,
        baseScore,
        riskScore: finalPriorityScore - baseScore, // How much the FSR boosted it
        finalPriorityScore,
        explanationReasons: [] // Will be populated in Phase 4
      };
    });

  // Step 2: Sort into buckets and apply tie-breakers
  return computedAssignments.sort((a, b) => {
    const aIsOverdue = new Date(a.dueAt).getTime() < now;
    const bIsOverdue = new Date(b.dueAt).getTime() < now;

    // [x] Overdue bucket is handled first
    if (aIsOverdue && !bIsOverdue) return -1; // 'a' jumps to top
    if (!aIsOverdue && bIsOverdue) return 1;  // 'b' jumps to top

    // [x] Final score sorting (Highest score first)
    if (b.finalPriorityScore !== a.finalPriorityScore) {
      return b.finalPriorityScore - a.finalPriorityScore;
    }

    // [x] Tie-breakers are deterministic
    // Tie-breaker 1: Closest deadline wins
    const dueA = new Date(a.dueAt).getTime();
    const dueB = new Date(b.dueAt).getTime();
    if (dueA !== dueB) return dueA - dueB;

    // Tie-breaker 2: Alphabetical by title
    return a.title.localeCompare(b.title);
  });
};