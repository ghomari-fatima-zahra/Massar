import StatusBadge from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import { missions, currentUsers } from '../data/mock';
import type { Mission } from '../data/mock';

interface Props {
  onNavigate: (page: string, missionId?: string) => void;
}

export default function EmployeeDashboard({ onNavigate }: Props) {
  const user = currentUsers['admin'];
  const myMissions = missions.filter(m => m.matricule === user.matricule);

  const stats = {
    pending: myMissions.filter(m => m.status === 'en_attente').length,
    approved: myMissions.filter(m => ['en_cours'].includes(m.status)).length,
    upcoming: myMissions.filter(m => ['en_cours'].includes(m.status)).length,
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-ink text-xl font-semibold">
            Bonjour, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="text-muted text-sm mt-0.5">{user.structure} · {user.matricule}</p>
        </div>
        <button
          onClick={() => onNavigate('new-mission')}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle mission
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          label="Missions en attente"
          value={stats.pending}
          icon={<ClockIcon />}
          iconBg="bg-[#FEF3C7]"
          onClick={() => onNavigate('my-missions')}
        />
        <KPICard
          label="Missions approuvées"
          value={stats.approved}
          icon={<CheckCircleIcon />}
          iconBg="bg-[#DCFCE7]"
          onClick={() => onNavigate('my-missions')}
        />
        <KPICard
          label="Prochains déplacements"
          value={stats.upcoming}
          icon={<CalendarIcon />}
          iconBg="bg-[#E0F2FE]"
          onClick={() => onNavigate('my-missions')}
        />
      </div>

      {/* Upcoming mission alert */}
      {myMissions.filter(m => m.status === 'en_cours').length > 0 && (
        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0284C7] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-[#0369A1] font-semibold text-sm">Véhicule affecté à votre prochaine mission</p>
            {myMissions.filter(m => m.status === 'en_cours').map(m => (
              <p key={m.id} className="text-[#0369A1]/80 text-sm mt-0.5">
                Mission vers <strong>{m.destination}</strong> – départ le{' '}
                {new Date(m.departureDate).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long' })} à {m.departureTime}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Recent missions */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-ink font-semibold">Mes missions récentes</h3>
          <button onClick={() => onNavigate('my-missions')} className="text-navy text-sm font-medium hover:underline">
            Voir tout
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/50">
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Réf.</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Objet</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Destination</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Dates</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {myMissions.map((m: Mission) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{m.id}</td>
                <td className="px-5 py-3.5">
                  <p className="text-ink font-medium truncate max-w-[200px]">{m.object}</p>
                  <p className="text-muted text-xs capitalize">{m.type}</p>
                </td>
                <td className="px-5 py-3.5 text-ink">{m.destination}</td>
                <td className="px-5 py-3.5">
                  <p className="text-ink">{new Date(m.departureDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  {m.returnDate && m.departureDate !== m.returnDate && (
                    <p className="text-muted text-xs">→ {new Date(m.returnDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  )}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onNavigate('mission-detail', m.id)}
                    className="text-navy text-xs font-medium hover:underline"
                  >
                    Détails →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myMissions.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted">Aucune mission pour le moment.</p>
            <button onClick={() => onNavigate('new-mission')} className="mt-3 text-navy text-sm font-medium hover:underline">
              Créer une nouvelle mission
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ClockIcon() { return <svg className="w-5 h-5 text-[#B45309]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>; }
function CheckCircleIcon() { return <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>; }
function CalendarIcon() { return <svg className="w-5 h-5 text-[#0369A1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18"/></svg>; }
