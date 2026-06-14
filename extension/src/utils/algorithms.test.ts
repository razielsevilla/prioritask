import { describe, it, expect } from 'vitest';
import { calculateTimePressure, getSafeDaysLeft, calculateFSR, mapToBucket, getEffortHours } from './algorithms';
import type { Assignment, UserSettings } from '../types/models';

describe('Scoring Engine Algorithms', () => {
  const mockSettings: UserSettings = {
    epsilon: 0.1,
    availableHoursPerDay: 4,
    defaultTShirtSize: 'M',
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
    tShirtSize: 'M',
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

  it('converts T-Shirt sizes to hours', () => {
    expect(getEffortHours('S')).toBe(1);
    expect(getEffortHours('M')).toBe(3);
    expect(getEffortHours('L')).toBe(8);
  });

  it('calculates Time Pressure accurately', () => {
    // M = 3 hours. 1 day left + 0.1 epsilon = 1.1
    // Score should be 3 / 1.1 = 2.727...
    const score = calculateTimePressure(mockAssignment, mockSettings);
    expect(score).toBeCloseTo(2.73, 2);
  });

  it('calculates FSR ratio correctly', () => {
    // M = 3 hours. Capacity = 1.1 days * 4 hours = 4.4
    // FSR = 3 / 4.4 = 0.6818...
    const fsr = calculateFSR(mockAssignment, mockSettings);
    expect(fsr).toBeCloseTo(0.68, 2);
  });
});

describe('Bucket Mapping', () => {
  it('maps to NOW if due in <= 2 days', () => {
    expect(mapToBucket(0.5, 0.1, 1.5)).toBe('NOW');
  });

  it('maps to NOW if FSR >= 0.75 even if far away', () => {
    expect(mapToBucket(0.5, 0.8, 10)).toBe('NOW');
  });

  it('maps to NEXT if due in <= 7 days and FSR is healthy', () => {
    expect(mapToBucket(0.5, 0.2, 5)).toBe('NEXT');
  });

  it('maps to NEXT if pressure > 1.0 even if far away', () => {
    expect(mapToBucket(1.5, 0.2, 10)).toBe('NEXT');
  });

  it('maps to LATER otherwise', () => {
    expect(mapToBucket(0.5, 0.2, 10)).toBe('LATER');
  });
});