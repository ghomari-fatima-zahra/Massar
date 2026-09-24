import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Bell,
  CaretDown,
  CaretRight,
  Check,
  Gear,
  House,
  List as Menu,
  ListChecks,
  MagnifyingGlass,
  SignOut,
  Truck,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { missions, notifications } from '../data/mock';

const imgLogo = '/assets/b6cbb.svg';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: ReactNode;
  pageTitle: string;
  breadcrumb?: string;
}

const PAGE_LABELS: Record<string, string> = {
  'admin-dashboard': 'Tableau de bord',
  'fleet-missions': 'Missions',
  'new-mission': 'Nouvelle mission',
  'mission-detail': 'Détail de la mission',
  'admin-drivers': 'Conducteurs',
  'admin-vehicles': 'Véhicules',
  'admin-structures': 'Structures organisationnelles',
  notifications: 'Notifications',
  parametres: 'Paramètres',
};

const navItems = [
  { id: 'admin-dashboard', label: 'Tableau de bord', icon: House },
  { id: 'fleet-missions', label: 'Missions', icon: ListChecks, badgeKey: 'pending' as const },
  { id: 'admin-drivers', label: 'Conducteurs', icon: UsersThree },
  { id: 'admin-vehicles', label: 'Véhicules', icon: Truck },
];

const toolItems = [
  { id: 'parametres', label: 'Paramètres', icon: Gear },
];

