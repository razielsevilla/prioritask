// src/domain/models/types.ts

export type AlgorithmMode = 'DDS' | 'DoD' | 'B2D' | 'EoC';
export type AssignmentStatus = 'pending' | 'completed';

export interface Assignment {
  id: string;
  title: string;
  course: string | null;
  dueAt: string; // ISO-8601 datetime string
  mode: AlgorithmMode;
  difficulty: number | null;
  benefitPoints: number | null;
  weight: number | null;
  effortHours: number | null;
  currentGrade: number | null;
  status: AssignmentStatus;
  createdAt: string; // ISO-8601 datetime string
  updatedAt: string; // ISO-8601 datetime string
}

export interface UserSettings {
  defaultMode: AlgorithmMode;
  alpha: number;
  epsilon: number;
  gamma: number;
  defaultNeed: number;
  uncertaintyDefault: number;
  availableHoursPerDay: number;
  reminderWindows: number[]; // e.g., [48, 24, 6]
  notificationEnabled: boolean;
  updatedAt: string; // ISO-8601 datetime string
}

export interface AppMeta {
  schemaVersion: number;
  lastMigrationAt: string | null; // ISO-8601 datetime string
}

// Optional: Computed fields interface for runtime rendering (as per your schema.md)
export interface ComputedAssignment extends Assignment {
  safeDaysLeft: number;
  baseScore: number;
  riskScore: number;
  finalPriorityScore: number;
  explanationReasons: string[];
}