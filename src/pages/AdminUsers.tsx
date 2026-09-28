import { useState } from 'react';
import { users } from '../data/mock';
import type { AppUser } from '../data/mock';

interface Props {
  onNavigate: (page: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
};

export default function AdminUsers({ onNavigate: _onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<AppUser | null>(null);
  const [editUser, setEditUser] = useState<AppUser | null>(null);

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.matricule.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Nom, e-mail, matricule…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy bg-white" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button onClick={() => setShowModal(true)} className="ml-auto flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: users.length, color: 'text-ink' },
          { label: 'Actifs', value: users.filter(u => u.status === 'actif').length, color: 'text-success' },
          { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, color: 'text-navy' },
          { label: 'Inactifs', value: users.filter(u => u.status === 'inactif').length, color: 'text-muted' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-border shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-muted text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Utilisateur</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Matricule</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Structure</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Rôle</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Créé le</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-ink font-medium">{u.name}</p>
                      <p className="text-muted text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{u.matricule}</td>
                <td className="px-5 py-3.5 text-ink text-sm">{u.structure}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9]">
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === 'actif' ? 'bg-success-bg text-success' : 'bg-slate-100 text-muted'}`}>
                    {u.status === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted text-xs">{new Date(u.createdAt).toLocaleDateString('fr-DZ')}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setEditUser(u)} className="p-1.5 text-muted hover:text-navy transition-colors rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => setDeleteUser(u)} className="p-1.5 text-muted hover:text-danger transition-colors rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          <p className="text-muted text-sm">{filtered.length} utilisateur(s)</p>
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-ink text-lg font-bold">Nouvel utilisateur</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Nom complet <span className="text-danger">*</span></label>
                  <input type="text" placeholder="Prénom Nom" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Matricule <span className="text-danger">*</span></label>
                  <input type="text" placeholder="ALT-XXXX" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Adresse e-mail <span className="text-danger">*</span></label>
                <input type="email" placeholder="prenom.nom@dot.dz" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/15"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Rôle</label>
                  <div className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink bg-slate-50 font-medium">Administrateur</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Structure <span className="text-danger">*</span></label>
                  <select className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy">
                    <option>Direction Générale</option>
                    <option>Direction Régionale Oran</option>
                    <option>Direction Régionale Constantine</option>
                    <option>Centre Télécom Tlemcen</option>
                    <option>Division Infrastructure</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">Créer l'utilisateur</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="text-ink font-bold text-lg mb-2">Désactiver l'utilisateur ?</h3>
            <p className="text-muted text-sm mb-6">L'utilisateur <strong>{deleteUser.name}</strong> sera désactivé et ne pourra plus accéder à la plateforme.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteUser(null)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => setDeleteUser(null)} className="px-5 py-2.5 bg-danger text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">Désactiver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
