import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { missions, vehicles, drivers } from '../data/mock';
import type { Vehicle, Driver } from '../data/mock';

interface Props {
  selectedId?: string;
  onNavigate: (page: string) => void;
}

export default function AssignmentPage({ selectedId, onNavigate }: Props) {
  // Missions awaiting assignment: pending requests without a vehicle yet
  // (workflow: en_attente → en_cours → terminée)
  const assignable = missions.filter(
    (m) => m.status === 'en_attente' && !m.vehicleId,
  );
  const [activeMissionId, setActiveMissionId] = useState(selectedId || assignable[0]?.id || '');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [assigned, setAssigned] = useState<string[]>([]);

  const mission = missions.find(m => m.id === activeMissionId);
  const availableVehicles = vehicles.filter(v => v.status === 'disponible');
  const availableDrivers = drivers.filter(d => d.status === 'disponible');

  const selVehicle = vehicles.find(v => v.id === selectedVehicle);
  const selDriver = drivers.find(d => d.id === selectedDriver);

  function handleAssign() {
    setAssigned(a => [...a, activeMissionId]);
    setShowConfirm(false);
    setSelectedVehicle(null);
    setSelectedDriver(null);
    const next = assignable.find(m => m.id !== activeMissionId && !assigned.includes(m.id));
    if (next) setActiveMissionId(next.id);
  }

  const remaining = assignable.filter(m => !assigned.includes(m.id));

  const licenceOk = (d: Driver) => {
    const expiry = new Date(d.licenceExpiry);
    return expiry > new Date();
  };

  const licenceWarning = (d: Driver) => {
    const expiry = new Date(d.licenceExpiry);
    const diff = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 90;
  };

  if (remaining.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="text-ink text-xl font-bold mb-2">Toutes les missions sont affectées</h3>
        <p className="text-muted text-sm mb-6">Il n'y a aucune mission programmée à affecter.</p>
        <button onClick={() => onNavigate('fleet-dashboard')} className="px-5 py-2.5 bg-navy text-white font-semibold rounded-lg text-sm hover:bg-navy-dark transition-colors">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-5">
      {/* Mission selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {remaining.map(m => (
          <button
            key={m.id}
            onClick={() => { setActiveMissionId(m.id); setSelectedVehicle(null); setSelectedDriver(null); }}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all ${
              activeMissionId === m.id ? 'border-navy bg-navy-light' : 'border-border bg-white hover:border-navy/30 shadow-sm'
            }`}
          >
            <p className="font-mono text-xs text-muted">{m.id}</p>
            <p className="text-ink text-sm font-semibold mt-0.5">{m.departure} → {m.destination}</p>
            <p className="text-muted text-xs mt-0.5">{new Date(m.departureDate).toLocaleDateString('fr-DZ')} à {m.departureTime}</p>
          </button>
        ))}
      </div>

      {mission && (
        <>
          {/* Mission summary */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-muted">{mission.id}</span>
                  <StatusBadge status={mission.status} />
                </div>
                <h2 className="text-ink text-lg font-bold">{mission.object}</h2>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <InfoChip label="Demandeur" value={mission.employee} />
              <InfoChip label="Trajet" value={`${mission.departure} → ${mission.destination}`} />
              <InfoChip label="Départ" value={`${new Date(mission.departureDate).toLocaleDateString('fr-DZ')} ${mission.departureTime}`} />
              <InfoChip label="Retour" value={mission.returnDate ? `${new Date(mission.returnDate).toLocaleDateString('fr-DZ')} ${mission.returnTime || ''}`.trim() : 'À déclarer par le conducteur'} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Vehicle selection */}
            <div className="bg-white rounded-xl border border-border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-ink font-semibold">Véhicules disponibles</h3>
                <p className="text-muted text-xs mt-0.5">Sélectionnez le véhicule à affecter</p>
              </div>
              <div className="divide-y divide-border/60">
                {availableVehicles.map((v: Vehicle) => (
                  <label
                    key={v.id}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${selectedVehicle === v.id ? 'bg-navy-light' : 'hover:bg-slate-50/50'}`}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      value={v.id}
                      checked={selectedVehicle === v.id}
                      onChange={() => setSelectedVehicle(v.id)}
                      className="mt-1 accent-navy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-ink font-semibold text-sm">{v.brand} {v.model}</p>
                        <span className="text-[10px] font-semibold text-success bg-success-bg px-2 py-0.5 rounded-full">Disponible</span>
                      </div>
                      <p className="font-mono text-xs text-muted mt-0.5">{v.registration}</p>
                      <p className="text-muted text-xs mt-1">{v.type} · {v.capacity} places</p>
                      <p className="text-muted text-xs">Proch. inspection : {new Date(v.nextInspection).toLocaleDateString('fr-DZ')}</p>
                    </div>
                  </label>
                ))}
                {availableVehicles.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-muted text-sm">Aucun véhicule disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver selection */}
            <div className="bg-white rounded-xl border border-border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-ink font-semibold">Conducteurs disponibles</h3>
                <p className="text-muted text-xs mt-0.5">Sélectionnez le conducteur à affecter</p>
              </div>
              <div className="divide-y divide-border/60">
                {availableDrivers.map((d: Driver) => {
                  const expiring = licenceWarning(d);
                  const ok = licenceOk(d);
                  return (
                    <label
                      key={d.id}
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${selectedDriver === d.id ? 'bg-navy-light' : 'hover:bg-slate-50/50'}`}
                    >
                      <input
                        type="radio"
                        name="driver"
                        value={d.id}
                        checked={selectedDriver === d.id}
                        onChange={() => setSelectedDriver(d.id)}
                        className="mt-1 accent-navy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-ink font-semibold text-sm">{d.name}</p>
                          <span className="text-[10px] font-semibold text-success bg-success-bg px-2 py-0.5 rounded-full">Disponible</span>
                        </div>
                        <p className="text-muted text-xs mt-0.5">{d.matricule} · {d.phone}</p>
                        <p className="text-muted text-xs mt-1">Permis : {d.licenceCategories.join(', ')}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className={`text-xs ${expiring ? 'text-warning font-medium' : 'text-muted'}`}>
                            Expire le {new Date(d.licenceExpiry).toLocaleDateString('fr-DZ')}
                          </p>
                          {expiring && <span className="text-warning text-xs">⚠ Bientôt expiré</span>}
                          {!ok && <span className="text-danger text-xs font-semibold">✗ Expiré</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {availableDrivers.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-muted text-sm">Aucun conducteur disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-muted text-xs font-medium">Véhicule sélectionné</p>
                <p className="text-ink text-sm font-semibold mt-0.5">
                  {selVehicle ? `${selVehicle.brand} ${selVehicle.model} – ${selVehicle.registration}` : '—'}
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-muted text-xs font-medium">Conducteur sélectionné</p>
                <p className="text-ink text-sm font-semibold mt-0.5">{selDriver?.name || '—'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedVehicle || !selectedDriver}
              className="px-6 py-2.5 bg-orange hover:bg-orange-dark text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Affecter →
            </button>
          </div>
        </>
      )}

      {/* Confirm modal */}
      {showConfirm && selVehicle && selDriver && mission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-ink text-lg font-bold mb-4">Confirmer l'affectation</h3>
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-muted text-xs font-medium">Mission</p>
                <p className="text-ink text-sm font-semibold">{mission.id} – {mission.object}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-muted text-xs font-medium">Véhicule</p>
                <p className="text-ink text-sm font-semibold">{selVehicle.brand} {selVehicle.model} – {selVehicle.registration}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-muted text-xs font-medium">Conducteur</p>
                <p className="text-ink text-sm font-semibold">{selDriver.name} ({selDriver.matricule})</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleAssign} className="flex-1 px-4 py-2.5 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-dark transition-colors">Confirmer l'affectation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-muted text-xs font-medium">{label}</p>
      <p className="text-ink text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
