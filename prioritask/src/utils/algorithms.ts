import type { Assignment, UserSettings } from '../types/models';

/**
 * Calculates the safe days remaining until the deadline.
 * Math: D_safe = max(days_left, 0) + epsilon
 */
export const getSafeDaysLeft = (dueAt: string, epsilon: number): number => {
  const now = new Date().getTime();
  const due = new Date(dueAt).getTime();
  const diffHours = (due - now) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  
  // Clamp negative days to 0 (overdue), then add epsilon to prevent division by zero
  return Math.max(diffDays, 0) + epsilon;
};

/**
 * [x] DDS_safe: Due Date Score
 * Pure urgency ranking.
 * Score = 1 / D_safe
 */
export const DDS_safe = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  return 1 / dSafe;
};

/**
 * [x] DoD_safe: Difficulty over Days
 * Balances subjective difficulty with urgency.
 * Score = (Difficulty * Alpha) / D_safe
 */
export const DoD_safe = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  // Fallback to uncertaintyDefault if difficulty is null
  const diff = assignment.difficulty ?? settings.uncertaintyDefault; 
  
  return (diff * settings.alpha) / dSafe;
};

/**
 * [x] B2D_safe: Benefit to Difficulty and Days
 * Maximizes point efficiency per unit of subjective effort and time.
 * Score = Benefit / (Difficulty * D_safe)
 */
export const B2D_safe = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  const diff = assignment.difficulty ?? settings.uncertaintyDefault;
  const benefit = assignment.benefitPoints ?? settings.defaultNeed;
  
  // Using gamma as a scaling factor for the denominator if needed, 
  // or just directly applying the ratio.
  return benefit / (diff * dSafe * settings.gamma);
};

/**
 * [x] EoC_safe: Effort-Weighted Grade Impact
 * Optimizes for actual grade improvement against real hours.
 * Score = Weight / (EffortHours * D_safe)
 */
export const EoC_safe = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  const weight = assignment.weight ?? 1; // Base weight fallback
  const effort = assignment.effortHours ?? settings.defaultNeed;
  
  return weight / (effort * dSafe);
};