import { describe, it, expect } from 'vitest';
import { rankAssignments } from './pipeline';
import type { Assignment, UserSettings } from '../types/models';

describe('Ranking Pipeline', () => {
  const mockSettings: UserSettings = {
    epsilon: 0.1, availableHoursPerDay: 4,
    defaultTShirtSize: 'M',
    reminderWindows: [24], checkIntervalMinutes: 30, notificationEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  const createMockTask = (id: string, title: string, dueOffsetHours: number, tShirtSize: 'S' | 'M' | 'L' = 'M'): Assignment => ({
    id, title, course: null,
    dueAt: new Date(Date.now() + dueOffsetHours * 60 * 60 * 1000).toISOString(),
    tShirtSize,
    status: 'pending',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  it('ranks NOW tasks above NEXT and LATER', () => {
    // Overdue is NOW
    const overdueTask = createMockTask('1', 'Overdue', -24, 'M');
    // Due in 5 days is NEXT
    const nextTask = createMockTask('2', 'Next', 120, 'M');
    // Due in 14 days is LATER
    const laterTask = createMockTask('3', 'Later', 336, 'M');
    
    const ranked = rankAssignments([laterTask, overdueTask, nextTask], mockSettings);
    
    expect(ranked[0].id).toBe('1');
    expect(ranked[1].id).toBe('2');
    expect(ranked[2].id).toBe('3');
  });

  it('sorts by pressure score descending within the same bucket', () => {
    // Both are NOW tasks (due in < 2 days)
    // Task 1: Due in 24 hours, effort M (3h). Pressure = 3 / 1.1 = 2.72
    const normalTask = createMockTask('1', 'Normal Task', 24, 'M'); 
    // Task 2: Due in 2 hours, effort M (3h). Pressure = 3 / 0.18 = 16.6
    const urgentTask = createMockTask('2', 'Urgent Task', 2, 'M');  

    const ranked = rankAssignments([normalTask, urgentTask], mockSettings);
    
    expect(ranked[0].id).toBe('2'); // Higher pressure comes first
    expect(ranked[1].id).toBe('1');
  });

  it('breaks ties deterministically (Due Date -> Title)', () => {
    // Both have exact same deadline and score
    const taskB = createMockTask('2', 'Beta', 24, 'M');
    const taskA = createMockTask('1', 'Alpha', 24, 'M');

    const ranked = rankAssignments([taskB, taskA], mockSettings);
    
    // Alpha should come before Beta alphabetically
    expect(ranked[0].id).toBe('1');
  });

  it('generates consistent explainability tags for UI', () => {
    // Due in 12 hours (0.5 days). Very little time. -> NOW
    // L = 8 hours effort. Capacity = 0.5 * 4 = 2.0. FSR = 8 / 2 = 4.0. -> Critical Risk!
    const highRiskTask = createMockTask('3', 'Tough Task', 12, 'L'); 
    
    const ranked = rankAssignments([highRiskTask], mockSettings);
    const tags = ranked[0].explanationReasons;

    expect(tags).toContain('🔥 High Urgency (Due soon)');
    expect(tags).toContain('⚠️ Critical Risk (Exceeds Capacity)');
  });

  it('validates ranking of a comprehensive sample dataset', () => {
    const chillTask = createMockTask('chill', 'Read Chapter 1', 336, 'S'); // Due in 14 days (LATER)
    const overdueTask = createMockTask('overdue', 'Math Homework', -10, 'M'); // Overdue! (NOW)
    const urgentTask = createMockTask('urgent', 'Discussion Post', 5, 'S'); // Due in 5 hours (NOW)
    
    // Due in 10 days normally would be LATER or NEXT depending on FSR.
    // L = 8 hours. 10 days = 40 hours cap. FSR is fine.
    const farTask = createMockTask('far', 'Term Paper', 240, 'L'); 

    const dataset = [chillTask, farTask, overdueTask, urgentTask];
    
    const ranked = rankAssignments(dataset, mockSettings);

    // Expected Logic:
    // 1. 'overdue' (NOW bucket, highest pressure)
    // 2. 'urgent' (NOW bucket)
    // 3. 'far' (LATER bucket)
    // 4. 'chill' (LATER bucket, lower pressure than far)
    
    expect(ranked[0].id).toBe('overdue');
    expect(ranked[1].id).toBe('urgent');
    expect(ranked[2].id).toBe('far');
    expect(ranked[3].id).toBe('chill');
  });
});