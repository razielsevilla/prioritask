import { chromeStorage } from './chromeStorage';
import type { Assignment, UserSettings } from '../types/models';

// Storage Keys matching your schema.md
const KEYS = {
  ASSIGNMENTS: 'prioritask.assignments',
  SETTINGS: 'prioritask.settings',
  META: 'prioritask.meta',
};

export const repository = {
  // ==========================
  // ASSIGNMENTS CRUD
  // ==========================

  async getAssignments(): Promise<Assignment[]> {
    const assignments = await chromeStorage.get<Assignment[]>(KEYS.ASSIGNMENTS);
    return assignments || [];
  },

  async getAssignment(id: string): Promise<Assignment | null> {
    const assignments = await this.getAssignments();
    return assignments.find((a) => a.id === id) || null;
  },

  async saveAssignment(assignment: Assignment): Promise<void> {
    const assignments = await this.getAssignments();
    const existingIndex = assignments.findIndex((a) => a.id === assignment.id);

    if (existingIndex >= 0) {
      // Update existing
      assignments[existingIndex] = assignment;
    } else {
      // Create new
      assignments.push(assignment);
    }

    await chromeStorage.set(KEYS.ASSIGNMENTS, assignments);
  },

  async deleteAssignment(id: string): Promise<void> {
    const assignments = await this.getAssignments();
    const filtered = assignments.filter((a) => a.id !== id);
    await chromeStorage.set(KEYS.ASSIGNMENTS, filtered);
  },

  // ==========================
  // SETTINGS CRUD
  // ==========================

  async getSettings(): Promise<UserSettings | null> {
    return await chromeStorage.get<UserSettings>(KEYS.SETTINGS);
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    await chromeStorage.set(KEYS.SETTINGS, settings);
  }
};