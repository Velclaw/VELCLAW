import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, RefreshCw, X, Calendar, Check, ExternalLink, ListTodo } from 'lucide-react';

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

interface GoogleTasksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleTasksDrawer: React.FC<GoogleTasksDrawerProps> = ({ isOpen, onClose }) => {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([
    { id: '@default', title: 'My Tasks' },
    { id: 'devops_tasks', title: 'DevOps & Watson Backlog' }
  ]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTask[]>([
    {
      id: 't1',
      title: 'Audit Cloudant DB cluster shard distribution',
      notes: 'Check watson prune --duplicates report and clean node 03 logs',
      status: 'needsAction',
      due: new Date().toISOString()
    },
    {
      id: 't2',
      title: 'Review TLS 1.3 RFC 8446 cipher suites',
      notes: 'Verify forward secrecy configuration on edge gateway',
      status: 'needsAction'
    },
    {
      id: 't3',
      title: 'Configure Google Tasks API integration',
      notes: 'OAuth 2.0 scopes granted for tasks and tasks.readonly',
      status: 'completed'
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: GoogleTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      notes: newTaskNotes.trim() || undefined,
      status: 'needsAction',
      updated: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskNotes('');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const newStatus = t.status === 'completed' ? 'needsAction' : 'completed';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return t.status === 'needsAction';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-md bg-black border-l-2 border-neutral-800 h-full flex flex-col shadow-2xl text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-400 text-black font-extrabold border-2 border-cyan-300">
              <ListTodo className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">Google Tasks Sync</h2>
              <p className="text-[10px] text-cyan-300 font-bold">Google Workspace Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white rounded-none transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Lists selector & OAuth Status */}
        <div className="p-3 bg-neutral-950 border-b-2 border-neutral-800 flex items-center justify-between gap-2">
          <select
            value={selectedListId}
            onChange={e => setSelectedListId(e.target.value)}
            className="flex-1 bg-black text-cyan-300 text-xs font-extrabold uppercase border-2 border-neutral-700 p-1.5 focus:border-cyan-400 focus:outline-none"
          >
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>
                LIST: {list.title}
              </option>
            ))}
          </select>

          <a
            href="https://tasks.google.com"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-cyan-400 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 hover:bg-cyan-300 transition-all flex items-center gap-1 shrink-0"
            title="Open in Google Tasks"
          >
            <span>Open Tasks</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-1 p-2 bg-black border-b-2 border-neutral-800 text-[11px]">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 font-extrabold uppercase border-2 transition-all cursor-pointer ${
                filter === f
                  ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {f} ({tasks.filter(t => (f === 'active' ? t.status === 'needsAction' : f === 'completed' ? t.status === 'completed' : true)).length})
            </button>
          ))}
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="p-3 bg-black border-b-2 border-neutral-800 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Thêm công việc Google Tasks mới..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-black text-white text-xs font-bold p-2 border-2 border-neutral-700 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-3 py-2 bg-cyan-400 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo</span>
            </button>
          </div>
          {newTaskTitle && (
            <input
              type="text"
              placeholder="Ghi chú thêm (không bắt buộc)..."
              value={newTaskNotes}
              onChange={e => setNewTaskNotes(e.target.value)}
              className="w-full bg-black text-neutral-300 text-[11px] p-1.5 border border-neutral-800 focus:border-cyan-400 focus:outline-none"
            />
          )}
        </form>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-bold uppercase">
              Không có công việc nào trong danh sách.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 bg-black border-2 transition-all space-y-1 ${
                  task.status === 'completed'
                    ? 'border-neutral-800 opacity-60'
                    : 'border-neutral-700 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className="flex items-start space-x-2.5 text-left cursor-pointer group flex-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500 group-hover:text-cyan-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span
                        className={`text-xs font-bold leading-snug block ${
                          task.status === 'completed' ? 'line-through text-neutral-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.notes && (
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-sans leading-relaxed">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    title="Xóa công việc"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t-2 border-neutral-800 bg-black text-center text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>GOOGLE TASKS OAUTH CONNECTED</span>
          <span className="text-neutral-500">SCOPES: TASKS.READONLY / TASKS</span>
        </div>
      </div>
    </div>
  );
};
