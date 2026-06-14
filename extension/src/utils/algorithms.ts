import type { Assignment, UserSettings, TShirtSize, BucketType } from '../types/models';

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
 * Converts a T-Shirt size to estimated effort hours.
 */
export const getEffortHours = (size: TShirtSize): number => {
  switch (size) {
    case 'S': return 1;
    case 'M': return 3;
    case 'L': return 8;
    default: return 3;
  }
};

/**
 * Unified "Smart Pressure" Algorithm.
 * Pressure Score = Effort Hours / Days Left
 */
export const calculateTimePressure = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  const effort = getEffortHours(assignment.tShirtSize ?? settings.defaultTShirtSize);
  
  return effort / dSafe;
};

/**
 * [x] FSR: Feasibility and Schedule Risk
 * Calculates the ratio of required effort against available working capacity.
 * FSR Ratio = Effort / (D_safe * AvailableHoursPerDay)
 * A ratio > 1.0 means the task is mathematically impossible to finish within normal hours.
 */
export const calculateFSR = (assignment: Assignment, settings: UserSettings): number => {
  const dSafe = getSafeDaysLeft(assignment.dueAt, settings.epsilon);
  const effort = getEffortHours(assignment.tShirtSize ?? settings.defaultTShirtSize);
  const capacity = dSafe * settings.availableHoursPerDay;

  // Prevent division by zero if available hours is 0
  if (capacity <= 0) return 999;

  return effort / capacity;
};

/**
 * Maps task scores to actionable buckets (NOW, NEXT, LATER).
 */
export const mapToBucket = (pressureScore: number, fsrRatio: number, safeDaysLeft: number): BucketType => {
  // If overdue or due within ~48 hours, or mathematically at risk
  if (safeDaysLeft <= 2 || fsrRatio >= 0.75) {
    return 'NOW';
  }
  
  // If due within a week or has moderate pressure
  if (safeDaysLeft <= 7 || pressureScore > 1.0) {
    return 'NEXT';
  }
  
  // Otherwise, safely on the radar
  return 'LATER';
};