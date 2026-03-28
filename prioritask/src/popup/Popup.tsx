import { useState, useEffect } from 'react';
import { repository } from '../storage/repository';
import type { Assignment, AlgorithmMode } from '../types/models';
import { assignmentSchema } from '../types/validators';

export default function Popup() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [mode, setMode] = useState<AlgorithmMode>('DDS');
  const [difficulty, setDifficulty] = useState<number | ''>('');
  const [effortHours, setEffortHours] = useState<number | ''>('');
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data for validation
    const formData = {
      title,
      dueAt,
      mode,
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
      mode: validationResult.data.mode,
      difficulty: validationResult.data.difficulty,
      benefitPoints: null, 
      weight: null,
      effortHours: validationResult.data.effortHours,
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
    setDueAt(new Date(assignment.dueAt).toISOString().slice(0, 16));
    setMode(assignment.mode);
    setDifficulty(assignment.difficulty || '');
    setEffortHours(assignment.effortHours || '');
    setErrors({});
  };

  const handleToggleComplete = async (assignment: Assignment) => {
    const updated = {
      ...assignment,
      status: (assignment.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed',
      updatedAt: new Date().toISOString()
    };
    await repository.saveAssignment(updated);
    await loadAssignments();
  };

  const handleDelete = async (id: string) => {
    await repository.deleteAssignment(id);
    await loadAssignments();
  };

  return (
    <div style={{ padding: '16px', minWidth: '350px', fontFamily: 'sans-serif' }}>
      <h2>PrioriTask</h2>
      
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

        <select value={mode} onChange={(e) => setMode(e.target.value as AlgorithmMode)}>
          <option value="DDS">DDS (Due Date)</option>
          <option value="DoD">DoD (Difficulty)</option>
          <option value="B2D">B2D (Benefit/Effort)</option>
        </select>

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