import { useState, useEffect, useMemo, useCallback } from 'react';
import { repository } from '../storage/repository';
import { rankAssignments } from '../utils/pipeline';
import { evaluateAddPrioritizeFlow } from '../utils/usability';
import type { Assignment, TShirtSize, ComputedAssignment, UserSettings } from '../types/models';
import { assignmentSchema } from '../types/validators';

const DEFAULT_SETTINGS: UserSettings = {
  epsilon: 0.1,
  availableHoursPerDay: 4,
  defaultTShirtSize: 'M',
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'overdue' | 'completed'>('all');
  const [flowStartAt, setFlowStartAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // UI Persistence
  useEffect(() => {
    chrome.storage.local.get(['prioritask_activeTab', 'prioritask_activeFilter'], (res) => {
      if (res.prioritask_activeTab) {
        setActiveTab(res.prioritask_activeTab as 'list' | 'add');
      }
      if (res.prioritask_activeFilter) {
        setActiveFilter(res.prioritask_activeFilter as 'all' | 'today' | 'week' | 'overdue' | 'completed');
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ 
      prioritask_activeTab: activeTab, 
      prioritask_activeFilter: activeFilter 
    });
  }, [activeTab, activeFilter]);

  // Form State
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [tShirtSize, setTShirtSize] = useState<TShirtSize>('M');
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadAssignments = useCallback(async () => {
    try {
      const rawData = await repository.getAssignments();
      const savedSettings = await repository.getSettings();
      const activeSettings = savedSettings ?? DEFAULT_SETTINGS;
      setAllAssignments(rawData);
      setSettings(activeSettings);
      setAssignments(rankAssignments(rawData, activeSettings));
    } catch {
      setStatusMessage('Error loading tasks.');
    }
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const resetForm = () => {
    setTitle('');
    setDueAt('');
    setTShirtSize(settings?.defaultTShirtSize ?? 'M');
    setEditingId(null);
    setErrors({});
    setFlowStartAt(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    
    const formData = {
      title: title.trim(),
      dueAt,
      tShirtSize,
    };

    const validationResult = assignmentSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    const now = new Date().toISOString();
    
    const newAssignment: Assignment = {
      id: editingId || crypto.randomUUID(),
      title: validationResult.data.title,
      course: null,
      dueAt: new Date(validationResult.data.dueAt).toISOString(),
      tShirtSize: validationResult.data.tShirtSize,
      status: 'pending',
      createdAt: editingId ? (allAssignments.find((a) => a.id === editingId)?.createdAt || now) : now,
      updatedAt: now,
    };

    try {
      setIsSaving(true);
      await repository.saveAssignment(newAssignment);
      await loadAssignments();
      const flowFeedback = !editingId && flowStartAt != null
        ? evaluateAddPrioritizeFlow(Date.now() - flowStartAt)
        : null;
      resetForm();
      setActiveTab('list');
      setStatusMessage(
        editingId
          ? 'Task updated.'
          : flowFeedback
            ? `Task added. ${flowFeedback.message}`
            : 'Task added.'
      );
    } catch {
      setStatusMessage('Unable to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setDueAt(new Date(assignment.dueAt).toISOString().slice(0, 16));
    setTShirtSize(assignment.tShirtSize ?? 'M');
    setErrors({});
    setStatusMessage('');
    setFlowStartAt(null);
    setActiveTab('add');
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
    } catch {
      setStatusMessage('Error updating status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await repository.deleteAssignment(id);
      await loadAssignments();
    } catch {
      setStatusMessage('Error deleting task.');
    }
  };

  const isCriticalTask = (task: ComputedAssignment): boolean => {
    return task.safeDaysLeft <= 0.5
      || task.explanationReasons.some((tag) => tag.includes('Critical Risk') || tag.includes('Overdue'));
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
          pressureScore: 0,
          fsrRatio: 0,
          bucket: 'LATER',
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
    <div style={{ padding: '16px' }}>
      
      {/* HEADER */}
      <div className="retro-window" style={{ marginBottom: '16px' }}>
        <div className="retro-titlebar">
          <span>PrioriTask_2000.exe</span>
          <div className="title-btns">
            <button className="title-btn">_</button>
            <button className="title-btn">□</button>
            <button className="title-btn">X</button>
          </div>
        </div>
        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px', color: 'var(--accent-primary)', textShadow: '1px 1px 0 var(--border-dark)' }}>💿 PrioriTask</h2>
        </div>
      </div>
      
      {statusMessage && (
        <div className="retro-inset" style={{ marginBottom: '16px', background: 'var(--accent-secondary)', color: 'black', fontFamily: 'var(--font-vt323)' }}>
          {statusMessage}
        </div>
      )}

      {/* GAMIFICATION PET */}
      {(() => {
        const pending = assignments.filter(t => t.status !== 'completed');
        const hasOverdue = pending.some(t => new Date(t.dueAt).getTime() < Date.now());
        const hasCritical = pending.some(t => t.fsrRatio >= 0.75);
        
        let petStatus = '💅';
        let petMessage = 'All good, bestie!';
        let bg = '#FDF4FF';
        
        if (hasOverdue) {
          petStatus = '😵';
          petMessage = 'Tasks are overdue!!';
          bg = '#ffcccc';
        } else if (hasCritical) {
          petStatus = '😨';
          petMessage = 'Critical workload!';
          bg = '#ffe5b4';
        } else if (pending.length > 0) {
          petStatus = '💻';
          petMessage = 'Time to grind!';
        }

        return (
          <div className="retro-inset" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', background: bg, padding: '8px' }}>
            <div style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))' }}>{petStatus}</div>
            <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', color: 'black', fontWeight: 'bold' }}>
              <div>{petMessage}</div>
            </div>
          </div>
        );
      })()}
      
      {/* TABS */}
      <div className="retro-tabs">
        <button 
          className={`retro-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Task List
        </button>
        <button 
          className={`retro-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ {editingId ? 'Edit Task' : 'Add Task'}
        </button>
      </div>
      
      {activeTab === 'add' && (
        <div className="retro-window">
          <div className="retro-titlebar">
          <span>{editingId ? 'edit_task.bat' : 'add_task.bat'}</span>
        </div>
        <form onSubmit={handleSave} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <input 
              type="text" placeholder="Task Title" value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingId && flowStartAt == null && e.target.value.trim().length > 0) {
                  setFlowStartAt(Date.now());
                }
              }} 
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
            <div style={{ width: '100%' }}>
              <select 
                value={tShirtSize} 
                onChange={(e) => setTShirtSize(e.target.value as TShirtSize)}
                style={{ width: '100%', borderColor: errors.tShirtSize ? 'red' : '', padding: '4px' }}
                className="retro-inset"
              >
                <option value="S">Small (~1 Hour)</option>
                <option value="M">Medium (~3 Hours)</option>
                <option value="L">Large (~8 Hours)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="retro-btn primary" style={{ flex: 1 }} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingId ? 'Update Task' : 'Add Task')}
            </button>
            {editingId && (
              <button type="button" className="retro-btn danger" onClick={resetForm} disabled={isSaving}>Cancel</button>
            )}
          </div>
        </form>
      </div>
      )}

      {activeTab === 'list' && (
        <>
          {/* FILTER BAR */}
      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {[
          { key: 'all', label: `All (${assignments.length})` },
          { key: 'today', label: `Today (${filteredAssignmentsForLabel('today')})` },
          { key: 'week', label: `Week (${filteredAssignmentsForLabel('week')})` },
          { key: 'overdue', label: `Overdue (${filteredAssignmentsForLabel('overdue')})` },
          { key: 'completed', label: `Done (${filteredAssignmentsForLabel('completed')})` },
        ].map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key as any)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div style={{ height: '8px' }}></div>

      {/* TASK LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* DO THIS FIRST BANNER */}
        {filteredAssignments.length > 0 && activeFilter !== 'completed' && filteredAssignments[0].bucket === 'NOW' && (
          <div className="retro-window" style={{ borderColor: 'var(--accent-secondary)', backgroundColor: '#E0FFFF' }}>
            <div className="retro-titlebar" style={{ background: 'var(--accent-secondary)', color: 'black', borderBottomColor: 'black' }}>
              <span>🌟 TOP PRIORITY 🌟</span>
            </div>
            <div style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', margin: '0 0 8px 0', color: 'black' }}>
                Your immediate focus is:
              </p>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--accent-primary)', textShadow: '1px 1px 0px white', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                {filteredAssignments[0].title}
              </h3>
              <div className="retro-inset" style={{ display: 'inline-block', backgroundColor: 'white', padding: '4px 8px', fontFamily: 'var(--font-vt323)', fontSize: '14px' }}>
                Pressure Score: <strong>{filteredAssignments[0].pressureScore.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        {filteredAssignments.length === 0 ? (
          <div className="retro-inset" style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px' }}>
              {activeFilter === 'today' && 'No tasks due today. ✨'}
              {activeFilter === 'week' && 'No tasks due this week. 🌸'}
              {activeFilter === 'overdue' && 'No overdue tasks. Great job! 💿'}
              {activeFilter === 'completed' && 'No completed tasks yet.'}
              {activeFilter === 'all' && 'No pending tasks. Relax! 💅'}
            </p>
          </div>
        ) : null}
        
        {filteredAssignments.map((task, index) => {
          const critical = isCriticalTask(task);
          
          const previousTask = index > 0 ? filteredAssignments[index - 1] : null;
          const showBucketBanner = activeFilter === 'all' && (!previousTask || previousTask.bucket !== task.bucket);

          return (
            <div key={task.id}>
              {showBucketBanner && (
                <div style={{ 
                  margin: '16px 0 8px 0', 
                  fontFamily: 'var(--font-pixel)', 
                  color: task.bucket === 'NOW' ? 'red' : task.bucket === 'NEXT' ? 'orange' : 'green',
                  textShadow: '1px 1px 0px white'
                }}>
                  === [ {task.bucket} ] ===
                </div>
              )}
            <div className="retro-window">
            <div className={`retro-titlebar ${critical ? 'critical' : ''}`}>
              <span>#{index + 1} {task.title.substring(0,20)}{task.title.length > 20 ? '...' : ''}</span>
              <div className="title-btns">
                <button className="title-btn" onClick={() => handleEdit(task)}>E</button>
                <button className="title-btn" onClick={() => handleDelete(task.id)}>X</button>
              </div>
            </div>
            
            <div style={{ padding: '8px', backgroundColor: critical ? '#fff5f5' : 'var(--surface)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '16px' }}>
                  <strong>Due:</strong> {new Date(task.dueAt).toLocaleString()}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'var(--font-vt323)' }}>
                    {task.pressureScore.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>Pressure</div>
                </div>
              </div>

              <div className="retro-inset" style={{ marginBottom: '8px', fontSize: '12px' }}>
                <strong>Size:</strong> {task.tShirtSize} | <strong>Safe Days:</strong> {Math.floor(task.safeDaysLeft)}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {task.explanationReasons.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontFamily: 'var(--font-vt323)' }}>
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleComplete(task)}
                    style={{ width: '16px', height: '16px' }}
                  /> DONE
                </label>
              </div>
            </div>
          </div>
          </div>
        );})}
      </div>
        </>
      )}
    </div>
  );
}