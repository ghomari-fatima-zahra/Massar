import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { missions } from '../data/mock';

interface Props {
  selectedId?: string;
  onNavigate: (page: string, id?: string) => void;
}

export default function ValidationPage({ selectedId, onNavigate }: Props) {
  const pending = missions.filter(m => m.status === 'en_attente');
  const [activeMissionId, setActiveMissionId] = useState(selectedId || pending[0]?.id || '');
  const [showModal, setShowModal] = useState<'approve' | null>(null);
  const [done, setDone] = useState<{ id: string; action: 'approved' }[]>([]);

  const activeMission = missions.find(m => m.id === activeMissionId);
  const remainingPending = pending.filter(m => !done.find(d => d.id === m.id));

  function handleApprove() {
    setDone(d => [...d, { id: activeMissionId, action: 'approved' }]);
    setShowModal(null);
    const next = remainingPending.find(m => m.id !== activeMissionId);
    if (next) setActiveMissionId(next.id);
  }

  if (remainingPending.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="text-ink text-xl font-bold mb-2">File de validation traitée</h3>
        <p className="text-muted text-sm mb-6">Toutes les demandes programmées ont été traitées.</p>
        <button onClick={() => onNavigate('fleet-dashboard')} className="px-5 py-2.5 bg-navy text-white font-semibold rounded-lg text-sm hover:bg-navy-dark transition-colors">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl flex gap-5">
      {/* Left: mission list */}
      <div className="w-72 flex-shrink-0 space-y-2">
        <h3 className="text-muted text-xs font-semibold uppercase tracking-wider px-1 mb-3">
          Programmées ({remainingPending.length})
        </h3>
        {remainingPending.map(m => {
          const isDone = done.find(d => d.id === m.id);
          return (
            <button
              key={m.id}
              onClick={() => setActiveMissionId(m.id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                activeMissionId === m.id
                  ? 'border-navy bg-navy-light shadow-sm'
                  : 'border-border bg-white hover:border-navy/30 shadow-sm'
              } ${isDone ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted">{m.id}</span>
                <StatusBadge status={m.status} size="sm" />
              </div>
              <p className="text-ink text-sm font-medium line-clamp-2">{m.object}</p>
              <p className="text-muted text-xs mt-1">{m.employee}</p>
              <p className="text-muted text-xs">{m.departure} → {m.destination}</p>
            </button>
          );
        })}
      </div>

      {/* Right: detail */}
      {activeMission && (
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm text-muted">{activeMission.id}</span>
                  <StatusBadge status={activeMission.status} />
                </div>
                <h2 className="text-ink text-xl font-bold">{activeMission.object}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
              {[
                { label: 'Demandeur', value: activeMission.employee },
                { label: 'Matricule', value: activeMission.matricule },
                { label: 'Structure', value: activeMission.structure },
                { label: 'Type', value: activeMission.type === 'interne' ? 'Mission interne' : 'Mission externe' },
                { label: 'Départ', value: `${activeMission.departure} – ${new Date(activeMission.departureDate).toLocaleDateString('fr-DZ')} à ${activeMission.departureTime}` },
                { label: 'Retour', value: activeMission.returnDate ? `${activeMission.destination} – ${new Date(activeMission.returnDate).toLocaleDateString('fr-DZ')} à ${activeMission.returnTime || '—'}` : `${activeMission.destination} – À déclarer par le conducteur` },
                { label: 'Passagers', value: `${activeMission.passengers} personne(s)` },
                { label: 'Véhicule requis', value: activeMission.vehicleNeeded ? `Oui – ${activeMission.vehicleType}` : 'Non' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-slate-50">
                  <p className="text-muted text-xs font-medium">{label}</p>
                  <p className="text-ink text-sm font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center justify-between">
            <p className="text-muted text-sm">Traitez cette demande de mission avant de passer à la suivante.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal('approve')}
                className="px-5 py-2.5 bg-success text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Valider la mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval modal */}
      {showModal === 'approve' && (
        <Modal onClose={() => setShowModal(null)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-ink text-lg font-bold mb-2">Confirmer la validation</h3>
            <p className="text-muted text-sm mb-6">
              Vous allez valider la mission <strong>{activeMission?.id}</strong>.<br/>
              La demande sera transmise pour affectation du véhicule et du conducteur.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowModal(null)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleApprove} className="px-6 py-2.5 bg-success text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">Confirmer la validation</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection modal */}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
