import { useState } from 'react';
import { vehicles, drivers } from './data/mock';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import NewMissionForm from './pages/NewMissionForm';
import MissionDetail from './pages/MissionDetail';
import FleetMissions from './pages/FleetMissions';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';

type Page =
  | 'admin-dashboard' | 'fleet-missions' | 'new-mission' | 'mission-detail'
  | 'admin-drivers' | 'admin-vehicles' | 'admin-structures' | 'notifications';

const PAGE_TITLES: Record<string, string> = {
  'admin-dashboard': 'Tableau de bord',
  'fleet-missions': 'Missions',
  'new-mission': 'Nouvelle demande de mission',
  'mission-detail': 'Détail de la mission',
  'admin-drivers': 'Conducteurs',
  'admin-vehicles': 'Véhicules',
  'admin-structures': 'Structures organisationnelles',
  notifications: 'Notifications',
};

const PAGE_BREADCRUMBS: Record<string, string> = {
  'new-mission': 'Missions',
  'mission-detail': 'Missions',
  'admin-drivers': 'Administration',
  'admin-vehicles': 'Administration',
  'admin-structures': 'Administration',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('admin-dashboard');
  const [selectedMissionId, setSelectedMissionId] = useState<string | undefined>();

  function handleLogin() {
    setCurrentPage('admin-dashboard');
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPage('admin-dashboard');
  }

  function navigate(page: string, id?: string) {
    setCurrentPage(page as Page);
    if (page === 'mission-detail' && id) setSelectedMissionId(id);
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => handleLogin()} />;
  }

  function renderPage() {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case 'fleet-missions':
        return <FleetMissions onNavigate={navigate} />;
      case 'new-mission':
        return <NewMissionForm onNavigate={navigate} />;
      case 'mission-detail':
        return <MissionDetail missionId={selectedMissionId || 'M2024-001'} onNavigate={navigate} />;
      case 'admin-drivers':
        return <AdminDriversPage />;
      case 'admin-vehicles':
        return <AdminVehiclesPage onNavigate={navigate} />;
      case 'admin-structures':
        return <AdminStructuresPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigate} />;
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

function AdminDriversPage() {
  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouveau conducteur
        </button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Conducteur</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Matricule</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Permis</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Expiration</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {drivers.map(d => {
              const expiry = new Date(d.licenceExpiry);
              const daysLeft = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const warning = daysLeft < 90;
              return (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">{d.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</div>
                      <div>
                        <p className="text-ink font-medium">{d.name}</p>
                        <p className="text-muted text-xs">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">{d.matricule}</td>
                  <td className="px-5 py-4"><span className="px-2 py-1 bg-navy-light text-navy text-xs font-semibold rounded">{d.licenceCategories.join(' + ')}</span></td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-medium ${warning ? 'text-warning' : 'text-ink'}`}>{expiry.toLocaleDateString('fr-DZ')}</p>
                    {warning && <p className="text-warning text-xs">⚠ {daysLeft}j restants</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      d.status === 'disponible' ? 'bg-success-bg text-success' :
                      d.status === 'en_mission' ? 'bg-[#FFF7ED] text-[#C2410C]' :
                      d.status === 'conge' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                      'bg-slate-100 text-muted'
                    }`}>
                      {d.status === 'disponible' ? 'Disponible' : d.status === 'en_mission' ? 'En mission' : d.status === 'conge' ? 'En congé' : 'Indisponible'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminVehiclesPage({ onNavigate: _onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouveau véhicule
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-ink font-bold text-lg">{v.brand} {v.model}</p>
                <p className="font-mono text-muted text-sm">{v.registration}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${
                v.status === 'disponible' ? 'bg-success-bg text-success' :
                v.status === 'maintenance' ? 'bg-warning-bg text-warning' :
                v.status === 'affecte' ? 'bg-navy-light text-navy' :
                'bg-slate-100 text-muted'
              }`}>
                {v.status === 'disponible' ? 'Disponible' : v.status === 'maintenance' ? 'Maintenance' : v.status === 'affecte' ? 'Affecté' : 'Indisponible'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted text-xs">Type</p><p className="text-ink font-medium">{v.type}</p></div>
              <div><p className="text-muted text-xs">Capacité</p><p className="text-ink font-medium">{v.capacity} places</p></div>
              <div><p className="text-muted text-xs">Dernière inspection</p><p className="text-ink font-medium">{new Date(v.lastInspection).toLocaleDateString('fr-DZ')}</p></div>
              <div><p className="text-muted text-xs">Prochaine inspection</p><p className="text-ink font-medium">{new Date(v.nextInspection).toLocaleDateString('fr-DZ')}</p></div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button className="flex-1 py-1.5 border border-border text-ink text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">Modifier</button>
              <button className="flex-1 py-1.5 border border-danger text-danger text-xs font-medium rounded-lg hover:bg-danger-bg transition-colors">Désactiver</button>
            </div>
          </div>
        ))}
      </div>
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
