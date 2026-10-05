import { useEffect, useState } from 'react';
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { vehicles, drivers, missions, users } from './data/mock';
import type { Driver, MissionRoute, Status, AppUser } from './data/mock';
import { api, type DashboardStats, getStoredUser } from './api/client';
import { normalizeApiMission, replaceApiData } from './api/mockSync';
import { Bus, Car, FileArrowDown, PencilSimple, Trash, UserPlus, X } from '@phosphor-icons/react';
import Layout from './components/Layout';
import Pagination from './components/Pagination';
import LoginPage from './pages/LoginPage';
import VehicleTelemetryModal from './components/VehicleTelemetryModal';
import NewMissionForm from './pages/NewMissionForm';
import MissionDetail from './pages/MissionDetail';
import FleetMissions from './pages/FleetMissions';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import ParametresPage from './pages/ParametresPage';
import AidePage from './pages/AidePage';
import EmployesPage from './pages/EmployesPage';
import NotFoundPage from './components/NotFoundPage';
import PageErrorBoundary from './components/PageErrorBoundary';

type Page =
  | 'admin-dashboard' | 'fleet-missions' | 'new-mission' | 'mission-detail'
  | 'admin-drivers' | 'employes' | 'admin-vehicles' | 'admin-structures' | 'notifications'
  | 'parametres' | 'aide';

const PAGE_TITLES: Record<string, string> = {
  'admin-dashboard': 'Tableau de bord',
  'fleet-missions': 'Missions',
  'new-mission': 'Nouvelle demande',
  'mission-detail': 'Détail de la mission',
  'admin-drivers': 'Conducteurs',
  'employes': 'Employés',
  'admin-vehicles': 'Véhicules',
  'admin-structures': 'Structures organisationnelles',
  notifications: 'Notifications',
  parametres: 'Paramètres',
  aide: 'Aide & support',
};

const PAGE_BREADCRUMBS: Record<string, string> = {
  'new-mission': 'Missions',
  'mission-detail': 'Missions',
  'admin-drivers': 'Administration',
  'employes': 'Administration',
  'admin-vehicles': 'Administration',
  'admin-structures': 'Administration',
  parametres: 'Administration',
};

const PAGE_PATHS: Record<Exclude<Page, 'new-mission' | 'mission-detail'>, string> = {
  'admin-dashboard': '/dashboard',
  'fleet-missions': '/missions',
  'admin-drivers': '/conducteurs',
  employes: '/employes',
  'admin-vehicles': '/vehicules',
  'admin-structures': '/structures',
  notifications: '/notifications',
  parametres: '/parametres',
  aide: '/aide',
};

function pageFromPath(pathname: string): Page {
  if (pathname === '/' || pathname === '/dashboard') return 'admin-dashboard';
  if (pathname === '/missions' || pathname === '/missions/new') return 'fleet-missions';
  if (/^\/missions\/[^/]+$/.test(pathname)) return 'mission-detail';
  if (pathname === '/conducteurs') return 'admin-drivers';
  if (pathname === '/employes') return 'employes';
  if (pathname === '/vehicules') return 'admin-vehicles';
  if (pathname === '/structures') return 'admin-structures';
  if (pathname === '/notifications') return 'notifications';
  if (pathname === '/parametres') return 'parametres';
  if (pathname === '/aide') return 'aide';
  return 'admin-dashboard';
}

function missionIdFromPath(pathname: string) {
  const match = pathname.match(/^\/missions\/([^/]+)$/);
  return match?.[1];
}

function pathForPage(page: Page, id?: string) {
  if (page === 'new-mission') return '/missions/new';
  if (page === 'mission-detail') return id ? `/missions/${id}` : '/missions';
  return PAGE_PATHS[page as Exclude<Page, 'new-mission' | 'mission-detail'>] ?? '/dashboard';
}

