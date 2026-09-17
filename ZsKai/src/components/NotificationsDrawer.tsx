import React from 'react';
import { X, Bell, Sparkles, ShieldCheck, Activity, Check } from 'lucide-react';
import { PushNotification } from '../types/shell';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-sm bg-black border-l-2 border-neutral-800 h-full flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-tight">Push Notifications</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="px-2 py-1 text-[10px] font-extrabold bg-black text-cyan-300 hover:bg-neutral-900 border-2 border-neutral-700 hover:border-cyan-400 rounded-none uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-3 h-3 text-cyan-400" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white rounded-none transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-bold uppercase">
              No recent notifications.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-none border-2 text-xs transition-all space-y-1.5 ${
                  n.read
                    ? 'bg-black border-neutral-800 text-neutral-400'
                    : 'bg-black border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
                    {n.type === 'ai' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                    {n.type === 'success' && <Activity className="w-3.5 h-3.5 text-cyan-300" />}
                    {n.type === 'warning' && <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />}
                    {n.title}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold bg-neutral-900 px-1.5 py-0.5 border border-neutral-700">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-neutral-300 font-medium leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-neutral-800 bg-black text-center text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">
          Watson Cloudant Notification System Active
        </div>
      </div>
    </div>
  );
};

