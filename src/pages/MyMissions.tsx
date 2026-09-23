import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { missions, currentUsers, STATUS_LABELS } from '../data/mock';
import type { Status } from '../data/mock';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

const ALL_STATUSES: Status[] = ['brouillon', 'en_attente', 'rejetee', 'affectee', 'en_cours', 'terminee', 'annulee'];

export default function MyMissions({ onNavigate }: Props) {
  const user = currentUsers['employee'];
  const myMissions = missions.filter(m => m.matricule === user.matricule);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'interne' | 'externe'>('all');
  const [search, setSearch] = useState('');

  const filtered = myMissions.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (search && !m.object.toLowerCase().includes(search.toLowerCase()) && !m.destination.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy bg-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | 'all')}
          className="px-3 py-2 rounded-lg border border-border text-sm text-ink bg-white focus:outline-none focus:border-navy"
        >
          <option value="all">Tous les statuts</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as 'all' | 'interne' | 'externe')}
          className="px-3 py-2 rounded-lg border border-border text-sm text-ink bg-white focus:outline-none focus:border-navy"
        >
          <option value="all">Tous les types</option>
          <option value="interne">Interne</option>
          <option value="externe">Externe</option>
        </select>

        <button
          onClick={() => onNavigate('new-mission')}
          className="ml-auto flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle mission
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Réf.</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Objet</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Destination</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Départ</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Retour</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Véhicule</th>
              <th className="text-left px-5 py-3 text-muted font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{m.id}</td>
                <td className="px-5 py-3.5">
                  <p className="text-ink font-medium">{m.object}</p>
                  <span className="inline-block mt-0.5 text-[11px] text-muted bg-slate-100 px-2 py-0.5 rounded-full capitalize">{m.type}</span>
                </td>
                <td className="px-5 py-3.5 text-ink">{m.destination}</td>
                <td className="px-5 py-3.5 text-ink whitespace-nowrap">
                  {new Date(m.departureDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br/>
                  <span className="text-muted text-xs">{m.departureTime}</span>
                </td>
                <td className="px-5 py-3.5 text-ink whitespace-nowrap">
                  {m.returnDate ? new Date(m.returnDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}<br/>
                  <span className="text-muted text-xs">{m.returnTime || 'À déclarer'}</span>
                </td>
                <td className="px-5 py-3.5 text-muted text-xs">
                  {m.vehicleNeeded ? (m.vehicleId ? `✓ Affecté` : 'Demandé') : '—'}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onNavigate('mission-detail', m.id)}
                    className="text-navy text-xs font-medium hover:underline whitespace-nowrap"
                  >
                    Détails →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <svg className="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-muted font-medium">Aucune mission trouvée</p>
            <p className="text-muted/60 text-sm mt-1">Modifiez vos filtres ou créez une nouvelle mission</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
            <p className="text-muted text-sm">{filtered.length} mission(s) trouvée(s)</p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs rounded border border-border text-muted hover:bg-slate-50 transition-colors">← Préc.</button>
              <button className="px-3 py-1.5 text-xs rounded border border-navy bg-navy text-white">1</button>
              <button className="px-3 py-1.5 text-xs rounded border border-border text-muted hover:bg-slate-50 transition-colors">Suiv. →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
