import { describe, it, expect } from 'vitest';
import { DDS_safe, DoD_safe, B2D_safe, EoC_safe, getSafeDaysLeft, calculateFSR, applyRiskBoost } from './algorithms';
import type { Assignment, UserSettings } from '../types/models';

describe('Scoring Engine Algorithms', () => {
  const mockSettings: UserSettings = {
    defaultMode: 'DDS',
    alpha: 0.5,
    epsilon: 0.1,
    gamma: 1.0,
    defaultNeed: 5,
    uncertaintyDefault: 5,
    availableHoursPerDay: 4,
    reminderWindows: [24],
    checkIntervalMinutes: 30,
    notificationEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  const mockAssignment: Assignment = {
    id: '123',
    title: 'Test Task',
    course: null,
    // Set due date to exactly 24 hours from now
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    mode: 'DDS',
    difficulty: 8,
    benefitPoints: 10,
    weight: 20,
    effortHours: 2,
    currentGrade: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('safely calculates days left without returning 0', () => {
    // Due exactly now
    const nowTask = { ...mockAssignment, dueAt: new Date().toISOString() };
    const safeDays = getSafeDaysLeft(nowTask.dueAt, mockSettings.epsilon);
    expect(safeDays).toBe(mockSettings.epsilon); // Should equal 0.1
  });

  it('calculates DDS accurately', () => {
    // 1 day left + 0.1 epsilon = 1.1
    // Score should be 1 / 1.1 = 0.90909...
    const score = DDS_safe(mockAssignment, mockSettings);
    expect(score).toBeCloseTo(0.909, 2);
  });

  it('calculates DoD accurately with Alpha weight', () => {
    // Difficulty(8) * Alpha(0.5) / 1.1 = 4 / 1.1 = 3.636...
    const score = DoD_safe(mockAssignment, mockSettings);
    expect(score).toBeCloseTo(3.636, 2);
  });
  it('calculates B2D accurately', () => {
    // Benefit(10) / (Difficulty(8) * D_safe(1.1) * Gamma(1.0)) = 10 / 8.8 = 1.136...
    const score = B2D_safe(mockAssignment, mockSettings);
    expect(score).toBeCloseTo(1.136, 2);
  });

  it('calculates EoC accurately', () => {
    // Weight(20) / (Effort(2) * D_safe(1.1)) = 20 / 2.2 = 9.09...
    const score = EoC_safe(mockAssignment, mockSettings);
    expect(score).toBeCloseTo(9.09, 2);
  });

  it('handles missing values (null difficulty/effort) via defaults', () => {
    // Edge case: User leaves difficulty and effort blank
    const missingDataTask: Assignment = { ...mockAssignment, difficulty: null, effortHours: null };
    
    // DoD should fall back to uncertaintyDefault (5)
    // Score = (5 * Alpha(0.5)) / D_safe(1.1) = 2.5 / 1.1 = 2.272...
    const dodScore = DoD_safe(missingDataTask, mockSettings);
    expect(dodScore).toBeCloseTo(2.27, 2);

    // FSR should fall back to defaultNeed (5)
    // Capacity = 1.1 days * 4 hrs = 4.4. FSR = 5 / 4.4 = 1.136...
    const fsr = calculateFSR(missingDataTask, mockSettings);
    expect(fsr).toBeCloseTo(1.136, 2);
  });
});

describe('FSR and Risk Overlay', () => {
  const mockSettings: UserSettings = {
    defaultMode: 'DDS',
    alpha: 0.5,
    epsilon: 0.1,
    gamma: 1.0,
    defaultNeed: 5,
    uncertaintyDefault: 5,
    availableHoursPerDay: 4, // 4 hours available per day
    reminderWindows: [24],
    checkIntervalMinutes: 30,
    notificationEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  it('calculates FSR ratio correctly', () => {
    // Due in 24 hours (1 day). D_safe = 1 + epsilon(0.1) = 1.1
    // Capacity = 1.1 days * 4 hours/day = 4.4 hours
    // Effort = 2 hours.
    // FSR = 2 / 4.4 = 0.4545...
    const mockAssignment: Assignment = {
      id: '123',
      title: 'Test',
      course: null,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mode: 'DDS',
      difficulty: null,
      benefitPoints: null,
      weight: null,
      effortHours: 2,
      currentGrade: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fsr = calculateFSR(mockAssignment, mockSettings);
    expect(fsr).toBeCloseTo(0.454, 2);
  });

  it('applies no boost when risk is healthy (< 75%)', () => {
    expect(applyRiskBoost(10, 0.50)).toBe(10);
  });

  it('applies warning boost when risk crosses 75%', () => {
    // 10 * 3 = 30
    expect(applyRiskBoost(10, 0.80)).toBe(30);
  });

  it('applies critical boost when risk crosses 100%', () => {
    // 10 * 10 = 100
    expect(applyRiskBoost(10, 1.20)).toBe(100);
  });
});