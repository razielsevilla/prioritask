import { useState, useEffect } from 'react';
import { repository } from '../storage/repository';
import type { Assignment, AlgorithmMode } from '../types/models';

export default function Popup() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [mode, setMode] = useState<AlgorithmMode>('DDS');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [effortHours, setEffortHours] = useState<number | ''>('');

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const data = await repository.getAssignments();
    setAssignments(data);
  };

  const resetForm = () => {
    setTitle('');
    setDueAt('');
    setMode('DDS');
    setDifficulty('');
    setEffortHours('');
    setEditingId(null);
  };

  // [x] Create / Edit Flow
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueAt) return alert('Title and Due Date are required!');

    const now = new Date().toISOString();
    
    const newAssignment: Assignment = {
      id: editingId || crypto.randomUUID(),
      title,
      course: null,
      dueAt: new Date(dueAt).toISOString(),
      mode,
      difficulty: difficulty === '' ? null : Number(difficulty),
      benefitPoints: null, // Can add UI for this later
      weight: null,
      effortHours: effortHours === '' ? null : Number(effortHours),
      currentGrade: null,
      status: 'pending',
      createdAt: editingId ? (assignments.find(a => a.id === editingId)?.createdAt || now) : now,
      updatedAt: now,
    };

    await repository.saveAssignment(newAssignment);
    await loadAssignments();
    resetForm();
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    // Format ISO string for datetime-local input
    setDueAt(new Date(assignment.dueAt).toISOString().slice(0, 16));
    setMode(assignment.mode);
    setDifficulty(assignment.difficulty || '');
    setEffortHours(assignment.effortHours || '');
  };

  // [x] Complete Toggle Flow
  const handleToggleComplete = async (assignment: Assignment) => {
    const updated = {
      ...assignment,
      status: (assignment.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed',
      updatedAt: new Date().toISOString()
    };
    await repository.saveAssignment(updated);
    await loadAssignments();
  };

  // [x] Delete Flow
  const handleDelete = async (id: string) => {
    await repository.deleteAssignment(id);
    await loadAssignments();
  };

  return (
    <div style={{ padding: '16px', minWidth: '350px', fontFamily: 'sans-serif' }}>
      <h2>PrioriTask</h2>
      
      {/* Form Section */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" placeholder="Task Title" value={title} 
          onChange={(e) => setTitle(e.target.value)} required 
        />
        <input 
          type="datetime-local" value={dueAt} 
          onChange={(e) => setDueAt(e.target.value)} required 
        />
        <select value={mode} onChange={(e) => setMode(e.target.value as AlgorithmMode)}>
          <option value="DDS">DDS (Due Date)</option>
          <option value="DoD">DoD (Difficulty)</option>
          <option value="B2D">B2D (Benefit/Effort)</option>
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="number" placeholder="Difficulty (1-10)" min="1" max="10" 
            value={difficulty} onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : '')} 
            style={{ width: '50%' }}
          />
          <input 
            type="number" placeholder="Effort (Hrs)" min="0.5" step="0.5" 
            value={effortHours} onChange={(e) => setEffortHours(e.target.value ? Number(e.target.value) : '')} 
            style={{ width: '50%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" style={{ flex: 1 }}>{editingId ? 'Update Task' : 'Add Task'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <hr />

      {/* List Section */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.length === 0 ? <p>No tasks yet. Add one above!</p> : null}
        
        {assignments.map(task => (
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
              Due: {new Date(task.dueAt).toLocaleString()} | Mode: {task.mode}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(task)} style={{ fontSize: '12px' }}>Edit</button>
              <button onClick={() => handleDelete(task.id)} style={{ fontSize: '12px', color: 'red' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}