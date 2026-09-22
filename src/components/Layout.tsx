import type { ReactNode } from 'react';
import { useState } from 'react';
import Logo from './Logo';
import { notifications } from '../data/mock';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: ReactNode;
  pageTitle: string;
  breadcrumb?: string;
}

export default function Layout({
  currentPage, onNavigate, onLogout, children, pageTitle, breadcrumb
}: LayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const unread = notifications.filter(n => !n.read).length;

  const navSections: NavSection[] = [
    {
      title: 'Général',
      items: [
        { id: 'admin-dashboard', label: 'Tableau de bord', icon: <HomeIcon /> },
        { id: 'fleet-missions', label: 'Missions', icon: <ListIcon /> },
        { id: 'admin-drivers', label: 'Conducteurs', icon: <WheelIcon /> },
        { id: 'admin-vehicles', label: 'Véhicules', icon: <TruckIcon /> },
      ],
    },
    {
      title: 'Outils',
      items: [
        { id: 'admin-structures', label: 'Paramètres', icon: <SettingsIcon /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon />, badge: unread || undefined },
        { id: 'help', label: 'Aide & feedback', icon: <HelpIcon /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-navy-sidebar border-r border-navy-dark"
        style={{ width: sidebarOpen ? '260px' : '0px', minWidth: sidebarOpen ? '260px' : '0px' }}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0">
          <Logo />
        </div>

        {/* User avatar strip */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">NF</div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-none truncate">Nadia Ferdi</p>
              <p className="text-white/60 text-xs mt-1 truncate">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-6 mt-2">
          {navSections.map(section => (
            <div key={section.title}>
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider px-2 mb-2 whitespace-nowrap">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(item => {
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap group ${
                        active
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={`flex-shrink-0 transition-colors ${active ? 'text-orange' : 'text-white/40 group-hover:text-white/70'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto bg-orange text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {item.badge}
                        </span>
                      ) : active ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange flex-shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap group"
          >
            <span className="flex-shrink-0 text-white/40 group-hover:text-white/70">
              <LogoutIcon />
            </span>
            <span>Se déconnecter</span>
          </button>
          <p className="text-white/30 text-[10px] text-center mt-3 font-medium tracking-wide">DOT · Algérie Télécom</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            title={sidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-muted flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div className="w-px h-5 bg-border flex-shrink-0" />

          <div className="flex-1 min-w-0">
            {breadcrumb && <p className="text-muted text-xs mb-0.5">{breadcrumb}</p>}
            <h1 className="text-ink text-lg font-semibold truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange rounded-full ring-2 ring-white" />
              )}
            </button>

            <div className="h-6 w-px bg-border" />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white text-xs font-bold">NF</div>
                <div className="text-left hidden sm:block">
                  <p className="text-ink text-sm font-medium leading-none">Nadia Ferdi</p>
                  <p className="text-muted text-xs mt-0.5">Administrateur</p>
                </div>
                <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-ink">Nadia Ferdi</p>
                    <p className="text-xs text-muted">ALT-0120 · DOT</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onNavigate('admin-structures'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                  >
                    Paramètres
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>
  );
}

function WheelIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="3"/>
      <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zm0 0l3-4h2l2 4-1 2H13"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  );
}
