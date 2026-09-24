import { useState } from 'react';
import { vehicles, drivers, missions } from './data/mock';
import type { Driver } from './data/mock';
import Layout from './components/Layout';
import VehicleTelemetryModal from './components/VehicleTelemetryModal';
import NewMissionForm from './pages/NewMissionForm';
import MissionDetail from './pages/MissionDetail';
import FleetMissions from './pages/FleetMissions';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import ParametresPage from './pages/ParametresPage';
import AidePage from './pages/AidePage';

type Page =
  | 'admin-dashboard' | 'fleet-missions' | 'new-mission' | 'mission-detail'
  | 'admin-drivers' | 'admin-vehicles' | 'admin-structures' | 'notifications'
  | 'parametres' | 'aide';

const PAGE_TITLES: Record<string, string> = {
  'admin-dashboard': 'Tableau de bord',
  'fleet-missions': 'Missions',
  'new-mission': 'Nouvelle demande',
  'mission-detail': 'Détail de la mission',
  'admin-drivers': 'Conducteurs',
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
  'admin-vehicles': 'Administration',
  'admin-structures': 'Administration',
  parametres: 'Administration',
};

export default function App() {
  // NOTE: login is disabled for now — it will be added back later.
  const [currentPage, setCurrentPage] = useState<Page>('admin-dashboard');
  const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>();
  const [fleetFilter, setFleetFilter] = useState<string>('all');
  const [history, setHistory] = useState<Page[]>([]);
  // Admin assignments at creation: mission starts with driver+vehicle assigned
  const [assignments, setAssignments] = useState<Record<string, { vehicleId: string; driverId: string }>>({});

  // Driver starts the mission
  function handleStartMission(missionId: string) {
    const m = missions.find(m => m.id === missionId);
    const a = assignments[missionId];
    if (!m || !a) return;
    // In a real app this would mutate server state; here we just treat it as "en_cours"
    // The FleetMissions page computes effective status from assignments
  }

  function handleSubmitMission(data: {
    type: string;
    object: string;
    departure: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    passengers: number;
    vehicleNeeded: boolean;
    vehicleCategory: string;
    vehicleSubtype: string;
    assignedDriverId: string;
    assignedVehicleId: string;
    notes: string;
  }) {
    // Create new mission
    const newId = `M${new Date().getFullYear()}-${String(missions.length + 1).padStart(3, '0')}`;
    const newMission = {
      id: newId,
      employee: 'Nadia Ferdi', // current user
      matricule: 'ALT-0120',
      structure: 'Direction Générale',
      type: data.type as 'interne' | 'externe',
      object: data.object,
      departure: data.departure,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      departureTime: data.departureTime,
      returnTime: data.returnTime,
      passengers: data.passengers,
      vehicleNeeded: data.vehicleNeeded,
      vehicleType: data.vehicleSubtype,
      status: 'en_attente' as const,
      vehicleId: data.assignedVehicleId,
      driverId: data.assignedDriverId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    missions.push(newMission);
    // Save assignment
    setAssignments(a => ({ ...a, [newId]: { vehicleId: data.assignedVehicleId, driverId: data.assignedDriverId } }));
  }

  function handleLogout() {
    setCurrentPage('admin-dashboard');
    setHistory([]);
    setFleetFilter('all');
  }

  function navigate(page: string, id?: string) {
    const next = page as Page;
    setHistory((h) => [...h.slice(-19), currentPage]);
    setCurrentPage(next);
    if (next === 'mission-detail' && id) setSelectedMissionId(id);
    if (next === 'fleet-missions') setFleetFilter(id ?? 'all');
  }

  // Back to the previous page (instead of always jumping to the dashboard)
  function goBack() {
    const prev = history[history.length - 1];
    if (!prev) {
      setCurrentPage('admin-dashboard');
      return;
    }
    setHistory(history.slice(0, -1));
    setCurrentPage(prev);
  }

  function renderPage() {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case 'fleet-missions':
        return <FleetMissions key={fleetFilter} initialFilter={fleetFilter} assignments={assignments} onStartMission={handleStartMission} onNavigate={navigate} />;
      case 'new-mission':
        return <NewMissionForm onNavigate={navigate} onBack={goBack} onSubmitMission={handleSubmitMission} />;
      case 'mission-detail':
        return <MissionDetail missionId={selectedMissionId || 'M2026-001'} assignments={assignments} onNavigate={navigate} onBack={goBack} />;
      case 'admin-drivers':
        return <AdminDriversPage assignments={assignments} />;
      case 'admin-vehicles':
        return <AdminVehiclesPage assignments={assignments} onNavigate={navigate} />;
      case 'admin-structures':
        return <AdminStructuresPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigate} />;
      case 'parametres':
        return <ParametresPage onNavigate={navigate} />;
      case 'aide':
        return <AidePage />;
      default:
        return <AdminDashboard onNavigate={navigate} />;
    }
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={navigate}
      onLogout={handleLogout}
      pageTitle={PAGE_TITLES[currentPage] || 'Massar Fleet'}
      breadcrumb={PAGE_BREADCRUMBS[currentPage]}
    >
      {renderPage()}
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

// Next driver matricule in sequence (DRV-XXXX), assigned automatically
function nextMatricule(list: Driver[]) {
  const nums = list
    .map(d => parseInt(d.matricule.replace(/\D/g, ''), 10))
    .filter(n => !Number.isNaN(n));
  return `DRV-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0')}`;
}

function AdminDriversPage({ assignments }: { assignments: Record<string, { vehicleId: string; driverId: string }> }) {
  const [driverList, setDriverList] = useState<Driver[]>(drivers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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

  function handleAdd() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom complet est requis.';
    if (!form.phone.trim()) e.phone = 'Le téléphone est requis.';
    if (form.licenceCategories.length === 0) e.licence = 'Choisissez au moins une catégorie de permis.';
    if (!form.licenceExpiry) e.licenceExpiry = "La date d'expiration du permis est requise.";
    if (Object.keys(e).length) { setErrors(e); return; }
    if (editingId) {
      setDriverList(list => list.map(d => d.id === editingId ? {
        ...d,
        name: form.name.trim(),
        licenceCategories: [...form.licenceCategories].sort(),
        licenceExpiry: form.licenceExpiry,
        phone: form.phone.trim(),
        status: form.status,
      } : d));
      setShowModal(false);
      setEditingId(null);
      return;
    }
    const next: Driver = {
      id: `D${String(driverList.length + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      matricule: nextMatricule(driverList),
      licenceCategories: [...form.licenceCategories].sort(),
      licenceExpiry: form.licenceExpiry,
      phone: form.phone.trim(),
      status: form.status,
    };
    setDriverList(list => [...list, next]);
    setShowModal(false);
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'
    }`;

  const driverQuery = search.trim().toLowerCase();
  const filteredDrivers = driverList.filter(d =>
    !driverQuery ||
    `${d.name} ${d.matricule} ${d.phone}`.toLowerCase().includes(driverQuery),
  );

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted text-sm">{filteredDrivers.length} conducteur(s) enregistré(s)</p>
        <button onClick={openModal} className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouveau conducteur
        </button>
      </div>
      <div className="relative max-w-md">
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
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
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
            {filteredDrivers.map(d => {
              const expiry = new Date(d.licenceExpiry);
              const daysLeft = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const warning = daysLeft < 90;
              // Assigned to a mission (session or en attente / en cours) → En mission
              const sessionDriverIds = Object.values(assignments).map(a => a.driverId);
              const missionDriverIds = missions
                .filter(m => ['en_attente', 'en_cours'].includes(m.status) && m.driverId)
                .map(m => m.driverId as string);
              const assignedHere = [...sessionDriverIds, ...missionDriverIds].includes(d.id);
              const effStatus = assignedHere && d.status === 'disponible' ? 'en_mission' : d.status;
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
                      className="p-1.5 rounded-lg text-muted hover:bg-slate-100 hover:text-navy transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Statut initial</label>
                  <select className={inputClass('status')} value={form.status} onChange={e => set('status', e.target.value as Driver['status'])}>
                    {DRIVER_STATUSES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleAdd} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">{editingId ? 'Enregistrer' : 'Ajouter le conducteur'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminVehiclesPage({ onNavigate: _onNavigate, assignments }: { onNavigate: (page: string) => void; assignments: Record<string, { vehicleId: string; driverId: string }> }) {
  const [vehicleList, setVehicleList] = useState(vehicles);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({
    brand: '',
    model: '',
    type: '',
    registration: '',
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
    setForm({ brand: '', model: '', type: '', registration: '', capacity: 5, status: 'disponible', lastInspection: '', nextInspection: '' });
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
      type: v.type,
      registration: v.registration,
      capacity: v.capacity,
      status: v.status,
      lastInspection: v.lastInspection,
      nextInspection: v.nextInspection,
    });
    setErrors({});
    setDetailId(null);
    setShowForm(true);
  }

  function setVehicleStatus(id: string, status: typeof vehicleList[0]['status']) {
    setVehicleList(list => list.map(v => v.id === id ? { ...v, status } : v));
  }

  function handleSave() {
    const e: Record<string, string> = {};
    if (!form.brand.trim()) e.brand = 'La marque est requise.';
    if (!form.model.trim()) e.model = 'Le modèle est requis.';
    if (!form.type.trim()) e.type = 'Le type est requis.';
    if (!form.registration.trim()) e.registration = 'L\'immatriculation est requise.';
    if (!form.lastInspection) e.lastInspection = 'La dernière inspection est requise.';
    if (!form.nextInspection) e.nextInspection = 'La prochaine inspection est requise.';
    if (Object.keys(e).length) { setErrors(e); return; }

    if (editingId) {
      setVehicleList(list => list.map(v => v.id === editingId ? { ...v, ...form } : v));
    } else {
      const next: typeof vehicleList[0] = {
        id: `V${String(vehicleList.length + 1).padStart(3, '0')}`,
        ...form,
      };
      setVehicleList(list => [...list, next]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  const detailVehicle = vehicleList.find(v => v.id === detailId) ?? null;
  const vehicleTypes = [...new Set(vehicleList.map(v => v.type))];
  const vQuery = search.trim().toLowerCase();
  const filteredVehicles = vehicleList.filter(v =>
    (typeFilter === 'all' || v.type === typeFilter) &&
    (!vQuery || `${v.brand} ${v.model} ${v.registration}`.toLowerCase().includes(vQuery)),
  );

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted text-sm">{filteredVehicles.length} véhicule(s) enregistré(s)</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouveau véhicule
        </button>
      </div>
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
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
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
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredVehicles.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDetailId(v.id)}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zm0 0l3-4h2l2 4-1 2H13"/>
                      </svg>
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
                  <button onClick={(e) => { e.stopPropagation(); setDetailId(v.id); }} className="text-navy text-xs font-medium hover:underline whitespace-nowrap">Détails</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <label className="block text-sm font-medium text-ink mb-1.5">Capacité <span className="text-danger">*</span></label>
                <input type="number" min="1" max="60" className={inputClass('capacity')} value={form.capacity} onChange={e => setField('capacity', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Statut</label>
                <select className={inputClass('status')} value={form.status} onChange={e => setField('status', e.target.value as 'disponible' | 'affecte' | 'maintenance' | 'indisponible')}>
                  <option value="disponible">Disponible</option>
                  <option value="affecte">Affecté</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="indisponible">Indisponible</option>
                </select>
              </div>
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
          onEdit={(id) => openEdit(id)}
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
            {structures.map(s => (
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
      </div>
    </div>
  );
}
