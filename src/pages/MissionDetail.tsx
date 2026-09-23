import StatusBadge from '../components/StatusBadge';
import { missions, vehicles, drivers, STATUS_LABELS } from '../data/mock';
import type { Status } from '../data/mock';

interface Props {
  missionId: string;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

const STATUS_ORDER: Status[] = ['en_attente', 'affectee', 'en_cours', 'terminee'];

export default function MissionDetail({ missionId, onNavigate: _onNavigate, onBack }: Props) {
  const mission = missions.find(m => m.id === missionId) || missions[0];
  const vehicle = mission.vehicleId ? vehicles.find(v => v.id === mission.vehicleId) : null;
  const driver = mission.driverId ? drivers.find(d => d.id === mission.driverId) : null;

  const currentStep = STATUS_ORDER.indexOf(mission.status as Status);

  const activityLog = [
    { date: mission.createdAt, time: '10:23', action: 'Mission créée', by: mission.employee, color: 'bg-muted' },
    ...(mission.status !== 'brouillon' ? [{ date: mission.createdAt, time: '10:24', action: 'Soumise pour validation', by: mission.employee, color: 'bg-[#F59E0B]' }] : []),
    ...(mission.validatedBy ? [{ date: mission.departureDate, time: '09:15', action: mission.status === 'rejetee' ? 'Mission rejetée' : 'Mission validée', by: mission.validatedBy, color: mission.status === 'rejetee' ? 'bg-danger' : 'bg-success' }] : []),
    ...(mission.vehicleId ? [{ date: mission.departureDate, time: '11:00', action: 'Véhicule et conducteur affectés', by: 'Rachid Aouad', color: 'bg-[#0284C7]' }] : []),
  ];

  return (
    <div className="max-w-5xl space-y-5">
      {/* Back — returns to the previous page */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Retour
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-muted">{mission.id}</span>
            <StatusBadge status={mission.status as Status} />
          </div>
          <h2 className="text-ink text-xl font-bold">{mission.object}</h2>
          <p className="text-muted text-sm mt-1">{mission.departure} → {mission.destination} · {mission.passengers} passager(s)</p>
        </div>
        {['brouillon', 'en_attente'].includes(mission.status) && (
          <button className="flex-shrink-0 px-4 py-2 border border-danger text-danger text-sm font-medium rounded-lg hover:bg-danger-bg transition-colors">
            Annuler la mission
          </button>
        )}
      </div>

      {/* Timeline */}
      {mission.status !== 'rejetee' && mission.status !== 'annulee' && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4 text-sm uppercase tracking-wide text-muted">Progression</h3>
          <div className="flex items-center">
            {STATUS_ORDER.map((s, idx) => {
              const done = idx <= currentStep;
              const current = idx === currentStep;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      current ? 'border-navy bg-navy text-white' :
                      done ? 'border-success bg-success text-white' :
                      'border-border bg-white text-muted'
                    }`}>
                      {done && !current ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : idx + 1}
                    </div>
                    <p className={`text-[11px] mt-1.5 text-center font-medium whitespace-nowrap ${current ? 'text-navy' : done ? 'text-success' : 'text-muted/60'}`}>
                      {STATUS_LABELS[s]}
                    </p>
                  </div>
                  {idx < STATUS_ORDER.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentStep ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection banner */}
      {mission.status === 'rejetee' && mission.rejectionReason && (
        <div className="flex items-start gap-3 p-4 bg-danger-bg border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-danger font-semibold text-sm">Mission rejetée</p>
            <p className="text-danger/80 text-sm mt-0.5">{mission.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Mission info */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <h3 className="text-ink font-semibold mb-4">Informations de la mission</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Type', value: mission.type === 'interne' ? 'Interne' : 'Externe' },
                { label: 'Employé', value: mission.employee },
                { label: 'Matricule', value: mission.matricule },
                { label: 'Structure', value: mission.structure },
                { label: 'Départ', value: `${mission.departure}` },
                { label: 'Destination', value: `${mission.destination}` },
                { label: 'Date départ', value: `${new Date(mission.departureDate).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${mission.departureTime}` },
                { label: 'Date retour', value: mission.returnDate ? `${new Date(mission.returnDate).toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${mission.returnTime || '—'}` : 'Non renseignée — le conducteur déclarera son arrivée' },
                { label: 'Passagers', value: `${mission.passengers} personne(s)` },
                { label: 'Véhicule demandé', value: mission.vehicleNeeded ? `Oui – ${mission.vehicleType || 'Non spécifié'}` : 'Non' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-ink text-sm mt-0.5 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment */}
          {(vehicle || driver) && (
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <h3 className="text-ink font-semibold mb-4">Affectation</h3>
              <div className="grid grid-cols-2 gap-4">
                {vehicle && (
                  <div className="p-4 rounded-lg border border-[#BAE6FD] bg-[#F0F9FF]">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-[#0284C7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zm0 0l3-4h2l2 4-1 2H13"/>
                      </svg>
                      <span className="text-[#0369A1] text-xs font-semibold uppercase tracking-wide">Véhicule</span>
                    </div>
                    <p className="text-ink font-bold">{vehicle.brand} {vehicle.model}</p>
                    <p className="font-mono text-sm text-muted mt-0.5">{vehicle.registration}</p>
                    <p className="text-muted text-xs mt-1">{vehicle.type} · {vehicle.capacity} places</p>
                  </div>
                )}
                {driver && (
                  <div className="p-4 rounded-lg border border-[#BAE6FD] bg-[#F0F9FF]">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-[#0284C7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span className="text-[#0369A1] text-xs font-semibold uppercase tracking-wide">Conducteur</span>
                    </div>
                    <p className="text-ink font-bold">{driver.name}</p>
                    <p className="text-muted text-sm mt-0.5">{driver.matricule}</p>
                    <p className="text-muted text-xs mt-1">Permis {driver.licenceCategories.join('+')} · {driver.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Historique</h3>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {activityLog.map((log, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  <div className={`w-7 h-7 rounded-full ${log.color} flex-shrink-0 flex items-center justify-center z-10`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="4"/>
                    </svg>
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-ink text-sm font-medium">{log.action}</p>
                    <p className="text-muted text-xs">{log.by}</p>
                    <p className="text-muted/60 text-xs mt-0.5">{new Date(log.date).toLocaleDateString('fr-DZ')} à {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
