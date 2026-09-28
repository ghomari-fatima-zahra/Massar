import { useState } from 'react';
import type { AppUser } from '../data/mock';

interface Props {
  employees: AppUser[];
  onAdd: (data: { name: string; email: string; matricule: string; structure: string }) => void;
  onDelete: (id: string) => void;
}

export default function EmployesPage({ employees, onAdd, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', matricule: '', structure: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function handleAdd() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom complet est requis.';
    if (!form.email.trim()) e.email = "L'adresse e-mail est requise.";
    if (!form.matricule.trim()) e.matricule = 'Le matricule est requis.';
    if (!form.structure.trim()) e.structure = 'La structure est requise.';
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({
      name: form.name.trim(),
      email: form.email.trim(),
      matricule: form.matricule.trim().toUpperCase(),
      structure: form.structure.trim(),
    });
    setForm({ name: '', email: '', matricule: '', structure: '' });
    setErrors({});
    setShowModal(false);
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'
    }`;

  const q = search.trim().toLowerCase();
  const filtered = employees.filter(e =>
    !q || `${e.name} ${e.email} ${e.matricule} ${e.structure}`.toLowerCase().includes(q),
  );

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted text-sm">{filtered.length} employé(s) enregistré(s)</p>
        <button
          onClick={() => { setForm({ name: '', email: '', matricule: '', structure: '' }); setErrors({}); setShowModal(true); }}
          className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Nouvel employé
        </button>
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Rechercher un employé…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">Matricule</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Structure</th>
              <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {e.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink font-medium truncate">{e.name}</p>
                      <p className="text-muted text-xs truncate">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted whitespace-nowrap">{e.matricule}</td>
                <td className="px-4 py-3.5 text-ink text-sm">{e.structure}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${e.status === 'actif' ? 'bg-success-bg text-success' : 'bg-slate-100 text-muted'}`}>
                    {e.status === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => setPendingDelete(e)}
                    title="Supprimer l'employé"
                    className="p-1.5 rounded-lg text-muted hover:bg-danger-bg hover:text-danger transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted text-sm">Aucun employé trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-ink text-lg font-bold">Nouvel employé</h3>
                <p className="text-muted text-sm mt-0.5">Il sera proposable comme demandeur de mission</p>
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
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Adresse e-mail <span className="text-danger">*</span></label>
                <input type="email" placeholder="ex. karim.benali@dot.dz" className={inputClass('email')} value={form.email} onChange={e => set('email', e.target.value)} />
                {errors.email && <p className="mt-1.5 text-xs text-danger">⚠ {errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Matricule <span className="text-danger">*</span></label>
                  <input type="text" placeholder="ex. ALT-0456" className={`${inputClass('matricule')} font-mono`} value={form.matricule} onChange={e => set('matricule', e.target.value.toUpperCase())} />
                  {errors.matricule && <p className="mt-1.5 text-xs text-danger">⚠ {errors.matricule}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Structure <span className="text-danger">*</span></label>
                  <input type="text" placeholder="ex. Direction Régionale Oran" className={inputClass('structure')} value={form.structure} onChange={e => set('structure', e.target.value)} />
                  {errors.structure && <p className="mt-1.5 text-xs text-danger">⚠ {errors.structure}</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleAdd} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">Ajouter l'employé</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setPendingDelete(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="text-ink font-bold text-lg mb-2">Supprimer l'employé ?</h3>
            <p className="text-muted text-sm mb-6"><strong>{pendingDelete.name}</strong> ne sera plus proposable comme demandeur.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setPendingDelete(null)} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => { onDelete(pendingDelete.id); setPendingDelete(null); }} className="px-5 py-2.5 bg-danger text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