export default function App() {
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const initialPage = pageFromPath(location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredUser()));
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredUser());
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [sessionLoading, setSessionLoading] = useState(() => Boolean(getStoredUser()));
  const [apiError, setApiError] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [missionModalOpen, setMissionModalOpen] = useState(location.pathname === '/missions/new');
  const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>(() => missionIdFromPath(location.pathname));
  const [editingMissionId, setEditingMissionId] = useState<string | undefined>();
  const [fleetFilter, setFleetFilter] = useState<string>(() => new URLSearchParams(location.search).get('status') ?? 'all');
  const [history, setHistory] = useState<Page[]>([]);
  // Admin assignments at creation: mission starts with driver+vehicle assigned
  const [assignments, setAssignments] = useState<Record<string, { vehicleId: string; driverId: string }>>({});
  // Driver-pressed starts: mission status switches Programmée → En cours
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  // Company employees (demandeurs) — admin managed
  const [employeeList, setEmployeeList] = useState<AppUser[]>(users);

  async function loadApiData() {
    const [missionResponse, vehicleResponse, driverResponse, userResponse, notificationResponse, stats] = await Promise.all([
      api.missions(),
      api.vehicles(),
      api.drivers(),
      api.users(),
      api.notifications(),
      api.dashboardStats(),
    ]);
    const apiMissions = missionResponse.data.map(normalizeApiMission);
    replaceApiData({
      missions: apiMissions,
      vehicles: vehicleResponse.data,
      drivers: driverResponse.data,
      users: userResponse.data,
      notifications: notificationResponse.data,
    });
    setEmployeeList(userResponse.data);
    setDashboardStats(stats);
    setCurrentUser(getStoredUser());
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    setSessionLoading(true);
    setApiError('');
    void loadApiData()
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Impossible de charger les données du serveur.';
        setApiError(message);
        setIsLoggedIn(false);
      })
      .finally(() => setSessionLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.pathname === '/missions/new') {
      setMissionModalOpen(true);
      return;
    }

    const nextPage = pageFromPath(location.pathname);
    setCurrentPage(nextPage);
    setMissionModalOpen(false);
    setSelectedMissionId(missionIdFromPath(location.pathname));
    if (nextPage === 'fleet-missions') {
      setFleetFilter(new URLSearchParams(location.search).get('status') ?? 'all');
    }
  }, [location.pathname, location.search]);

  // Driver presses "Démarrer": the mission starts immediately
  async function handleStartMission(missionId: string) {
    const m = missions.find(mm => mm.id === missionId);
    if (!m || ['terminee', 'annulee', 'en_cours'].includes(m.status)) return;
    const hasDriver = assignments[missionId]?.driverId || m.driverId;
    if (m.vehicleNeeded && !hasDriver) return;
    try {
      if (m.status === 'en_attente') await api.validateMission(missionId);
      if (m.status === 'en_attente' || m.status === 'validee') {
        await api.assignMission(missionId, assignments[missionId]?.vehicleId || m.vehicleId, hasDriver);
      }
      if (m.status === 'en_attente' || m.status === 'validee' || m.status === 'affectee') await api.confirmMission(missionId);
      await api.startMission(missionId);
      await loadApiData();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible de démarrer la mission.');
    }
  }

  async function handleCancelMission(missionId: string) {
    const mission = missions.find(item => item.id === missionId);
    if (!mission || ['terminee', 'annulee'].includes(mission.status)) return;
    try {
      await api.cancelMission(missionId);
      await loadApiData();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Impossible d’annuler la mission.');
    }
  }

  async function handleSubmitMission(data: {
    missionId?: string;
    saveAsDraft: boolean;
    demandeurId: string;
    type: string;
    object: string;
    departure: string;
    destination: string;
    route: MissionRoute;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    passengers: number;
    assignedDriverId: string;
    assignedVehicleId: string;
    notes: string;
  }) {
    const demandeur = employeeList.find(u => u.id === data.demandeurId) ?? employeeList.find(u => u.status === 'actif');
    const payload = {
      demandeurId: demandeur?.id ?? data.demandeurId,
      type: data.type as 'interne' | 'externe',
      object: data.object,
      departure: data.departure,
      destination: data.destination,
      route: data.route,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      departureTime: data.departureTime,
      returnTime: data.returnTime,
      passengers: data.passengers,
      vehicleNeeded: Boolean(data.assignedVehicleId),
      vehicleId: data.assignedVehicleId || undefined,
      driverId: data.assignedDriverId || undefined,
    };
    const saved = data.missionId ? await api.updateMission(data.missionId, payload) : await api.createMission(payload);
    if (!data.saveAsDraft) {
      const submitted = saved.status === 'brouillon' ? await api.submitMission(saved.id) : saved;
      const validated = submitted.status === 'en_attente' ? await api.validateMission(submitted.id) : submitted;
      if (data.assignedVehicleId || data.assignedDriverId) await api.assignMission(validated.id, data.assignedVehicleId || undefined, data.assignedDriverId || undefined);
    }
    await loadApiData();
  }

  async function handleLogin(identifier: string, password: string) {
    setApiError('');
    const response = await api.login(identifier, password);
    setCurrentUser(response.user);
    setCurrentPage('admin-dashboard');
    setHistory([]);
    setFleetFilter('all');
    setMissionModalOpen(false);
    routerNavigate('/dashboard', { replace: true });
    setIsLoggedIn(true);
  }

  async function handleLogout() {
    try { await api.logout(); } catch { /* The session is cleared locally below. */ }
    setCurrentPage('admin-dashboard');
    setHistory([]);
    setFleetFilter('all');
    setMissionModalOpen(false);
    routerNavigate('/dashboard', { replace: true });
    setIsLoggedIn(false);
    setCurrentUser(null);
    setDashboardStats(null);
  }

  function navigate(page: string, id?: string) {
    const next = page as Page;

    if (next === 'new-mission') {
      setEditingMissionId(id);
      setMissionModalOpen(true);
      routerNavigate('/missions/new', { state: { background: `${location.pathname}${location.search}` } });
      return;
    }

    setHistory((h) => [...h.slice(-19), currentPage]);
    setCurrentPage(next);
    setMissionModalOpen(false);
    if (next === 'mission-detail' && id) setSelectedMissionId(id);
    if (next === 'fleet-missions') {
      const filter = id ?? 'all';
      setFleetFilter(filter);
      routerNavigate(filter === 'all' ? '/missions' : `/missions?status=${encodeURIComponent(filter)}`);
      return;
    }
    routerNavigate(pathForPage(next, id));
  }

  // Back to the previous page (instead of always jumping to the dashboard)
  function goBack() {
    if (missionModalOpen) {
      setMissionModalOpen(false);
      setEditingMissionId(undefined);
      const background = (location.state as { background?: string } | null)?.background;
      routerNavigate(background || pathForPage(currentPage), { replace: true });
      return;
    }

    const prev = history[history.length - 1];
    if (!prev) {
      setCurrentPage('admin-dashboard');
      routerNavigate('/dashboard', { replace: true });
      return;
    }
    setHistory(history.slice(0, -1));
    setCurrentPage(prev);
    routerNavigate(pathForPage(prev), { replace: true });
  }

  function renderMissionForm() {
    return (
      <NewMissionForm
        key={editingMissionId ?? 'new-mission'}
        initialMission={missions.find(mission => mission.id === editingMissionId) ?? null}
        employees={employeeList}
        onNavigate={navigate}
        onBack={goBack}
        onSubmitMission={handleSubmitMission}
      />
    );
  }

  function renderPage() {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard statusOverrides={statusOverrides} dashboardStats={dashboardStats} currentUser={currentUser} onNavigate={navigate} />;
      case 'fleet-missions':
        return <FleetMissions key={fleetFilter} initialFilter={fleetFilter} assignments={assignments} statusOverrides={statusOverrides} onStartMission={handleStartMission} onNavigate={navigate} />;
      case 'new-mission':
        return renderMissionForm();
      case 'mission-detail': {
        const mission = selectedMissionId ? missions.find(item => item.id === selectedMissionId) : null;
        if (!mission) {
          return <NotFoundPage onBack={() => navigate('admin-dashboard')} title="Mission introuvable" description="Cette mission n’existe pas ou n’est plus disponible." />;
        }
        return <MissionDetail missionId={mission.id} assignments={assignments} statusOverrides={statusOverrides} onNavigate={navigate} onBack={goBack} onCancelMission={handleCancelMission} onEditMission={(id) => navigate('new-mission', id)} />;
      }
      case 'admin-drivers':
         return <AdminDriversPage assignments={assignments} onRefresh={loadApiData} />;
      case 'employes':
        return (
          <EmployesPage
            employees={employeeList}
            onAdd={(data) => {
              const id = `U${String(employeeList.length + 1).padStart(3, '0')}`;
              setEmployeeList(list => [...list, { ...data, id, role: 'admin', status: 'actif' as const, createdAt: new Date().toISOString().slice(0, 10) }]);
            }}
            onDelete={(id) => setEmployeeList(list => list.filter(e => e.id !== id))}
          />
        );
      case 'admin-vehicles':
         return <AdminVehiclesPage assignments={assignments} employees={employeeList} onNavigate={navigate} onRefresh={loadApiData} />;
      case 'admin-structures':
        return <AdminStructuresPage />;
      case 'notifications':
         return <NotificationsPage onNavigate={navigate} onRefresh={loadApiData} />;
      case 'parametres':
        return <ParametresPage onNavigate={navigate} />;
      case 'aide':
        return <AidePage />;
      default:
        return <NotFoundPage onBack={() => navigate('admin-dashboard')} />;
    }
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} serverError={apiError} />;
  }

  if (sessionLoading) {
    return <div className="min-h-screen grid place-items-center bg-[var(--page)] text-[var(--ink-muted)]">Connexion au serveur…</div>;
  }

  if (!dashboardStats) {
    return <div className="min-h-screen grid place-items-center bg-[var(--page)] text-[var(--ink-muted)]">Les statistiques du tableau de bord sont indisponibles.</div>;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={navigate}
      onLogout={handleLogout}
      pageTitle={PAGE_TITLES[currentPage] || 'Massar Fleet'}
      breadcrumb={PAGE_BREADCRUMBS[currentPage]}
      currentUser={currentUser}
    >
      <PageErrorBoundary resetKey={currentPage} onReset={() => setCurrentPage('admin-dashboard')}>
        {renderPage()}
      </PageErrorBoundary>
      {missionModalOpen && (
        <PageErrorBoundary resetKey={`mission-modal-${editingMissionId ?? 'new'}`} onReset={goBack}>
          {renderMissionForm()}
        </PageErrorBoundary>
      )}
    </Layout>
  );
}

