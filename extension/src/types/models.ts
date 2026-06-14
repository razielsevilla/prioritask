// src/types/models.ts

export type BucketType = 'NOW' | 'NEXT' | 'LATER';
export type TShirtSize = 'S' | 'M' | 'L';
export type AssignmentStatus = 'pending' | 'completed';

export interface Assignment {
  id: string;
  title: string;
  course: string | null;
  dueAt: string; // ISO-8601 datetime string
  tShirtSize: TShirtSize;
  
  parentId?: string | null;
  subtaskIds?: string[];
  
  // Legacy fields (kept for backward compatibility)
  mode?: string;
  difficulty?: number | null;
  benefitPoints?: number | null;
  weight?: number | null;
  effortHours?: number | null;
  currentGrade?: number | null;

  status: AssignmentStatus;
  createdAt: string; // ISO-8601 datetime string
  updatedAt: string; // ISO-8601 datetime string
}

export interface UserSettings {
  epsilon: number;
  availableHoursPerDay: number;
  defaultTShirtSize: TShirtSize;
  reminderWindows: number[]; // e.g., [48, 24, 6]
  checkIntervalMinutes: number;
  notificationEnabled: boolean;
  geminiApiKey?: string;
  updatedAt: string; // ISO-8601 datetime string
}

export interface AppMeta {
  schemaVersion: number;
  lastMigrationAt: string | null; // ISO-8601 datetime string
}

export interface ComputedAssignment extends Assignment {
  safeDaysLeft: number;
  pressureScore: number;
  fsrRatio: number;
  bucket: BucketType;
  explanationReasons: string[];
}