import { useState } from 'react';
import { users } from '../data/mock';
import type { Role } from '../data/mock';

interface Props {
  onNavigate: (page: string) => void;
}

type Tab = 'general' | 'users' | 'vehicles' | 'notifications' | 'security';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'general', label: 'Général', icon: '⚙️' },
  { id: 'users', label: 'Utilisateurs', icon: '👥' },
  { id: 'vehicles', label: 'Véhicules', icon: '🚗' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security', label: 'Sécurité', icon: '🔒' },
];

const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employé',
  fleet_manager: 'Gestionnaire flotte',
  admin: 'Administrateur',
};

const ROLE_COLORS: Record<Role, string> = {
  employee: 'bg-slate-100 text-slate-700',
  fleet_manager: 'bg-navy-light text-navy',
  admin: 'bg-amber-50 text-amber-700',
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ParametresPage({ onNavigate: _onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    matricule: '',
    role: 'employee' as Role,
    structure: '',
    status: 'actif' as 'actif' | 'inactif',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openUserModal(u?: typeof users[0]) {
    if (u) {
      setEditingUser(u);
      setForm({ name: u.name, email: u.email, matricule: u.matricule, role: u.role, structure: u.structure, status: u.status });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', matricule: '', role: 'employee', structure: '', status: 'actif' });
    }
    setErrors({});
    setShowUserModal(true);
  }

  function handleSaveUser() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Le nom est requis.';
    if (!form.email.trim()) e.email = "L'email est requis.";
    if (!form.matricule.trim()) e.matricule = 'Le matricule est requis.';
    if (!form.structure.trim()) e.structure = 'La structure est requise.';
    if (Object.keys(e).length) { setErrors(e); return; }
    // In real app: save to backend
    setShowUserModal(false);
    setEditingUser(null);
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${errors[field] ? 'border-danger focus:ring-danger/20 bg-danger-bg/30' : 'border-border focus:border-navy focus:ring-navy/15 bg-white'}`;

  function renderGeneral() {
    return (
      <div className="space-y-5 w-full">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Informations de l'organisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Nom de l'organisation</label>
              <input type="text" value="Algérie Télécom" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink bg-slate-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Code organisation</label>
              <input type="text" value="DG-AT" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink font-mono bg-slate-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Directeur général</label>
              <input type="text" value="M. Le Directeur" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Adresse</label>
              <input type="text" value="Alger, Algérie" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
              <textarea rows={3} className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60" placeholder="Description de l'organisation…" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">Enregistrer</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Préférences d'affichage</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
              <span className="text-sm text-ink">Mode sombre automatique</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
              <span className="text-sm text-ink">Afficher les compteurs dans la barre latérale</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-navy" />
              <span className="text-sm text-ink">Notifications sonores</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
              <span className="text-sm text-ink">Langue française par défaut</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="space-y-5 w-full">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-ink font-semibold">Gestion des utilisateurs</h3>
          <button onClick={() => openUserModal()} className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Ajouter un utilisateur
          </button>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-slate-50/80">
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Matricule</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Rôle</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Structure</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-muted font-medium text-xs uppercase tracking-wider">Créé le</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center flex-shrink-0">{u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                      <span className="text-ink font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-muted whitespace-nowrap">{u.matricule}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td className="px-4 py-3 text-ink text-sm">{u.structure}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'actif' ? 'bg-success-bg text-success' : 'bg-slate-100 text-muted'}`}>{u.status === 'actif' ? 'Actif' : 'Inactif'}</span></td>
                  <td className="px-4 py-3 text-muted text-sm whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openUserModal(u)} className="text-navy text-xs font-medium hover:underline whitespace-nowrap">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderVehicles() {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 w-full">
        <h3 className="text-ink font-semibold mb-4">Paramètres véhicules</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
            <div>
              <p className="text-sm font-medium text-ink">Alertes maintenance automatiques</p>
              <p className="text-muted text-xs">Recevoir une notification 30 jours avant l'échéance</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
            <div>
              <p className="text-sm font-medium text-ink">Suivi GPS activé</p>
              <p className="text-muted text-xs">Localisation temps réel des véhicules</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-navy" />
            <div>
              <p className="text-sm font-medium text-ink">Carburant : alertes seuil bas</p>
              <p className="text-muted text-xs">Notification quand le réservoir est sous les 20%</p>
            </div>
          </label>
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-ink mb-2">Seuil d'alerte maintenance (jours)</label>
            <input type="number" defaultValue={30} min={7} max={90} className="w-32 px-3 py-2 rounded-lg border border-border text-sm text-ink focus:outline-none focus:border-navy" />
          </div>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 w-full">
        <h3 className="text-ink font-semibold mb-4">Préférences de notification</h3>
        <div className="space-y-4">
          {[
            { key: 'mission_created', label: 'Nouvelle mission créée', desc: "Lorsqu'une demande de mission est soumise" },
            { key: 'mission_validated', label: 'Mission validée', desc: "Quand une mission est validée par l'admin" },
            { key: 'mission_started', label: 'Mission démarrée', desc: 'Le conducteur démarre la mission' },
            { key: 'mission_completed', label: 'Mission terminée', desc: 'La mission est marquée comme terminée' },
            { key: 'vehicle_maintenance', label: 'Maintenance véhicule', desc: "Échéance d'inspection ou maintenance" },
            { key: 'driver_licence', label: 'Expiration permis', desc: 'Alerte 90 jours avant expiration' },
          ].map(n => (
            <label key={n.key} className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-slate-50/50 transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 accent-navy" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{n.label}</p>
                <p className="text-muted text-xs mt-0.5">{n.desc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-muted">Email</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
                <span className="text-xs font-medium text-muted">In-app</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-navy" />
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderSecurity() {
    return (
      <div className="space-y-5 w-full">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Changer le mot de passe</h3>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Mot de passe actuel</label>
              <input type="password" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Nouveau mot de passe</label>
              <input type="password" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Confirmer le nouveau mot de passe</label>
              <input type="password" className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60" />
            </div>
            <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">Mettre à jour</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Authentification à deux facteurs</h3>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-ink">2FA activé</p>
              <p className="text-muted text-xs mt-0.5">Protection supplémentaire par code SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink font-semibold mb-4">Sessions actives</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">Session actuelle</p>
                <p className="text-muted text-xs">Chrome sur Windows · Il y a 2 minutes</p>
              </div>
              <span className="px-2 py-1 bg-success-bg text-success text-xs font-semibold rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">Mobile</p>
                <p className="text-muted text-xs">Safari sur iOS · Hier à 14:30</p>
              </div>
              <button className="px-3 py-1 border border-danger text-danger text-xs font-medium rounded-lg hover:bg-danger-bg transition-colors">Révoquer</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="text-ink text-xl font-semibold">Paramètres</h2>
        <p className="text-muted text-sm mt-0.5">Configurez l'application selon vos besoins</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-2">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-navy text-white' : 'text-muted hover:text-ink hover:bg-slate-50'}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'vehicles' && renderVehicles()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'security' && renderSecurity()}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setShowUserModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-ink text-lg font-bold">{editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</h3>
                <p className="text-muted text-sm mt-0.5">{editingUser ? 'Modifiez les informations' : "Renseignez les informations de l'utilisateur"}</p>
              </div>
              <button onClick={() => { setShowUserModal(false); setEditingUser(null); }} aria-label="Fermer" className="p-1.5 rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Nom complet <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. Karim Benali" className={inputClass('name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                {errors.name && <p className="mt-1.5 text-xs text-danger">⚠ {errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email <span className="text-danger">*</span></label>
                <input type="email" placeholder="ex. karim@dot.dz" className={inputClass('email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                {errors.email && <p className="mt-1.5 text-xs text-danger">⚠ {errors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Matricule <span className="text-danger">*</span></label>
                  <input type="text" placeholder="ex. ALT-0456" className={`${inputClass('matricule')} font-mono`} value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value.toUpperCase() }))} />
                  {errors.matricule && <p className="mt-1.5 text-xs text-danger">⚠ {errors.matricule}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Rôle <span className="text-danger">*</span></label>
                  <select className={inputClass('role')} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
                    <option value="employee">Employé</option>
                    <option value="fleet_manager">Gestionnaire flotte</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Structure <span className="text-danger">*</span></label>
                <input type="text" placeholder="ex. Direction Régionale Oran" className={inputClass('structure')} value={form.structure} onChange={e => setForm(f => ({ ...f, structure: e.target.value }))} />
                {errors.structure && <p className="mt-1.5 text-xs text-danger">⚠ {errors.structure}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Statut</label>
                <select className={inputClass('status')} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'actif' | 'inactif' }))}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowUserModal(false); setEditingUser(null); }} className="px-5 py-2.5 border border-border text-ink text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleSaveUser} className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark transition-colors">{editingUser ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
