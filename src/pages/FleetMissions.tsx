import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import MissionRouteMap, { STATUS_PROGRESS } from '../components/MissionRouteMap';
import { getMissionStops, missionRouteSummary, missions, vehicles, drivers } from '../data/mock';
import type { Mission, Status } from '../data/mock';

const STAGES = ['En attente', 'En cours', 'Terminée'] as const;
const STAGE_STATUSES: Record<string, Status> = {
  'En attente': 'en_attente',
  'En cours': 'en_cours', 'Terminée': 'terminee',
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Toutes', brouillon: 'Brouillons', en_attente: 'En attente',
  en_cours: 'En cours', terminee: 'Terminées', rejetee: 'Rejetées', annulee: 'Annulées',
};

const STATUS_DOT: Record<string, string> = {
  en_cours: 'bg-cyan-400', terminee: 'bg-emerald-400', en_attente: 'bg-amber-400',
  rejetee: 'bg-red-400',
  annulee: 'bg-red-400', brouillon: 'bg-slate-400',
};

type MissionSort = 'created_desc' | 'created_asc' | 'departure_asc' | 'departure_desc';

const MISSION_SORT_LABELS: Record<MissionSort, string> = {
  created_desc: 'Plus récemment créées',
  created_asc: 'Plus anciennement créées',
  departure_asc: 'Départ le plus proche',
  departure_desc: 'Départ le plus lointain',
};

interface Props {
  onNavigate: (page: string, id?: string) => void;
  initialFilter?: string;
  assignments: Record<string, { vehicleId: string; driverId: string }>;
  statusOverrides: Record<string, Status>;
  onStartMission: (missionId: string) => void;
}

