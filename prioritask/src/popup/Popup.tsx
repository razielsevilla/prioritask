import { useState, useEffect } from 'react';
import { repository } from '../storage/repository';
import { rankAssignments } from '../utils/pipeline';
import type { Assignment, AlgorithmMode, ComputedAssignment, UserSettings } from '../types/models';
import { assignmentSchema } from '../types/validators';

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'DDS',
  alpha: 0.5,
  epsilon: 0.1,
  gamma: 0.5,
  defaultNeed: 5,
  uncertaintyDefault: 5,
  availableHoursPerDay: 4,
  reminderWindows: [48, 24, 6],
  checkIntervalMinutes: 30,
  notificationEnabled: true,
  updatedAt: new Date().toISOString(),
};

export default function Popup() {
  const [assignments, setAssignments] = useState<ComputedAssignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<AlgorithmMode>('DDS');

  // Form State
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [effortHours, setEffortHours] = useState<number | ''>('');
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const rawData = await repository.getAssignments();
      const savedSettings = await repository.getSettings();
      const activeSettings = savedSettings ?? DEFAULT_SETTINGS;

      setSettings(activeSettings);
      if (!settings) {
        setMode(activeSettings.defaultMode);
      }

      const ranked = rankAssignments(rawData, activeSettings);
      setAssignments(ranked);
    } catch {
      setStatusMessage('Unable to load tasks or settings. Please reload the extension and try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueAt('');
    setDifficulty('');
    setEffortHours('');
    setMode(settings?.defaultMode ?? DEFAULT_SETTINGS.defaultMode);
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
      mode,
      difficulty: validationResult.data.difficulty,
      benefitPoints: null, 
      weight: null,
      effortHours: validationResult.data.effortHours,
      currentGrade: null,
      status: 'pending',
      createdAt: editingId ? (assignments.find((a) => a.id === editingId)?.createdAt || now) : now,
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
    setMode(assignment.mode);
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

  const isCriticalTask = (task: ComputedAssignment): boolean => {
    return task.safeDaysLeft <= 0.5
      || task.explanationReasons.some((tag) => tag.includes('Critical Risk') || tag.includes('Overdue'));
  };

  return (
    <div style={{ padding: '16px', minWidth: '380px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>PrioriTask</h2>
        <label style={{ fontSize: '12px', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as AlgorithmMode)}>
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

        {settings ? (
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
            Ranking uses your saved settings (alpha {settings.alpha}, epsilon {settings.epsilon}, gamma {settings.gamma}).
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button type="submit" style={{ flex: 1 }} disabled={isSaving}>{isSaving ? 'Saving...' : (editingId ? 'Update Task' : 'Add Task')}</button>
          {editingId && <button type="button" onClick={resetForm} disabled={isSaving}>Cancel</button>}
        </div>
      </form>

      <hr />

      {/* List Section */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.length > 0 ? (
          <p style={{ fontSize: '11px', color: '#666' }}>
            Ranked highest-to-lowest priority. Critical tasks are highlighted.
          </p>
        ) : null}
        {assignments.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No pending tasks. Relax!</p> : null}
        
        {assignments.map((task, index) => {
          const critical = isCriticalTask(task);

          return (
          <div key={task.id} style={{ 
            border: critical ? '1px solid #ef4444' : '1px solid #ccc',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: critical ? '#fff5f5' : '#fff',
            boxShadow: critical ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ minWidth: '34px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  backgroundColor: critical ? '#ef4444' : '#e5e7eb',
                  color: critical ? '#fff' : '#111827',
                  padding: '6px 0'
                }}>
                  #{index + 1}
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>
                  {task.title}
                  {critical ? <span style={{ marginLeft: '6px', fontSize: '10px', color: '#b91c1c' }}>CRITICAL</span> : null}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {task.explanationReasons.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '10px',
                        backgroundColor: '#eee',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: tag.includes('🚨') || tag.includes('⚠️') ? '#d00' : '#444',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007BFF' }}>
                  {task.finalPriorityScore.toFixed(1)}
                </div>
                <div style={{ fontSize: '9px', color: '#999', textTransform: 'uppercase' }}>Priority</div>
              </div>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#666' }}>
              Due: {new Date(task.dueAt).toLocaleString()}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(task)} style={{ fontSize: '11px' }}>Edit</button>
                <button onClick={() => handleDelete(task.id)} style={{ fontSize: '11px', color: 'red' }} disabled={isSaving}>Delete</button>
              </div>
              <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleComplete(task)}
                /> Done
              </label>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}