export default function Layout({
  currentPage, onNavigate, onLogout, children, pageTitle, breadcrumb,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const unread = notifications.filter((n) => !n.read);
  const pendingCount = missions.filter((m) => m.status === 'en_attente').length;
  const activeLabel = PAGE_LABELS[currentPage] ?? pageTitle;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }

  function handleToolClick(id: string, label: string) {
    if (id === 'reports') {
      showToast(`${label} sera disponible dans la prochaine version.`);
      return;
    }
    onNavigate(id);
  }

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <div className="flex min-h-screen">
        <aside
          className={`flex shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-[width] duration-200 ease-out ${
            sidebarOpen ? 'w-[248px]' : 'w-[76px]'
          }`}
        >
          <div
            className={`flex h-[76px] shrink-0 items-center ${
              sidebarOpen ? 'justify-between px-5' : 'justify-center px-3'
            }`}
          >
            <div
              className={`flex items-center ${
                sidebarOpen ? 'gap-3' : 'justify-center'
              }`}
            >
              <img
                src={imgLogo}
                alt="Massar"
                className={`h-auto shrink-0 ${
                  sidebarOpen ? 'w-[73px]' : 'w-[42px] object-cover object-left'
                }`}
              />
              {sidebarOpen && (
                <div className="border-l border-[var(--line)] pl-3">
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    Massar
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--ink-muted)]">
                    Algérie Télécom
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className={`px-3 ${sidebarOpen ? '' : 'px-2'}`}>
            <div
              className={`flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 ${
                sidebarOpen ? '' : 'justify-center'
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--navy)] text-[11px] font-bold text-white">
                NF
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--ink)]">
                    Nadia Ferdi
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                    Administrateur
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <CaretDown
                  size={14}
                  className="ml-auto shrink-0 text-[var(--ink-muted)]"
                />
              )}
            </div>
          </div>
          <nav
            className="flex-1 overflow-y-auto px-3 pb-4 pt-7"
            aria-label="Navigation principale"
          >
            {sidebarOpen && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                Navigation
              </p>
            )}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                const count =
                  item.badgeKey === 'pending' ? pendingCount : undefined;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => onNavigate(item.id)}
                    className={`group relative flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                      sidebarOpen ? '' : 'justify-center px-0'
                    } ${
                      active
                        ? 'bg-[var(--surface-muted)] font-semibold text-[var(--ink)]'
                        : 'font-medium text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[var(--accent)]" />
                    )}
                    <Icon size={18} weight={active ? 'bold' : 'regular'} />
                    {sidebarOpen && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {!!count && (
                          <span className="ml-auto rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-strong)]">
                            {count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {sidebarOpen && (
              <p className="mb-2 mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                Outils
              </p>
            )}
            <div className="space-y-1">
              {toolItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => handleToolClick(item.id, item.label)}
                    className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                      sidebarOpen ? '' : 'justify-center px-0'
                    } ${
                      active
                        ? 'bg-[var(--surface-muted)] font-semibold text-[var(--ink)]'
                        : 'text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <Icon size={18} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>
          <div
            className={`border-t border-[var(--line)] p-3 ${
              sidebarOpen ? '' : 'px-2'
            }`}
          >
            <button
              type="button"
              title={!sidebarOpen ? 'Se déconnecter' : undefined}
              onClick={onLogout}
              className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                sidebarOpen ? '' : 'justify-center px-0'
              }`}
            >
              <SignOut size={18} />
              {sidebarOpen && <span>Se déconnecter</span>}
            </button>
            {sidebarOpen && (
              <p className="mt-3 px-3 text-[10px] text-[var(--ink-muted)]">
                DG · Algérie Télécom
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[76px] shrink-0 items-center gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-5 lg:px-8">
            <button
              type="button"
              aria-label={sidebarOpen ? 'Réduire le menu' : 'Afficher le menu'}
              onClick={() => setSidebarOpen((open) => !open)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            >
              <Menu size={20} />
            </button>
            <div className="hidden h-5 w-px bg-[var(--line)] sm:block" />
            <div className="hidden items-center gap-2 text-xs text-[var(--ink-muted)] sm:flex">
              <span>{breadcrumb ?? 'Opérations'}</span>
              <CaretRight size={13} />
              <span className="font-medium text-[var(--ink-soft)]">
                {activeLabel}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <form
                className="relative hidden md:block"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (query.trim()) onNavigate('fleet-missions');
                }}
              >
                <MagnifyingGlass
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
                />
                <input
                  aria-label="Rechercher une mission"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher…"
                  className="h-9 w-[210px] rounded-lg border border-[var(--line)] bg-[var(--page)] pl-9 pr-12 text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink-muted)] lg:flex">
                  ⏎
                </span>
              </form>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setProfileOpen(false);
                  }}
                  className="relative grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  <Bell size={19} />
                  {unread.length > 0 && (
                    <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]" />
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow-lg)]">
                    <div className="flex items-center justify-between px-2 pb-2">
                      <p className="text-sm font-semibold">Notifications</p>
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        {unread.length} nouvelle{unread.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="divide-y divide-[var(--line)]">
                      {notifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="flex gap-3 px-2 py-3">
                          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--ink-soft)]">
                            <Bell size={15} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium">{n.title}</p>
                            <p className="mt-0.5 truncate text-[11px] text-[var(--ink-muted)]">
                              {n.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate('notifications');
                      }}
                      className="mt-2 w-full rounded-lg bg-[var(--surface-muted)] py-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    >
                      Voir tout
                    </button>
                  </div>
                )}
              </div>
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  aria-label="Ouvrir le profil"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--navy)] text-[11px] font-bold text-white">
                    NF
                  </span>
                  <span className="hidden text-left lg:block">
                    <span className="block text-xs font-semibold text-[var(--ink)]">
                      Nadia Ferdi
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[var(--ink-muted)]">
                      Administrateur
                    </span>
                  </span>
                  <CaretDown size={14} className="text-[var(--ink-muted)]" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)]">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('admin-structures');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]"
                    >
                      <Gear size={16} /> Paramètres
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]"
                    >
                      <SignOut size={16} /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main
            id="main-content"
            className="flex-1 overflow-y-auto px-5 py-7 lg:px-8 lg:py-9"
          >
            {children}
          </main>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-5 right-5 z-40 flex max-w-sm items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-lg)]"
          role="status"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
            <Check size={15} weight="bold" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Action confirmée
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--ink-muted)]">
              {toast}
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer la notification"
            onClick={() => setToast(null)}
            className="rounded p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