export default function FleetMissions({ onNavigate, initialFilter, assignments, statusOverrides, onStartMission }: Props) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter ?? 'all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<MissionSort>('created_desc');

  // An assignment does not start a mission. The driver-start action is the
  // only event that promotes En attente to En cours.
  const effMissions = missions.map(m => {
    const a = assignments[m.id];
    const override = statusOverrides[m.id];
    return {
      ...m,
      ...(a ? { vehicleId: a.vehicleId, driverId: a.driverId } : {}),
      ...(override ? { status: override } : {}),
    };
  });

  const filtered = effMissions.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (search && !m.object.toLowerCase().includes(search.toLowerCase()) &&
        !m.employee.toLowerCase().includes(search.toLowerCase()) &&
        !missionRouteSummary(m).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sortedMissions = [...filtered].sort((a, b) => {
    const field = sortOrder.startsWith('created') ? 'createdAt' : 'departureDate';
    const difference = new Date(a[field]).getTime() - new Date(b[field]).getTime();
    return sortOrder.endsWith('desc') ? -difference : difference;
  });

  const selected = effMissions.find(m => m.id === selectedId) ?? null;
  const vehicle = selected?.vehicleId ? vehicles.find(v => v.id === selected!.vehicleId) : null;
  const driver = selected?.driverId ? drivers.find(d => d.id === selected!.driverId) : null;
  const t = selected ? (STATUS_PROGRESS[selected.status as Status] ?? 0) : 0;

  const counts = {
    en_cours: effMissions.filter(m => m.status === 'en_cours').length,
    en_attente: effMissions.filter(m => m.status === 'en_attente').length,
    terminee: effMissions.filter(m => m.status === 'terminee').length,
  };

  return (
    <div className="flex gap-4 h-full" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* LEFT: mission list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-hidden">
        {/* Quick stats — act as filters */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'En cours', key: 'en_cours', count: counts.en_cours, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
            { label: 'En attente', key: 'en_attente', count: counts.en_attente, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Terminées', key: 'terminee', count: counts.terminee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          ].map(s => {
            const active = filterStatus === s.key;
            return (
              <button
                key={s.label}
                type="button"
                title={`Filtrer : ${s.label}`}
                onClick={() => setFilterStatus(active ? 'all' : s.key)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${s.bg} ${active ? 'ring-2 ring-navy shadow-md' : 'hover:shadow'}`}
              >
                <p className={`text-lg font-bold leading-none ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-navy shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="mission-status-filter"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted flex-shrink-0"
          >
            Statut
          </label>
          <select
            id="mission-status-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-white text-xs font-medium text-ink shadow-sm focus:outline-none focus:border-navy"
          >
            {Object.entries(STATUS_FILTER_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {filterStatus !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              title="Réinitialiser le filtre"
              className="p-2 rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Mission ordering */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="mission-sort-order"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted flex-shrink-0"
          >
            Trier
          </label>
          <select
            id="mission-sort-order"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as MissionSort)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-white text-xs font-medium text-ink shadow-sm focus:outline-none focus:border-navy"
          >
            {Object.entries(MISSION_SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Mission cards */}
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
          {sortedMissions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">Aucune mission trouvée</p>
            </div>
          )}
          {sortedMissions.map(m => {
            const isSelected = selectedId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all shadow-sm ${
                  isSelected
                    ? 'border-navy bg-navy text-white shadow-md'
                    : 'border-border bg-white hover:border-navy/30 hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[m.status] || 'bg-slate-400'}`}/>
                    <span className={`font-mono text-[10px] ${isSelected ? 'text-white/50' : 'text-muted'}`}>{m.id}</span>
                  </div>
                  <StatusBadge status={m.status as Status} size="sm" />
                </div>
                <p className={`text-sm font-semibold line-clamp-1 mb-1.5 ${isSelected ? 'text-white' : 'text-ink'}`}>
                  {m.object}
                </p>
                <div className={`flex items-center gap-1 text-xs mb-1 ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <span className="font-medium truncate">{missionRouteSummary(m)}</span>
                </div>
                <div className={`flex items-center gap-1 text-[11px] ${isSelected ? 'text-white/50' : 'text-muted/70'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {new Date(m.departureDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })} · {m.departureTime}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('new-mission')}
          className="w-full flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle mission
        </button>
      </div>

      {/* RIGHT: map + popup overlay */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
        <>
            {/* Map card — always visible */}
            <div className="flex-1 rounded-2xl overflow-hidden relative min-h-0 shadow-lg border border-border">
              {/* Top overlay — only when a mission is selected */}
              {selected && (
              <div className="absolute top-0 left-0 right-0 z-[400] pointer-events-none">
                <div className="mx-3 mt-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-white/60 pointer-events-auto">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-navy ring-2 ring-sky-200"/>
                      <span className="text-navy font-semibold text-sm truncate max-w-[220px]">{getMissionStops(selected)[0]?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <div className="w-6 h-px bg-slate-300"/>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <div className="w-6 h-px bg-slate-300"/>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-100"/>
                      <span className="text-cyan-700 font-semibold text-sm truncate max-w-[220px]">{getMissionStops(selected).at(-1)?.name}</span>
                    </div>
                  </div>
                  <span className={`pointer-events-auto text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border ${
                    selected.status === 'en_cours' ? 'bg-cyan-500 text-white border-cyan-400' :
                    selected.status === 'terminee' ? 'bg-emerald-500 text-white border-emerald-400' :
                    selected.status === 'rejetee' || selected.status === 'annulee' ? 'bg-red-500 text-white border-red-400' :
                    'bg-white text-navy border-navy/20'
                  }`}>
                    {selected.status === 'en_cours' ? '● En cours' :
                     selected.status === 'terminee' ? '✓ Terminée' :
                     selected.status === 'rejetee' ? '✗ Rejetée' :
                     selected.status === 'annulee' ? '✗ Annulée' :
                     selected.status === 'en_attente' ? '⏳ En attente' : selected.status}
                  </span>
                </div>
              </div>
              )}

              {/* Itinerary — static image, no live tracking yet */}
              <MissionRouteMap key={selected?.id ?? 'overview'} mission={selected} />

              {/* No selection hint */}
              {!selected && (
                <div className="absolute inset-0 flex items-end justify-center pb-8 z-[400] pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/70 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
                    </svg>
                    <p className="text-ink text-sm font-medium">Sélectionnez une mission pour afficher les détails</p>
                  </div>
                </div>
              )}

              {/* POPUP info card — slides in at bottom when mission selected */}
              {selected && (
                <div className="absolute bottom-3 left-3 right-3 z-[400]">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                    {/* Progress bar */}
                    <div className="px-5 pt-3.5 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Progression</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${t * 100}%`,
                              background: t === 1 ? '#10B981' : 'linear-gradient(to right, #0EA5E9, #22D3EE)',
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-navy tabular-nums">{Math.round(t * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {selected && STAGES.map((stage, idx) => {
                          const rejected = selected.status === 'rejetee' || selected.status === 'annulee';
                          const currentIdx = STAGES.findIndex(s => STAGE_STATUSES[s] === selected.status);
                          const done = !rejected && idx < currentIdx;
                          const current = !rejected && idx === currentIdx;
                          return (
                            <div key={stage} className="flex items-center gap-1">
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                current ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300' :
                                done ? 'bg-emerald-50 text-emerald-600' :
                                'bg-slate-50 text-slate-400'
                              }`}>
                                {done && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                {stage}
                              </div>
                              {idx < STAGES.length - 1 && (
                                <span className={`text-[9px] ${idx < currentIdx ? 'text-emerald-400' : 'text-slate-200'}`}>›</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Info row — matches the image layout exactly */}
                    <div className="px-5 py-3 flex items-center gap-3">
                      {/* Demandeur */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {selected.employee.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-none mb-0.5">Demandeur</p>
                          <p className="text-ink text-sm font-semibold leading-tight">{selected.employee.split(' ').slice(0, 2).join(' ')}</p>
                          <p className="text-muted text-[11px] leading-tight">{selected.structure}</p>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-slate-100 flex-shrink-0"/>

                      {/* Trajet */}
                      <div className="flex-shrink-0">
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-none mb-0.5">Trajet</p>
                        <p className="text-ink text-sm font-semibold leading-tight max-w-[220px] truncate">{getMissionStops(selected)[0]?.name}</p>
                        <p className="text-muted text-[11px] leading-tight max-w-[220px] truncate">{missionRouteSummary(selected).split(' → ').slice(1).join(' → ')}</p>
                      </div>

                      <div className="w-px h-10 bg-slate-100 flex-shrink-0"/>

                      {/* Départ */}
                      <div className="flex-shrink-0">
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-none mb-0.5">Départ</p>
                        <p className="text-ink text-sm font-semibold leading-tight">
                          {new Date(selected.departureDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-muted text-[11px] leading-tight">{selected.departureTime}</p>
                      </div>

                      <div className="w-px h-10 bg-slate-100 flex-shrink-0"/>

                      {/* Retour */}
                      <div className="flex-shrink-0">
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-none mb-0.5">Retour</p>
                        <p className="text-ink text-sm font-semibold leading-tight">
                          {selected.returnDate
                            ? new Date(selected.returnDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                        <p className="text-muted text-[11px] leading-tight">{selected.returnTime || '—'}</p>
                      </div>

                      <div className="w-px h-10 bg-slate-100 flex-shrink-0"/>

                      {/* Véhicule */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-muted uppercase tracking-wide leading-none mb-0.5">Véhicule</p>
                        {vehicle ? (
                          <>
                            <p className="text-ink text-sm font-semibold leading-tight">{vehicle.registration}</p>
                            <p className="text-muted text-[11px] leading-tight">{driver?.name || '—'}</p>
                          </>
                        ) : (
                          <p className="text-slate-400 text-sm font-medium">Non affecté</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                        <button
                          onClick={() => setSelectedId('')}
                          className="p-2 rounded-lg text-muted hover:bg-slate-100 transition-colors"
                          title="Fermer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => onNavigate('mission-detail', selected.id)}
                          className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-dark transition-colors whitespace-nowrap"
                        >
                          {selected.status === 'brouillon' ? 'Modifier le brouillon' : 'Détails'}
                        </button>
                        {selected.status === 'en_attente' && selected.driverId && (
                          <button
                            onClick={() => onStartMission(selected.id)}
                            className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            Démarrer la mission
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </>
      </div>
    </div>
  );
}
