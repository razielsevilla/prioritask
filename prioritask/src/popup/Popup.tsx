import { useState, useEffect, useMemo } from 'react';
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
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [assignments, setAssignments] = useState<ComputedAssignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<AlgorithmMode>('DDS');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'overdue' | 'completed'>('all');

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

      setAllAssignments(rawData);
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
      createdAt: editingId ? (allAssignments.find((a) => a.id === editingId)?.createdAt || now) : now,
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

  const getConfidenceForTask = (task: ComputedAssignment): {
    label: 'High' | 'Medium' | 'Low';
    defaultsUsed: string[];
  } => {
    const defaultsUsed: string[] = [];

    if (task.mode === 'DoD' && task.difficulty == null) {
      defaultsUsed.push('difficulty');
    }

    if (task.mode === 'B2D') {
      if (task.difficulty == null) {
        defaultsUsed.push('difficulty');
      }
      if (task.benefitPoints == null) {
        defaultsUsed.push('benefit');
      }
    }

    if (task.mode === 'EoC') {
      if (task.weight == null) {
        defaultsUsed.push('weight');
      }
      if (task.benefitPoints == null) {
        defaultsUsed.push('benefit');
      }
      if (task.currentGrade == null) {
        defaultsUsed.push('grade need');
      }
      if (task.effortHours == null) {
        defaultsUsed.push('effort');
      }
    }

    if (defaultsUsed.length === 0) {
      return { label: 'High', defaultsUsed };
    }

    if (defaultsUsed.length <= 1) {
      return { label: 'Medium', defaultsUsed };
    }

    return { label: 'Low', defaultsUsed };
  };

  const getWhyRankedHere = (task: ComputedAssignment): string => {
    if (task.explanationReasons.length > 0) {
      return task.explanationReasons.slice(0, 2).join(' + ');
    }

    if (task.safeDaysLeft <= 1) {
      return 'Due very soon';
    }

    return 'Balanced by urgency and effort';
  };

  const filteredAssignments = useMemo<ComputedAssignment[]>(() => {
    const now = new Date();
    const nowTime = now.getTime();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowStart = todayStart + (24 * 60 * 60 * 1000);
    const weekEnd = nowTime + (7 * 24 * 60 * 60 * 1000);

    if (activeFilter === 'completed') {
      return allAssignments
        .filter((task) => task.status === 'completed')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((task) => ({
          ...task,
          safeDaysLeft: 999,
          baseScore: 0,
          riskScore: 0,
          finalPriorityScore: 0,
          explanationReasons: ['Completed'],
        }));
    }

    if (activeFilter === 'today') {
      return assignments.filter((task) => {
        const dueTime = new Date(task.dueAt).getTime();
        return dueTime >= todayStart && dueTime < tomorrowStart;
      });
    }

    if (activeFilter === 'week') {
      return assignments.filter((task) => {
        const dueTime = new Date(task.dueAt).getTime();
        return dueTime >= nowTime && dueTime <= weekEnd;
      });
    }

    if (activeFilter === 'overdue') {
      return assignments.filter((task) => new Date(task.dueAt).getTime() < nowTime);
    }

    return assignments;
  }, [activeFilter, assignments, allAssignments]);

  const filteredAssignmentsForLabel = (filter: 'today' | 'week' | 'overdue' | 'completed'): number => {
    const now = new Date();
    const nowTime = now.getTime();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowStart = todayStart + (24 * 60 * 60 * 1000);
    const weekEnd = nowTime + (7 * 24 * 60 * 60 * 1000);

    if (filter === 'completed') {
      return allAssignments.filter((task) => task.status === 'completed').length;
    }

    if (filter === 'today') {
      return assignments.filter((task) => {
        const dueTime = new Date(task.dueAt).getTime();
        return dueTime >= todayStart && dueTime < tomorrowStart;
      }).length;
    }

    if (filter === 'week') {
      return assignments.filter((task) => {
        const dueTime = new Date(task.dueAt).getTime();
        return dueTime >= nowTime && dueTime <= weekEnd;
      }).length;
    }

    return assignments.filter((task) => new Date(task.dueAt).getTime() < nowTime).length;
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${assignments.length})` },
            { key: 'today', label: `Today (${filteredAssignmentsForLabel('today')})` },
            { key: 'week', label: `This Week (${filteredAssignmentsForLabel('week')})` },
            { key: 'overdue', label: `Overdue (${filteredAssignmentsForLabel('overdue')})` },
            { key: 'completed', label: `Completed (${filteredAssignmentsForLabel('completed')})` },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key as 'all' | 'today' | 'week' | 'overdue' | 'completed')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '999px',
                border: activeFilter === filter.key ? '1px solid #2563eb' : '1px solid #d1d5db',
                backgroundColor: activeFilter === filter.key ? '#eff6ff' : '#fff',
                color: activeFilter === filter.key ? '#1d4ed8' : '#374151',
                cursor: 'pointer',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {assignments.length > 0 ? (
          <p style={{ fontSize: '11px', color: '#666' }}>
            Ranked highest-to-lowest priority. Critical tasks are highlighted.
          </p>
        ) : null}
        {filteredAssignments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            {activeFilter === 'today' && 'No tasks due today.'}
            {activeFilter === 'week' && 'No tasks due this week.'}
            {activeFilter === 'overdue' && 'No overdue tasks. Great job!'}
            {activeFilter === 'completed' && 'No completed tasks yet.'}
            {activeFilter === 'all' && 'No pending tasks. Relax!'}
          </p>
        ) : null}
        
        {filteredAssignments.map((task, index) => {
          const critical = isCriticalTask(task);
          const confidence = getConfidenceForTask(task);

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
                <p style={{ fontSize: '11px', color: '#4b5563', marginBottom: '6px' }}>
                  Why here: {getWhyRankedHere(task)}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007BFF' }}>
                  {task.finalPriorityScore.toFixed(1)}
                </div>
                <div style={{ fontSize: '9px', color: '#999', textTransform: 'uppercase' }}>Priority</div>
                <div style={{
                  marginTop: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: confidence.label === 'High' ? '#065f46' : confidence.label === 'Medium' ? '#92400e' : '#991b1b'
                }}>
                  Confidence: {confidence.label}
                </div>
                {confidence.defaultsUsed.length > 0 ? (
                  <div style={{ fontSize: '9px', color: '#6b7280', maxWidth: '120px' }}>
                    Defaults used: {confidence.defaultsUsed.join(', ')}
                  </div>
                ) : null}
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