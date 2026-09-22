import { useState } from 'react';
import { notifications } from '../data/mock';
import type { Notification } from '../data/mock';

interface Props {
  onNavigate: (page: string) => void;
}

const TYPE_STYLES = {
  success: { bg: 'bg-success-bg', border: 'border-green-200', icon: 'text-success', dot: 'bg-success' },
  info: { bg: 'bg-[#E0F2FE]', border: 'border-[#BAE6FD]', icon: 'text-[#0369A1]', dot: 'bg-[#0284C7]' },
  warning: { bg: 'bg-warning-bg', border: 'border-yellow-300', icon: 'text-warning', dot: 'bg-[#F59E0B]' },
  danger: { bg: 'bg-danger-bg', border: 'border-red-200', icon: 'text-danger', dot: 'bg-danger' },
};

function TypeIcon({ type }: { type: Notification['type'] }) {
  if (type === 'success') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
  if (type === 'warning') return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
  );
  if (type === 'danger') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

export default function NotificationsPage({ onNavigate }: Props) {
  const [readState, setReadState] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map(n => [n.id, n.read]))
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  function markRead(id: string) { setReadState(s => ({ ...s, [id]: true })); }
  function markAllRead() { setReadState(Object.fromEntries(notifications.map(n => [n.id, true]))); }

  const unreadCount = notifications.filter(n => !readState[n.id]).length;
  const displayed = notifications.filter(n => filter === 'all' || !readState[n.id]);

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${filter === 'all' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors flex items-center gap-2 ${filter === 'unread' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="bg-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-navy text-sm font-medium hover:underline">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-border shadow-sm">
            <svg className="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <p className="text-muted font-medium">Aucune notification</p>
            {filter === 'unread' && <p className="text-muted/60 text-sm mt-1">Toutes vos notifications ont été lues</p>}
          </div>
        ) : displayed.map(n => {
          const isRead = readState[n.id];
          const style = TYPE_STYLES[n.type];
          return (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-xl border shadow-sm transition-all ${
                isRead ? 'bg-white border-border' : `${style.bg} ${style.border}`
              }`}
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${isRead ? 'bg-slate-100 text-muted' : `${style.bg} ${style.icon}`}`}>
                <TypeIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${isRead ? 'text-ink' : 'text-ink'}`}>
                      {!isRead && <span className={`inline-block w-2 h-2 rounded-full ${style.dot} mr-2 align-middle`}/>}
                      {n.title}
                    </p>
                    <p className="text-muted text-sm mt-0.5">{n.body}</p>
                    <p className="text-muted/60 text-xs mt-1.5">
                      {new Date(n.createdAt).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })} à{' '}
                      {new Date(n.createdAt).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="flex-shrink-0 text-xs text-muted hover:text-ink transition-colors whitespace-nowrap mt-0.5"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length > 0 && (
        <p className="text-center text-muted text-xs py-4">
          {displayed.length} notification(s) affichée(s)
        </p>
      )}
    </div>
  );
}
