import { useState } from 'react';
import { currentUsers } from '../data/mock';

const FAQS = [
  {
    q: 'Comment créer une mission ?',
    a: "Ouvrez « Nouvelle demande », renseignez l'objet, le départ, la destination et les dates, puis choisissez un conducteur et un véhicule disponibles dans la section Affectation. La mission est créée avec le statut En attente, véhicule déjà précisé.",
  },
  {
    q: 'Comment une mission démarre-t-elle ?',
    a: "C'est le conducteur qui appuie sur « Démarrer la mission ». Le statut passe alors automatiquement de En attente à En cours, et le conducteur passe En mission.",
  },
  {
    q: 'Que signifient les statuts ?',
    a: "En attente : mission créée, en attente de démarrage. En cours : le conducteur a démarré. Terminée : mission clôturée, le conducteur déclare son arrivée (date de retour facultative à la création). Rejetée : demande refusée avec motif.",
  },
  {
    q: 'Pourquoi un conducteur passe-t-il En mission tout seul ?',
    a: "Le statut En mission est automatique dès que le conducteur est affecté à une mission en attente ou en cours. L'administrateur peut changer manuellement les autres statuts via l'icône de modification.",
  },
  {
    q: 'Comment suivre les inspections des véhicules ?',
    a: "La page Véhicules affiche la dernière et la prochaine inspection de chaque véhicule, avec une alerte « En retard » quand la date est dépassée. Ouvrez la fiche Détails pour changer le statut (Disponible, Maintenance, Indisponible).",
  },
  {
    q: 'La carte ne montre pas ma mission, que faire ?',
    a: "Les missions Alger → Blida affichent un aperçu statique en attendant la carte temps réel du backend. Les autres trajets utilisent la carte interactive limitée à l'Algérie.",
  },
];

export default function AidePage() {
  const [open, setOpen] = useState<number | null>(0);
  const admin = currentUsers['admin'];

  return (
    <div className="w-full max-w-4xl space-y-5">
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-ink text-lg font-bold">Centre d'aide</h2>
        <p className="text-muted text-sm mt-1">
          Questions fréquentes sur l'utilisation de Massar Fleet.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden divide-y divide-border/60">
        {FAQS.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
              >
                <span className="text-ink text-sm font-semibold">{f.q}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm leading-6 text-muted">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {admin.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-muted text-xs font-medium uppercase tracking-wide">Votre administrateur</p>
          <p className="text-ink text-sm font-semibold mt-0.5">{admin.name} · {admin.matricule}</p>
          <p className="text-muted text-xs">{admin.structure}</p>
        </div>
      </div>
    </div>
  );
}
