import StatusBadge from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import { missions, vehicles, drivers } from '../data/mock';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

export default function FleetDashboard({ onNavigate }: Props) {
  const pending = missions.filter(m => m.status === 'en_attente');
  const active = missions.filter(m => m.status === 'en_cours');
  const availableVehicles = vehicles.filter(v => v.status === 'disponible').length;
  const availableDrivers = drivers.filter(d => d.status === 'disponible').length;
  const assigned = missions.filter(m => m.status === 'affectee');

  return (
    <div className="max-w-6xl space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="À valider"
          value={pending.length}
          icon={<AlertIcon />}
          iconBg="bg-[#FEF3C7]"
          onClick={() => onNavigate('validation')}
        />
        <KPICard
          label="Véhicules disponibles"
          value={availableVehicles}
          icon={<TruckIcon />}
          iconBg="bg-[#DCFCE7]"
        />
        <KPICard
          label="Conducteurs disponibles"
          value={availableDrivers}
          icon={<DriverIcon />}
          iconBg="bg-[#E0F2FE]"
        />
        <KPICard
          label="Missions en cours"
          value={active.length}
          icon={<PlayIcon />}
          iconBg="bg-[#FFF7ED]"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Pending queue */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-ink font-semibold">File de validation</h3>
              {pending.length > 0 && (
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#B45309] text-xs font-bold rounded-full">{pending.length}</span>
              )}
            </div>
            <button onClick={() => onNavigate('validation')} className="text-navy text-sm font-medium hover:underline">Voir tout →</button>
          </div>
          <div className="divide-y divide-border/60">
            {pending.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-success font-medium text-sm">✓ Aucune mission programmée</p>
              </div>
            ) : pending.map(m => (
              <div key={m.id} className="px-5 py-3.5 flex items-start justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-muted">{m.id}</span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                  <p className="text-ink text-sm font-medium">{m.object}</p>
                  <p className="text-muted text-xs mt-0.5">
                    {m.employee} · {m.departure} → {m.destination}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {new Date(m.departureDate).toLocaleDateString('fr-DZ')} à {m.departureTime}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('validation', m.id)}
                  className="flex-shrink-0 ml-4 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors"
                >
                  Traiter
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active missions */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-ink font-semibold">Missions actives aujourd'hui</h3>
            <button onClick={() => onNavigate('fleet-missions')} className="text-navy text-sm font-medium hover:underline">Voir tout →</button>
          </div>
          <div className="divide-y divide-border/60">
            {[...active, ...assigned].length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted text-sm">Aucune mission active</p>
              </div>
            ) : [...active, ...assigned].map(m => {
              const v = m.vehicleId ? vehicles.find(v => v.id === m.vehicleId) : null;
              const d = m.driverId ? drivers.find(dr => dr.id === m.driverId) : null;
              return (
                <div key={m.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-muted">{m.id}</span>
                        <StatusBadge status={m.status} size="sm" />
                      </div>
                      <p className="text-ink text-sm font-medium truncate">{m.object}</p>
                      <p className="text-muted text-xs mt-0.5">{m.departure} → {m.destination}</p>
                    </div>
                  </div>
                  {(v || d) && (
                    <div className="mt-2 flex gap-3">
                      {v && <span className="text-xs text-[#0369A1] bg-[#E0F2FE] px-2 py-1 rounded font-medium">🚗 {v.registration}</span>}
                      {d && <span className="text-xs text-[#0369A1] bg-[#E0F2FE] px-2 py-1 rounded font-medium">👤 {d.name}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fleet availability */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-ink font-semibold mb-4">Disponibilité de la flotte</h3>
        <div className="grid grid-cols-5 gap-3">
          {vehicles.map(v => (
            <div
              key={v.id}
              className={`p-3.5 rounded-lg border text-center ${
                v.status === 'disponible' ? 'border-green-200 bg-success-bg' :
                v.status === 'maintenance' ? 'border-orange-200 bg-warning-bg' :
                'border-border bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-1">🚗</div>
              <p className="text-xs font-bold text-ink">{v.brand}</p>
              <p className="font-mono text-[10px] text-muted mt-0.5">{v.registration}</p>
              <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                v.status === 'disponible' ? 'text-success bg-success-bg' :
                v.status === 'maintenance' ? 'text-warning bg-warning-bg' :
                'text-muted bg-slate-100'
              }`}>
                {v.status === 'disponible' ? 'Disponible' :
                 v.status === 'maintenance' ? 'Maintenance' :
                 v.status === 'affecte' ? 'Affecté' : 'Indisponible'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertIcon() { return <svg className="w-5 h-5 text-[#B45309]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>; }
function TruckIcon() { return <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zm0 0l3-4h2l2 4-1 2H13"/></svg>; }
function DriverIcon() { return <svg className="w-5 h-5 text-[#0369A1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>; }
function PlayIcon() { return <svg className="w-5 h-5 text-[#C2410C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon fill="currentColor" stroke="none" points="10,8 16,12 10,16"/></svg>; }
