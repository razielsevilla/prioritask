import { useState, useEffect, useMemo } from 'react';
import { repository } from '../storage/repository';
import type { Assignment, AlgorithmMode, UserSettings } from '../types/models';
import { assignmentSchema } from '../types/validators';

const DEFAULT_SORT_MODE: AlgorithmMode = 'DDS';
const DEFAULT_SETTINGS: Pick<UserSettings, 'defaultMode' | 'alpha' | 'epsilon' | 'defaultNeed'> = {
  defaultMode: DEFAULT_SORT_MODE,
  alpha: 1,
  epsilon: 0.05,
  defaultNeed: 0.6,
};

type RankedAssignment = Assignment & {
  score: number;
  rawDaysLeft: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const getRawDaysLeft = (dueAt: string) => Math.ceil((new Date(dueAt).getTime() - Date.now()) / DAY_MS);

export default function Popup() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [sortMode, setSortMode] = useState<AlgorithmMode>(DEFAULT_SORT_MODE);
  const [algorithmSettings, setAlgorithmSettings] = useState(DEFAULT_SETTINGS);

  // Form State
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [effortHours, setEffortHours] = useState<number | ''>('');
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadAssignments();
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await repository.getSettings();
      if (!savedSettings) {
        return;
      }

      setSortMode(savedSettings.defaultMode ?? DEFAULT_SORT_MODE);
      setAlgorithmSettings({
        defaultMode: savedSettings.defaultMode ?? DEFAULT_SORT_MODE,
        alpha: savedSettings.alpha ?? DEFAULT_SETTINGS.alpha,
        epsilon: savedSettings.epsilon ?? DEFAULT_SETTINGS.epsilon,
        defaultNeed: savedSettings.defaultNeed ?? DEFAULT_SETTINGS.defaultNeed,
      });
    } catch {
      setStatusMessage('Unable to load saved sort mode. Using defaults.');
    }
  };

  const rankedAssignments = useMemo<RankedAssignment[]>(() => {
    const scoreFor = (task: Assignment): number => {
      const rawDaysLeft = getRawDaysLeft(task.dueAt);
      const d = Math.max(0, rawDaysLeft);
      const difficultyNorm = clamp((task.difficulty ?? 5) / 10);
      const benefitNorm = clamp((task.benefitPoints ?? 50) / 100);
      const weightNorm = clamp((task.weight ?? 50) / 100);
      const effort = Math.max(task.effortHours ?? 1, 0.5);
      const gradeNorm = clamp((task.currentGrade ?? 40) / 100);
      const alpha = Math.max(0.1, algorithmSettings.alpha ?? DEFAULT_SETTINGS.alpha);
      const epsilon = Math.max(0.0001, algorithmSettings.epsilon ?? DEFAULT_SETTINGS.epsilon);
      const defaultNeed = clamp(algorithmSettings.defaultNeed ?? DEFAULT_SETTINGS.defaultNeed);

      if (sortMode === 'DDS') {
        return 1 / (d + 1);
      }

      if (sortMode === 'DoD') {
        return difficultyNorm / (d + 1);
      }

      if (sortMode === 'B2D') {
        return benefitNorm / ((difficultyNorm + epsilon) * Math.pow(d + 1, alpha));
      }

      const needFactor = task.currentGrade == null ? defaultNeed : clamp(1 - gradeNorm);
      return (weightNorm * benefitNorm * needFactor) / ((effort + epsilon) * Math.pow(d + 1, alpha));
    };

    return assignments
      .map((task) => ({
        ...task,
        score: scoreFor(task),
        rawDaysLeft: getRawDaysLeft(task.dueAt),
      }))
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }

        const aOverdue = a.rawDaysLeft < 0;
        const bOverdue = b.rawDaysLeft < 0;
        if (aOverdue !== bOverdue) {
          return aOverdue ? -1 : 1;
        }

        const scoreDelta = b.score - a.score;
        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        const dueDelta = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        if (dueDelta !== 0) {
          return dueDelta;
        }

        return (a.effortHours ?? Number.MAX_SAFE_INTEGER) - (b.effortHours ?? Number.MAX_SAFE_INTEGER);
      });
  }, [assignments, sortMode, algorithmSettings]);

  const loadAssignments = async () => {
    try {
      const data = await repository.getAssignments();
      setAssignments(data);
    } catch {
      setStatusMessage('Unable to load tasks. Please reload the extension and try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueAt('');
    setDifficulty('');
    setEffortHours('');
    setEditingId(null);
    setErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    
    // Prepare the data for validation
    const formData = {
      title: title.trim(),
      dueAt,
      difficulty: difficulty === '' ? null : Number(difficulty),
      effortHours: effortHours === '' ? null : Number(effortHours),
    };

    // [x] Required fields & Numeric ranges are validated
    const validationResult = assignmentSchema.safeParse(formData);

    if (!validationResult.success) {
      // Map Zod errors to our state to show in the UI
      const formattedErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return; // Stop saving!
    }

    // Clear errors if validation passes
    setErrors({});
    const now = new Date().toISOString();
    
    const newAssignment: Assignment = {
      id: editingId || crypto.randomUUID(),
      title: validationResult.data.title,
      course: null,
      dueAt: new Date(validationResult.data.dueAt).toISOString(),
      mode: sortMode,
      difficulty: validationResult.data.difficulty,
      benefitPoints: null, 
      weight: null,
      effortHours: validationResult.data.effortHours,
      currentGrade: null,
      status: 'pending',
      createdAt: editingId ? (assignments.find(a => a.id === editingId)?.createdAt || now) : now,
      updatedAt: now,
    };

    try {
      setIsSaving(true);
      await repository.saveAssignment(newAssignment);
      await loadAssignments();
      resetForm();
      setStatusMessage(editingId ? 'Task updated.' : 'Task added.');
    } catch {
      setStatusMessage('Unable to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setDueAt(new Date(assignment.dueAt).toISOString().slice(0, 16));
    setDifficulty(assignment.difficulty ?? '');
    setEffortHours(assignment.effortHours ?? '');
    setErrors({});
    setStatusMessage('');
  };

  const handleToggleComplete = async (assignment: Assignment) => {
    const updated = {
      ...assignment,
      status: (assignment.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed',
      updatedAt: new Date().toISOString()
    };
    try {
      await repository.saveAssignment(updated);
      await loadAssignments();
      setStatusMessage('Task status updated.');
    } catch {
      setStatusMessage('Unable to update task status. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await repository.deleteAssignment(id);
      await loadAssignments();
      setStatusMessage('Task deleted.');
    } catch {
      setStatusMessage('Unable to delete task. Please try again.');
    }
  };

  return (
    <div style={{ padding: '16px', minWidth: '350px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>PrioriTask</h2>
        <label style={{ fontSize: '12px', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Sort by
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as AlgorithmMode)}>
            <option value="DDS">DDS</option>
            <option value="DoD">DoD</option>
            <option value="B2D">B2D</option>
            <option value="EoC">EoC</option>
          </select>
        </label>
      </div>
      {statusMessage ? <p style={{ marginTop: '0', color: '#444' }}>{statusMessage}</p> : null}
      
      {/* Form Section */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        
        {/* [x] UI feedback is shown for invalid inputs */}
        <div>
          <input 
            type="text" placeholder="Task Title" value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ width: '100%', borderColor: errors.title ? 'red' : '' }}
          />
          {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
        </div>

        <div>
          <input 
            type="datetime-local" value={dueAt} 
            onChange={(e) => setDueAt(e.target.value)} 
            style={{ width: '100%', borderColor: errors.dueAt ? 'red' : '' }}
          />
          {errors.dueAt && <span style={{ color: 'red', fontSize: '12px' }}>{errors.dueAt}</span>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '50%' }}>
            <input 
              type="number" placeholder="Difficulty (1-10)" step="0.1" 
              value={difficulty} onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', borderColor: errors.difficulty ? 'red' : '' }}
            />
            {errors.difficulty && <span style={{ color: 'red', fontSize: '12px' }}>{errors.difficulty}</span>}
          </div>
          <div style={{ width: '50%' }}>
            <input 
              type="number" placeholder="Effort (Hrs)" step="0.5" 
              value={effortHours} onChange={(e) => setEffortHours(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', borderColor: errors.effortHours ? 'red' : '' }}
            />
            {errors.effortHours && <span style={{ color: 'red', fontSize: '12px' }}>{errors.effortHours}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button type="submit" style={{ flex: 1 }} disabled={isSaving}>{isSaving ? 'Saving...' : (editingId ? 'Update Task' : 'Add Task')}</button>
          {editingId && <button type="button" onClick={resetForm} disabled={isSaving}>Cancel</button>}
        </div>
      </form>

      <hr />

      {/* List Section */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rankedAssignments.length === 0 ? <p>No tasks yet. Add one above!</p> : null}
        
        {rankedAssignments.map(task => (
          <div key={task.id} style={{ 
            border: '1px solid #ccc', padding: '8px', borderRadius: '4px',
            opacity: task.status === 'completed' ? 0.6 : 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 4px 0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                {task.title}
              </h4>
              <input 
                type="checkbox" 
                checked={task.status === 'completed'}
                onChange={() => handleToggleComplete(task)}
              />
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
              Due: {new Date(task.dueAt).toLocaleString()} | Score: {task.score.toFixed(3)}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(task)} style={{ fontSize: '12px' }}>Edit</button>
              <button onClick={() => handleDelete(task.id)} style={{ fontSize: '12px', color: 'red' }} disabled={isSaving}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}