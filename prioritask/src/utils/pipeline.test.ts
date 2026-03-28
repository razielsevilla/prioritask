import { describe, it, expect } from 'vitest';
import { rankAssignments } from './pipeline';
import type { Assignment, UserSettings } from '../types/models';

describe('Ranking Pipeline', () => {
  const mockSettings: UserSettings = {
    defaultMode: 'DDS', alpha: 0.5, epsilon: 0.1, gamma: 1.0,
    defaultNeed: 5, uncertaintyDefault: 5, availableHoursPerDay: 4,
    reminderWindows: [24], notificationEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  const createMockTask = (id: string, title: string, dueOffsetHours: number, mode: 'DDS' | 'DoD' = 'DDS'): Assignment => ({
    id, title, course: null,
    dueAt: new Date(Date.now() + dueOffsetHours * 60 * 60 * 1000).toISOString(),
    mode, difficulty: 5, benefitPoints: 5, weight: 10, effortHours: 1,
    currentGrade: null, status: 'pending',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  it('ranks overdue tasks at the absolute top', () => {
    const upcomingTask = createMockTask('1', 'Upcoming', 24); // Due tomorrow
    const overdueTask = createMockTask('2', 'Overdue', -24);  // Due yesterday
    
    // Even if we pass them in reverse order...
    const ranked = rankAssignments([upcomingTask, overdueTask], mockSettings);
    
    // ...the overdue task should be forced to index 0
    expect(ranked[0].id).toBe('2');
    expect(ranked[1].id).toBe('1');
  });

  it('sorts by final priority score descending', () => {
    // DDS score for 24h (1 day) is roughly ~0.9
    const normalTask = createMockTask('1', 'Normal Task', 24); 
    // DDS score for 2h (0.08 days) is much higher
    const urgentTask = createMockTask('2', 'Urgent Task', 2);  

    const ranked = rankAssignments([normalTask, urgentTask], mockSettings);
    
    expect(ranked[0].id).toBe('2'); // Higher score comes first
  });

  it('breaks ties deterministically (Due Date -> Title)', () => {
    // Both have exact same deadline and score
    const taskB = createMockTask('2', 'Beta', 24);
    const taskA = createMockTask('1', 'Alpha', 24);

    const ranked = rankAssignments([taskB, taskA], mockSettings);
    
    // Alpha should come before Beta alphabetically
    expect(ranked[0].id).toBe('1');
  });

  it('generates consistent explainability tags for UI', () => {
    // Due in 12 hours (0.5 days). Very little time.
    const highRiskTask = createMockTask('3', 'Tough Task', 12); 
    highRiskTask.difficulty = 9; // High difficulty
    // 5 hours of effort, but capacity is only 2 hours (0.5 days * 4 hours/day) -> FSR > 1.0
    highRiskTask.effortHours = 5; 
    
    const ranked = rankAssignments([highRiskTask], mockSettings);
    const tags = ranked[0].explanationReasons;

    // Verify it caught all three conditions deterministically
    expect(tags).toContain('🔥 High Urgency (Due soon)');
    expect(tags).toContain('⚠️ Critical Risk (Exceeds Capacity)');
    expect(tags).toContain('🧗 High Difficulty');
  });
});