import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import type { Task } from './types';

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (newTask: Task) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Add task state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<Task['category']>('Call Candidate');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCandName, setNewCandName] = useState('');

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTask(taskId, { status: targetStatus });
    }
    setDraggedTaskId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      candidateName: newCandName || undefined,
      status: 'todo'
    };

    onAddTask(newTask);
    
    // Reset Form
    setNewTitle('');
    setNewDueDate('');
    setNewCandName('');
    setShowAddForm(false);
  };

  const columns: { key: Task['status']; label: string; color: string }[] = [
    { key: 'todo', label: 'To Do', color: '#ff1744' },
    { key: 'in_progress', label: 'In Progress', color: '#6d28d9' },
    { key: 'completed', label: 'Completed', color: '#059669' }
  ];

  return (
    <div className="tasks-workspace font-sans">
      <div className="tasks-header">
        <div>
          <h1>Recruiter Task Desk</h1>
          <p>Organize screening syncs, credential approvals, background operations, and follow ups.</p>
        </div>
        <button className="btn-primary font-sans" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Inline Form to add tasks */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-task-inline-card animate-slide-up">
          <h3>Create Recruitment Task</h3>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Task Title</label>
              <input 
                type="text" 
                placeholder="e.g. Confirm references for Priya Sharma" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="font-sans"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="font-sans">
                <option value="Review Resume">Review Resume</option>
                <option value="Call Candidate">Call Candidate</option>
                <option value="Schedule Interview">Schedule Interview</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Offer Approval">Offer Approval</option>
                <option value="Background Verification">Background Verification</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)} className="font-sans">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="font-sans"
              />
            </div>
            <div className="form-group">
              <label>Ref Candidate (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Priya Sharma" 
                value={newCandName}
                onChange={(e) => setNewCandName(e.target.value)}
                className="font-sans"
              />
            </div>
          </div>
          <div className="actions">
            <button type="button" className="btn-cancel font-sans" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="btn-submit font-sans">Save Task</button>
          </div>
        </form>
      )}

      {/* Kanban Board columns */}
      <div className="tasks-kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);

          return (
            <div 
              key={col.key} 
              className="tasks-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="col-header" style={{ borderTop: `3px solid ${col.color}` }}>
                <h3>{col.label}</h3>
                <span className="count">{colTasks.length}</span>
              </div>

              <div className="tasks-cards-list scroll-y max-h-500">
                {colTasks.length > 0 ? (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="task-kanban-card animate-fade-in"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="card-top-row">
                        <span className="category">{task.category}</span>
                        <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                      </div>

                      <h4>{task.title}</h4>

                      {task.candidateName && (
                        <div className="card-ref-row">
                          <User size={12} />
                          <span>Cand: {task.candidateName}</span>
                        </div>
                      )}

                      <div className="card-bottom-row">
                        <div className="due-date">
                          <Calendar size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                        <div className="actions">
                          {task.status !== 'completed' ? (
                            <button className="complete-btn" onClick={() => onUpdateTask(task.id, { status: 'completed' })}>
                              <CheckCircle2 size={14} />
                            </button>
                          ) : (
                            <button className="complete-btn completed" disabled>
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="column-empty-state">
                    <AlertCircle size={24} />
                    <p>No tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