const DRIVER_STATUSES: { id: Driver['status']; label: string }[] = [
  { id: 'disponible', label: 'Disponible' },
  { id: 'en_mission', label: 'En mission' },
  { id: 'conge', label: 'En congé' },
  { id: 'indisponible', label: 'Indisponible' },
];

const LICENCE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

// Row icon by vehicle type: bus for collective transport, car otherwise
function VehicleRowIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  const Icon = t.includes('bus') || t.includes('minivan') ? Bus : Car;
  return <Icon size={20} weight="regular" className="text-navy" />;
}

// Next driver matricule in sequence (DRV-XXXX), assigned automatically
function nextMatricule(list: Driver[]) {
  const nums = list
    .map(d => parseInt(d.matricule.replace(/\D/g, ''), 10))
    .filter(n => !Number.isNaN(n));
  return `DRV-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0')}`;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const content = [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function AdminDriversPage({ assignments, onRefresh }: { assignments: Record<string, { vehicleId: string; driverId: string }>; onRefresh?: () => Promise<void> }) {
  const [driverList, setDriverList] = useState<Driver[]>(drivers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Driver | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Driver['status']>('all');
  const [driverPage, setDriverPage] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    licenceCategories: ['B'],
    licenceExpiry: '',
    status: 'disponible' as Driver['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, val: unknown) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function toggleCategory(cat: string) {
    setForm(f => ({
      ...f,
      licenceCategories: f.licenceCategories.includes(cat)
        ? f.licenceCategories.filter(c => c !== cat)
        : [...f.licenceCategories, cat].sort(),
    }));
    setErrors(e => { const n = { ...e }; delete n.licence; return n; });
  }

  function openModal() {
    setEditingId(null);
    setForm({ name: '', phone: '', licenceCategories: ['B'], licenceExpiry: '', status: 'disponible' });
    setErrors({});
    setShowModal(true);
  }

  function openEdit(d: Driver) {
    setEditingId(d.id);
    setForm({ name: d.name, phone: d.phone, licenceCategories: [...d.licenceCategories], licenceExpiry: d.licenceExpiry, status: d.status });
    setErrors({});
    setShowModal(true);
  }

  async function handleAdd() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom complet est requis.';
    if (!form.phone.trim()) e.phone = 'Le téléphone est requis.';
    if (form.licenceCategories.length === 0) e.licence = 'Choisissez au moins une catégorie de permis.';
    if (!form.licenceExpiry) e.licenceExpiry = "La date d'expiration du permis est requise.";
    if (Object.keys(e).length) { setErrors(e); return; }
    if (editingId) {
      const updated = await api.updateDriver(editingId, {
        name: form.name.trim(), licenceCategories: [...form.licenceCategories].sort(),
        licenceExpiry: form.licenceExpiry, phone: form.phone.trim(),
        status: form.status === 'en_mission' ? 'disponible' : form.status,
      });
      setDriverList(list => list.map(d => d.id === editingId ? updated : d));
      setShowModal(false);
      setEditingId(null);
      await onRefresh?.();
      return;
    }
    const next = await api.createDriver({
      name: form.name.trim(),
      matricule: nextMatricule(driverList),
      licenceCategories: [...form.licenceCategories].sort(),
      licenceExpiry: form.licenceExpiry,
      phone: form.phone.trim(),
      status: form.status,
    });
    setDriverList(list => [...list, next]);
    setShowModal(false);
    await onRefresh?.();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await api.deleteDriver(pendingDelete.id);
    setDriverList(list => list.filter(driver => driver.id !== pendingDelete.id));
    setPendingDelete(null);
    await onRefresh?.();
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'
    }`;

  const driverQuery = search.trim().toLowerCase();
  const getEffectiveStatus = (driver: Driver): Driver['status'] => {
    const sessionDriverIds = Object.values(assignments).map(a => a.driverId);
    const missionDriverIds = missions
      .filter(m => ['en_attente', 'en_cours'].includes(m.status) && m.driverId)
      .map(m => m.driverId as string);
    return [...sessionDriverIds, ...missionDriverIds].includes(driver.id) && driver.status === 'disponible'
      ? 'en_mission'
      : driver.status;
  };
  const filteredDrivers = driverList.filter(d =>
    (statusFilter === 'all' || getEffectiveStatus(d) === statusFilter) &&
    (!driverQuery || `${d.name} ${d.matricule} ${d.phone}`.toLowerCase().includes(driverQuery)),
  );
  const driverPageSize = 5;
  const driverPageCount = Math.max(1, Math.ceil(filteredDrivers.length / driverPageSize));
  const driverPageNumber = Math.min(driverPage, driverPageCount);
  const pagedDrivers = filteredDrivers.slice((driverPageNumber - 1) * driverPageSize, driverPageNumber * driverPageSize);

  function exportDrivers() {
    downloadCsv(
      'conducteurs-massar.csv',
      ['Nom', 'Matricule', 'Téléphone', 'Catégories de permis', 'Expiration du permis', 'Statut'],
      filteredDrivers.map(driver => [
        driver.name,
        driver.matricule,
        driver.phone,
        driver.licenceCategories.join(' + '),
        driver.licenceExpiry,
        DRIVER_STATUSES.find(status => status.id === getEffectiveStatus(driver))?.label ?? 'Indisponible',
      ]),
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] max-w-md flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Rechercher un conducteur…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <select
        aria-label="Filtrer les conducteurs par statut"
        value={statusFilter}
        onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-ink shadow-sm focus:border-navy focus:outline-none"
      >
        <option value="all">Tous les statuts</option>
        {DRIVER_STATUSES.map(status => <option key={status.id} value={status.id}>{status.label}</option>)}
      </select>
      <button
        type="button"
        onClick={exportDrivers}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
      >
        <FileArrowDown size={18} />
        Exporter CSV
      </button>
      <button onClick={openModal} className="ml-auto flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nouveau conducteur
      </button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Conducteur</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">Matricule</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Permis</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Expiration</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pagedDrivers.map(d => {
              const expiry = new Date(d.licenceExpiry);
              const daysLeft = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const warning = daysLeft < 90;
              // Assigned to a mission (session or scheduled / in progress) → En mission
              const effStatus = getEffectiveStatus(d);
              return (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{d.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</div>
                      <div className="min-w-0">
                        <p className="text-ink font-medium truncate">{d.name}</p>
                        <p className="text-muted text-xs">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted whitespace-nowrap">{d.matricule}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><span className="px-2 py-1 bg-navy-light text-navy text-xs font-semibold rounded">{d.licenceCategories.join(' + ')}</span></td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className={`text-sm font-medium ${warning ? 'text-warning' : 'text-ink'}`}>{expiry.toLocaleDateString('fr-DZ')}</p>
                    {warning && <p className="text-warning text-xs">⚠ {daysLeft}j restants</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      effStatus === 'disponible' ? 'bg-success-bg text-success' :
                      effStatus === 'en_mission' ? 'bg-[#FFF7ED] text-[#C2410C]' :
                      effStatus === 'conge' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                      'bg-slate-100 text-muted'
                    }`}>
                      {effStatus === 'disponible' ? 'Disponible' : effStatus === 'en_mission' ? 'En mission' : effStatus === 'conge' ? 'En congé' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(d)}
                      title="Modifier le conducteur"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-slate-100 hover:text-navy"
                    >
                      <span className="sr-only">Modifier</span>
                      <PencilSimple size={20} weight="regular" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(d)}
                      title="Supprimer le conducteur"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <span className="sr-only">Supprimer</span>
                      <Trash size={20} weight="regular" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
        <Pagination
          currentPage={driverPageNumber}
          totalItems={filteredDrivers.length}
          pageSize={driverPageSize}
          itemLabel="conducteur(s) enregistré(s)"
          onPageChange={setDriverPage}
        />
      </div>

      {/* Add driver modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-ink text-lg font-bold">{editingId ? 'Modifier le conducteur' : 'Nouveau conducteur'}</h3>
                <p className="text-muted text-sm mt-0.5">{editingId ? 'Modifiez les informations — le statut En mission reste automatique' : 'Renseignez les informations du conducteur'}</p>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Fermer" className="p-1.5 rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Nom complet <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. Karim Benali" className={inputClass('name')} value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <p className="mt-1.5 text-xs text-danger">⚠ {errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Matricule</label>
                  <div className="px-3.5 py-2.5 rounded-lg border border-border bg-slate-50 font-mono text-sm text-ink">
                    {nextMatricule(driverList)}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">Attribué automatiquement (séquence)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Téléphone <span className="text-danger">*</span></label>
                  <input type="tel" placeholder="+213 …" className={inputClass('phone')} value={form.phone} onChange={e => set('phone', e.target.value)} />
                  {errors.phone && <p className="mt-1.5 text-xs text-danger">⚠ {errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Catégories de permis <span className="text-danger">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {LICENCE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`w-11 h-11 rounded-lg border-2 text-sm font-bold transition-all ${
                        form.licenceCategories.includes(cat)
                          ? 'border-navy bg-navy text-white'
                          : 'border-border bg-white text-muted hover:border-navy/40 hover:text-ink'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.licence && <p className="mt-1.5 text-xs text-danger">⚠ {errors.licence}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Expiration du permis <span className="text-danger">*</span></label>
                  <input type="date" className={inputClass('licenceExpiry')} value={form.licenceExpiry} onChange={e => set('licenceExpiry', e.target.value)} />
                  {errors.licenceExpiry && <p className="mt-1.5 text-xs text-danger">⚠ {errors.licenceExpiry}</p>}
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Statut</label>
                    <select className={inputClass('status')} value={form.status} onChange={e => set('status', e.target.value as Driver['status'])}>
                      {DRIVER_STATUSES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-muted">En mission reste automatique quand le conducteur est affecté.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleAdd} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">{editingId ? 'Enregistrer' : 'Ajouter le conducteur'}</button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={e => { if (e.target === e.currentTarget) setPendingDelete(null); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-ink">Supprimer le conducteur ?</h3>
            <p className="mb-6 text-sm text-muted">
              <strong>{pendingDelete.name}</strong> sera retiré de la liste des conducteurs.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPendingDelete(null)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={handleDelete} className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminVehiclesPage({
  onNavigate: _onNavigate,
  assignments,
  employees,
  onRefresh,
}: {
  onNavigate: (page: string) => void;
  assignments: Record<string, { vehicleId: string; driverId: string }>;
  employees: AppUser[];
  onRefresh?: () => Promise<void>;
}) {
  const [vehicleList, setVehicleList] = useState(vehicles);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [assignmentVehicleId, setAssignmentVehicleId] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    employeeId: '',
    service: '',
    assignmentDate: new Date().toISOString().slice(0, 10),
  });
  const [assignmentErrors, setAssignmentErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [vehiclePage, setVehiclePage] = useState(1);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    category: 'car' as 'car' | 'bus',
    type: '',
    registration: '',
    gps: '',
    capacity: 5,
    status: 'disponible' as 'disponible' | 'affecte' | 'maintenance' | 'indisponible',
    lastInspection: '',
    nextInspection: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField(field: string, val: unknown) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function openCreate() {
    setEditingId(null);
    setForm({ brand: '', model: '', category: 'car', type: '', registration: '', gps: '', capacity: 5, status: 'disponible', lastInspection: '', nextInspection: '' });
    setErrors({});
    setShowForm(true);
  }

  function openEdit(id: string) {
    const v = vehicleList.find(x => x.id === id);
    if (!v) return;
    setEditingId(id);
    setForm({
      brand: v.brand,
      model: v.model,
      category: v.category,
      type: v.type,
      registration: v.registration,
      gps: v.gps,
      capacity: v.capacity,
      status: v.status,
      lastInspection: v.lastInspection,
      nextInspection: v.nextInspection,
    });
    setErrors({});
    setDetailId(null);
    setShowForm(true);
  }

  async function setVehicleStatus(id: string, status: typeof vehicleList[0]['status']) {
    const updated = await api.updateVehicleStatus(id, status);
    setVehicleList(list => list.map(v => v.id === id ? updated : v));
    await onRefresh?.();
  }

  function openAssignment(id: string) {
    const vehicle = vehicleList.find(v => v.id === id);
    if (!vehicle || vehicle.status !== 'disponible') return;
    setAssignmentVehicleId(id);
    setAssignmentForm({
      employeeId: '',
      service: '',
      assignmentDate: new Date().toISOString().slice(0, 10),
    });
    setAssignmentErrors({});
  }

  function closeAssignment() {
    setAssignmentVehicleId(null);
    setAssignmentErrors({});
  }

  async function handleAssignment() {
    const errors: Record<string, string> = {};
    if (!assignmentForm.employeeId) errors.employeeId = 'Sélectionnez un employé.';
    if (!assignmentForm.service.trim()) errors.service = 'Indiquez le service ou la mission.';
    if (!assignmentForm.assignmentDate) errors.assignmentDate = "La date d'affectation est requise.";
    if (Object.keys(errors).length) {
      setAssignmentErrors(errors);
      return;
    }

    const vehicle = vehicleList.find(v => v.id === assignmentVehicleId);
    if (!vehicle || vehicle.status !== 'disponible') return;

    const updated = await api.updateVehicleStatus(vehicle.id, 'indisponible');
    setVehicleList(list => list.map(v => v.id === vehicle.id ? updated : v));
    closeAssignment();
    await onRefresh?.();
  }

  async function handleDeleteVehicle(id: string) {
    await api.deleteVehicle(id);
    setVehicleList(list => list.filter(v => v.id !== id));
    setDetailId(null);
    await onRefresh?.();
  }

  async function handleSave() {
    const e: Record<string, string> = {};
    if (!form.brand.trim()) e.brand = 'La marque est requise.';
    if (!form.model.trim()) e.model = 'Le modèle est requis.';
    if (!form.type.trim()) e.type = 'Le type est requis.';
    if (!form.registration.trim()) e.registration = 'L\'immatriculation est requise.';
    if (!form.gps.trim()) e.gps = 'L\'identifiant GPS est requis.';
    if (!form.lastInspection) e.lastInspection = 'La dernière inspection est requise.';
    if (!form.nextInspection) e.nextInspection = 'La prochaine inspection est requise.';
    if (Object.keys(e).length) { setErrors(e); return; }

    if (editingId) {
      const updated = await api.updateVehicle(editingId, form);
      setVehicleList(list => list.map(v => v.id === editingId ? updated : v));
    } else {
      const next = await api.createVehicle(form);
      setVehicleList(list => [...list, next]);
    }
    setShowForm(false);
    setEditingId(null);
    await onRefresh?.();
  }

  const detailVehicle = vehicleList.find(v => v.id === detailId) ?? null;
  const assignmentVehicle = vehicleList.find(v => v.id === assignmentVehicleId) ?? null;
  const activeEmployees = employees.filter(employee => employee.status === 'actif');
  const vehicleTypes = [...new Set(vehicleList.map(v => v.type))];
  const vQuery = search.trim().toLowerCase();
  const filteredVehicles = vehicleList.filter(v =>
    (typeFilter === 'all' || v.type === typeFilter) &&
    (!vQuery || `${v.brand} ${v.model} ${v.registration} ${v.gps}`.toLowerCase().includes(vQuery)),
  );
  const vehiclePageSize = 5;
  const vehiclePageCount = Math.max(1, Math.ceil(filteredVehicles.length / vehiclePageSize));
  const vehiclePageNumber = Math.min(vehiclePage, vehiclePageCount);
  const pagedVehicles = filteredVehicles.slice((vehiclePageNumber - 1) * vehiclePageSize, vehiclePageNumber * vehiclePageSize);

  function currentMissionFor(vid: string) {
    const sessionMid = Object.entries(assignments).find(([, a]) => a.vehicleId === vid)?.[0];
    const m = missions.find(mm => mm.id === sessionMid) ?? missions.find(mm => mm.vehicleId === vid && ['en_attente', 'en_cours'].includes(mm.status));
    if (!m) return null;
    const d = m.driverId ? drivers.find(dr => dr.id === m.driverId) ?? null : null;
    return { mission: m, driver: d };
  }

  const detailAssignment = detailId ? currentMissionFor(detailId) : null;

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'
    }`;

  const statusColors: Record<string, string> = {
    disponible: 'bg-success-bg text-success',
    affecte: 'bg-navy-light text-navy',
    maintenance: 'bg-warning-bg text-warning',
    indisponible: 'bg-slate-100 text-muted',
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un véhicule…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrer par type"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-ink shadow-sm focus:outline-none focus:border-navy"
        >
          <option value="all">Tous les types</option>
          {vehicleTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={openCreate} className="ml-auto flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouveau véhicule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Véhicule</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">Immatriculation</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Capacité</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Dernière inspection</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Prochaine inspection</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-right text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pagedVehicles.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDetailId(v.id)}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <VehicleRowIcon type={v.type} />
                    </div>
                    <div>
                      <p className="text-ink font-semibold">{v.brand} {v.model}</p>
                      <p className="text-muted text-xs">{v.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-muted whitespace-nowrap">{v.registration}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-ink">{v.type}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-ink">{v.capacity} places</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted">{new Date(v.lastInspection).toLocaleDateString('fr-DZ')}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted">{new Date(v.nextInspection).toLocaleDateString('fr-DZ')}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[v.status]}`}>
                    {v.status === 'disponible' ? 'Disponible' : v.status === 'maintenance' ? 'Maintenance' : v.status === 'affecte' ? 'Affecté' : 'Indisponible'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {v.status === 'disponible' && (
                      <button
                        type="button"
                        aria-label="Affecter le véhicule"
                        title="Affecter le véhicule"
                        onClick={(e) => { e.stopPropagation(); openAssignment(v.id); }}
                        className="grid h-9 w-9 place-items-center rounded-lg bg-navy text-white transition-colors hover:bg-navy-dark"
                      >
                        <UserPlus size={17} weight="bold" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setDetailId(v.id); }} className="text-navy text-xs font-medium hover:underline whitespace-nowrap">Détails</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <Pagination
          currentPage={vehiclePageNumber}
          totalItems={filteredVehicles.length}
          pageSize={vehiclePageSize}
          itemLabel="véhicule(s) enregistré(s)"
          onPageChange={setVehiclePage}
        />
      </div>

      {/* Vehicle assignment modal */}
      {assignmentVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={e => { if (e.target === e.currentTarget) closeAssignment(); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="vehicle-assignment-title">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <label htmlFor="vehicle-assignment-service" className="mb-1.5 block text-sm font-medium text-ink">
                  Service ou mission <span className="text-danger">*</span>
                </label>
                <input
                  id="vehicle-assignment-service"
                  type="text"
                  value={assignmentForm.service}
                  onChange={e => {
                    setAssignmentForm(form => ({ ...form, service: e.target.value }));
                    setAssignmentErrors(errors => ({ ...errors, service: '' }));
                  }}
                  placeholder="Ex. Installation fibre optique"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 ${assignmentErrors.service ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-navy focus:ring-navy/15'}`}
                />
                {assignmentErrors.service && <p className="mt-1.5 text-xs text-danger">{assignmentErrors.service}</p>}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-navy">Nouvelle affectation</p>
                <h3 id="vehicle-assignment-title" className="text-ink font-bold">Affecter un véhicule</h3>
                <p className="mt-1 text-muted text-sm">
                  {assignmentVehicle.brand} {assignmentVehicle.model} · {assignmentVehicle.registration}
                </p>
              </div>
              <button type="button" onClick={closeAssignment} aria-label="Fermer" className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="vehicle-assignment-employee" className="mb-1.5 block text-sm font-medium text-ink">
                  Employé bénéficiaire <span className="text-danger">*</span>
                </label>
                <select
                  id="vehicle-assignment-employee"
                  value={assignmentForm.employeeId}
                  onChange={e => {
                    setAssignmentForm(form => ({ ...form, employeeId: e.target.value }));
                    setAssignmentErrors(errors => ({ ...errors, employeeId: '' }));
                  }}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 ${assignmentErrors.employeeId ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-navy focus:ring-navy/15'}`}
                >
                  <option value="">Sélectionner un employé</option>
                  {activeEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} · {employee.structure}
                    </option>
                  ))}
                </select>
                {assignmentErrors.employeeId && <p className="mt-1.5 text-xs text-danger">{assignmentErrors.employeeId}</p>}
                {!activeEmployees.length && <p className="mt-1.5 text-xs text-danger">Aucun employé actif n'est disponible.</p>}
              </div>

              <div>
                <label htmlFor="vehicle-assignment-date" className="mb-1.5 block text-sm font-medium text-ink">
                  Date d'affectation <span className="text-danger">*</span>
                </label>
                <input
                  id="vehicle-assignment-date"
                  type="date"
                  value={assignmentForm.assignmentDate}
                  onChange={e => {
                    setAssignmentForm(form => ({ ...form, assignmentDate: e.target.value }));
                    setAssignmentErrors(errors => ({ ...errors, assignmentDate: '' }));
                  }}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 ${assignmentErrors.assignmentDate ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-navy focus:ring-navy/15'}`}
                />
                {assignmentErrors.assignmentDate && <p className="mt-1.5 text-xs text-danger">{assignmentErrors.assignmentDate}</p>}
              </div>

              <div className="rounded-lg border border-warning/20 bg-warning-bg px-4 py-3 text-sm text-warning">
                Après confirmation, le véhicule passera automatiquement à l'état « Indisponible ».
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={closeAssignment} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-slate-50">
                Annuler
              </button>
              <button type="button" onClick={handleAssignment} disabled={!activeEmployees.length} className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50">
                <UserPlus size={17} weight="bold" />
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle form modal (create / edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditingId(null); } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-ink text-lg font-bold">{editingId ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
                <p className="text-muted text-sm mt-0.5">{editingId ? 'Modifiez les informations' : 'Renseignez les informations du véhicule'}</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} aria-label="Fermer" className="p-1.5 rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Marque <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. Toyota" className={inputClass('brand')} value={form.brand} onChange={e => setField('brand', e.target.value)} />
                {errors.brand && <p className="mt-1.5 text-xs text-danger">⚠ {errors.brand}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Modèle <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. Land Cruiser" className={inputClass('model')} value={form.model} onChange={e => setField('model', e.target.value)} />
                {errors.model && <p className="mt-1.5 text-xs text-danger">⚠ {errors.model}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Catégorie <span className="text-danger">*</span></label>
                <select className={inputClass('category')} value={form.category} onChange={e => setField('category', e.target.value as 'car' | 'bus')}>
                  <option value="car">Voiture</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Type <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. SUV" className={inputClass('type')} value={form.type} onChange={e => setField('type', e.target.value)} />
                {errors.type && <p className="mt-1.5 text-xs text-danger">⚠ {errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Immatriculation <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. 16-12345-DZ" className={`${inputClass('registration')} font-mono`} value={form.registration} onChange={e => setField('registration', e.target.value.toUpperCase())} />
                {errors.registration && <p className="mt-1.5 text-xs text-danger">⚠ {errors.registration}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">GPS / Traceur <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. GPS-DZ-16001" className={`${inputClass('gps')} font-mono`} value={form.gps} onChange={e => setField('gps', e.target.value.toUpperCase())} />
                {errors.gps && <p className="mt-1.5 text-xs text-danger">⚠ {errors.gps}</p>}
                <p className="mt-1 text-[11px] text-muted">Identifiant utilisé pour le suivi du véhicule.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Capacité <span className="text-danger">*</span></label>
                <input type="number" min="1" max="60" className={inputClass('capacity')} value={form.capacity} onChange={e => setField('capacity', parseInt(e.target.value) || 0)} />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Statut</label>
                  <select className={inputClass('status')} value={form.status} onChange={e => setField('status', e.target.value as 'disponible' | 'affecte' | 'maintenance' | 'indisponible')}>
                    <option value="disponible">Disponible</option>
                    <option value="affecte">Affecté</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="indisponible">Indisponible</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Dernière inspection <span className="text-danger">*</span></label>
                <input type="date" className={inputClass('lastInspection')} value={form.lastInspection} onChange={e => setField('lastInspection', e.target.value)} />
                {errors.lastInspection && <p className="mt-1.5 text-xs text-danger">⚠ {errors.lastInspection}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Prochaine inspection <span className="text-danger">*</span></label>
                <input type="date" className={inputClass('nextInspection')} value={form.nextInspection} onChange={e => setField('nextInspection', e.target.value)} />
                {errors.nextInspection && <p className="mt-1.5 text-xs text-danger">⚠ {errors.nextInspection}</p>}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">{editingId ? 'Enregistrer' : 'Ajouter le véhicule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle telemetry & maintenance panel */}
      {detailVehicle && (
        <VehicleTelemetryModal
          vehicle={detailVehicle}
          assignment={detailAssignment}
          onClose={() => setDetailId(null)}
          onStatusChange={setVehicleStatus}
          onDelete={handleDeleteVehicle}
        />
      )}
    </div>
  );
}

function AdminStructuresPage() {
  const structures = [
    { name: 'Direction Générale', location: 'Alger', employees: 24, code: 'DG-ALG' },
    { name: 'Direction Régionale Oran', location: 'Oran', employees: 18, code: 'DR-ORN' },
    { name: 'Direction Régionale Constantine', location: 'Constantine', employees: 15, code: 'DR-CST' },
    { name: 'Direction Régionale Annaba', location: 'Annaba', employees: 12, code: 'DR-ANB' },
    { name: 'Centre Télécom Tlemcen', location: 'Tlemcen', employees: 9, code: 'CT-TLM' },
    { name: 'Division Infrastructure', location: 'Alger', employees: 31, code: 'DI-ALG' },
    { name: 'Division Commerciale', location: 'Alger', employees: 22, code: 'DC-ALG' },
  ];
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(structures.length / pageSize));
  const pageNumber = Math.min(page, pageCount);
  const pagedStructures = structures.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouvelle structure
        </button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Structure</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Code</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Wilaya</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Effectif</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pagedStructures.map(s => (
              <tr key={s.code} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 text-ink font-medium">{s.name}</td>
                <td className="px-5 py-4 font-mono text-xs text-muted">{s.code}</td>
                <td className="px-5 py-4 text-ink">{s.location}</td>
                <td className="px-5 py-4 text-ink">{s.employees} personnes</td>
                <td className="px-5 py-4 text-right">
                  <button className="text-muted hover:text-navy transition-colors text-xs font-medium">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={pageNumber}
          totalItems={structures.length}
          pageSize={pageSize}
          itemLabel="structure(s)"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
