import { useState } from 'react';
import { Gear, Lock, Truck } from '@phosphor-icons/react';

interface Props {
  onNavigate: (page: string) => void;
}

type Tab = 'general' | 'vehicles' | 'security';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'Général', icon: Gear },
  { id: 'vehicles', label: 'Véhicules', icon: Truck },
  { id: 'security', label: 'Sécurité', icon: Lock },
];

export default function ParametresPage({ onNavigate: _onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  function renderGeneral() {
    return (
      <div className="space-y-5 w-full">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink text-lg font-semibold mb-4">Informations de l'organisation</h3>
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
          <h3 className="text-ink text-lg font-semibold mb-4">Préférences d'affichage</h3>
          <div className="space-y-4">
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

  function renderVehicles() {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 w-full">
        <h3 className="text-ink text-lg font-semibold mb-4">Paramètres véhicules</h3>
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

  function renderSecurity() {
    return (
      <div className="space-y-5 w-full">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-ink text-lg font-semibold mb-4">Changer le mot de passe</h3>
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
          <h3 className="text-ink text-lg font-semibold mb-4">Authentification à deux facteurs</h3>
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
          <h3 className="text-ink text-lg font-semibold mb-4">Sessions actives</h3>
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
        <h2 className="text-ink text-2xl font-semibold leading-tight">Paramètres</h2>
        <p className="text-muted text-base leading-6 mt-1">Configurez l'application selon vos besoins</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-2">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-navy text-white' : 'text-muted hover:text-ink hover:bg-slate-50'}`}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'vehicles' && renderVehicles()}
      {activeTab === 'security' && renderSecurity()}

    </div>
  );
}
