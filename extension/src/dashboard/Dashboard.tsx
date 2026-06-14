import { useState, useEffect, useMemo, useCallback } from 'react';
import { repository } from '../storage/repository';
import { rankAssignments } from '../utils/pipeline';
import { breakdownTaskWithGemini } from '../utils/ai';
import type { Assignment, ComputedAssignment, UserSettings } from '../types/models';

export default function Dashboard() {
  const [, setAllAssignments] = useState<Assignment[]>([]);
  const [assignments, setAssignments] = useState<ComputedAssignment[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      const rawData = await repository.getAssignments();
      const savedSettings = await repository.getSettings();
      setAllAssignments(rawData);
      setSettings(savedSettings);
      
      if (savedSettings) {
        setAssignments(rankAssignments(rawData, savedSettings));
      }
    } catch {
      setStatusMessage('Error loading tasks.');
    }
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const handleToggleComplete = async (assignment: Assignment) => {
    const newStatus = assignment.status === 'pending' ? 'completed' : 'pending';
    const updated = {
      ...assignment,
      status: newStatus as 'pending' | 'completed',
      updatedAt: new Date().toISOString()
    };
    try {
      await repository.saveAssignment(updated);

      if (updated.parentId) {
        const all = await repository.getAssignments();
        const parent = all.find(a => a.id === updated.parentId);
        if (parent && parent.subtaskIds) {
          if (newStatus === 'completed') {
            const siblings = all.filter(a => parent.subtaskIds?.includes(a.id));
            const allDone = siblings.every(s => s.id === updated.id ? true : s.status === 'completed');
            if (allDone && parent.status !== 'completed') {
              await repository.saveAssignment({ ...parent, status: 'completed', updatedAt: new Date().toISOString() });
            }
          } else if (newStatus === 'pending' && parent.status === 'completed') {
            await repository.saveAssignment({ ...parent, status: 'pending', updatedAt: new Date().toISOString() });
          }
        }
      }
      await loadAssignments();
    } catch {
      setStatusMessage('Error updating status.');
    }
  };

  const handleBreakdown = async (task: Assignment) => {
    try {
      setBreakingDownId(task.id);
      setStatusMessage('AI is breaking down task...');
      const subTasksGenerated = await breakdownTaskWithGemini(task, settings?.geminiApiKey);
      
      const subtaskIds: string[] = [];
      for (const st of subTasksGenerated) {
        const id = crypto.randomUUID();
        subtaskIds.push(id);
        const newSt: Assignment = {
          id,
          title: st.title,
          dueAt: st.dueAt,
          tShirtSize: st.tShirtSize,
          status: 'pending',
          course: task.course,
          parentId: task.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await repository.saveAssignment(newSt);
      }
      
      const updatedParent: Assignment = {
        ...task,
        subtaskIds: [...(task.subtaskIds || []), ...subtaskIds],
        updatedAt: new Date().toISOString(),
      };
      await repository.saveAssignment(updatedParent);
      await loadAssignments();
      setStatusMessage('Task broken down successfully! ✨');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to breakdown task.');
      console.error(err);
    } finally {
      setBreakingDownId(null);
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
    return task.safeDaysLeft <= 0.5 || task.explanationReasons.some((tag) => tag.includes('Critical Risk') || tag.includes('Overdue'));
  };

  const pendingAssignments = useMemo(() => assignments.filter(t => t.status !== 'completed'), [assignments]);
  const nowTasks = pendingAssignments.filter(t => t.bucket === 'NOW');
  const nextTasks = pendingAssignments.filter(t => t.bucket === 'NEXT');
  const laterTasks = pendingAssignments.filter(t => t.bucket === 'LATER');

  const renderTask = (task: ComputedAssignment, index: number) => {
    const critical = isCriticalTask(task);
    const isParent = task.subtaskIds && task.subtaskIds.length > 0;
    const isSubtask = !!task.parentId;
    const canBreakdown = !isParent && !isSubtask && (task.tShirtSize === 'M' || task.tShirtSize === 'L') && task.status !== 'completed';

    return (
      <div key={task.id} className="retro-window" style={{ marginBottom: '16px', opacity: isSubtask ? 0.9 : 1, transform: isSubtask ? 'scale(0.98)' : 'none', marginLeft: isSubtask ? '12px' : '0' }}>
        <div className={`retro-titlebar ${critical ? 'critical' : ''}`}>
          <span>#{index + 1} {task.title.substring(0,30)}{task.title.length > 30 ? '...' : ''}</span>
          <div className="title-btns">
            {canBreakdown && (
              <button className="title-btn" style={{ width: 'auto', padding: '0 4px', fontSize: '10px' }} onClick={() => handleBreakdown(task)} disabled={breakingDownId !== null}>
                {breakingDownId === task.id ? '...' : '✨'}
              </button>
            )}
            <button className="title-btn" onClick={() => handleDelete(task.id)}>X</button>
          </div>
        </div>
        
        <div style={{ padding: '16px', backgroundColor: critical ? 'rgba(255, 0, 60, 0.1)' : 'transparent' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px' }}>
              <strong>Due:</strong> {new Date(task.dueAt).toLocaleString()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'var(--font-vt323)' }}>
                {task.pressureScore.toFixed(2)}
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>Pressure</div>
            </div>
          </div>

          <div className="retro-inset" style={{ marginBottom: '12px', fontSize: '14px', padding: '8px' }}>
            <strong>Size:</strong> {task.tShirtSize} | <strong>Safe Days:</strong> {Math.floor(task.safeDaysLeft)}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {task.explanationReasons.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            {isParent ? (
              <span style={{ fontSize: '14px', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>[ Parent Task - Complete Subtasks ]</span>
            ) : (
              <label style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontFamily: 'var(--font-vt323)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleComplete(task)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                /> DONE
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--font-pixel)' }}>
      {/* HEADER */}
      <div className="retro-window" style={{ marginBottom: '32px' }}>
        <div className="retro-titlebar">
          <span>PRIORITASK_OS.exe - IMMERSIVE DASHBOARD</span>
          <div className="title-btns">
            <button className="title-btn" onClick={() => window.close()}>X</button>
          </div>
        </div>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
          <h1 style={{ fontSize: '32px', margin: 0, color: 'var(--accent-primary)', letterSpacing: '4px' }}>✦ PRIORITASK DASHBOARD ✦</h1>
          <p style={{ fontFamily: 'var(--font-vt323)', fontSize: '20px', margin: 0, color: 'var(--text-secondary)' }}>Master your pipeline. Defeat decision fatigue.</p>
        </div>
      </div>
      
      {statusMessage && (
        <div className="retro-inset" style={{ marginBottom: '24px', padding: '16px', background: 'var(--accent-secondary)', color: 'black', fontFamily: 'var(--font-vt323)', fontSize: '20px', textAlign: 'center' }}>
          {statusMessage}
        </div>
      )}

      {/* KANBAN BOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* NOW COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="retro-window" style={{ border: '1px solid var(--accent-primary)' }}>
            <div className="retro-titlebar" style={{ background: 'var(--accent-primary)', color: 'white', borderBottomColor: 'var(--accent-primary)', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>[ NOW ]</span>
            </div>
          </div>
          {nowTasks.length === 0 ? (
             <div className="retro-inset" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No immediate tasks.</div>
          ) : (
            nowTasks.map((t, i) => renderTask(t, i))
          )}
        </div>

        {/* NEXT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="retro-window" style={{ border: '1px solid orange' }}>
            <div className="retro-titlebar" style={{ background: 'orange', color: 'black', borderBottomColor: 'orange', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>[ NEXT ]</span>
            </div>
          </div>
          {nextTasks.length === 0 ? (
             <div className="retro-inset" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No upcoming tasks.</div>
          ) : (
            nextTasks.map((t, i) => renderTask(t, i))
          )}
        </div>

        {/* LATER COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="retro-window" style={{ border: '1px solid var(--success)' }}>
            <div className="retro-titlebar" style={{ background: 'var(--success)', color: 'black', borderBottomColor: 'var(--success)', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>[ LATER ]</span>
            </div>
          </div>
          {laterTasks.length === 0 ? (
             <div className="retro-inset" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Empty backlog.</div>
          ) : (
            laterTasks.map((t, i) => renderTask(t, i))
          )}
        </div>

      </div>
    </div>
  );
}
