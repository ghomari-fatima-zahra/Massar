import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from '../components/StatusBadge';
import { missions, vehicles, drivers } from '../data/mock';
import type { Mission, Status } from '../data/mock';

// Real Algerian city lat/lng coordinates
const CITY_COORDS: Record<string, [number, number]> = {
  'Alger':       [36.7538,  3.0588],
  'Oran':        [35.6969, -0.6331],
  'Tlemcen':     [34.8827, -1.3158],
  'Constantine': [36.3650,  6.6147],
  'Annaba':      [36.9000,  7.7667],
  'Sétif':       [36.1898,  5.4098],
  'Blida':       [36.4700,  2.8300],
  'Béjaïa':      [36.7522,  5.0567],
  'Boumerdès':   [36.7600,  3.4800],
  'Médéa':       [36.2639,  2.7508],
  'Chlef':       [36.1650,  1.3317],
  'Mascara':     [35.3963,  0.1408],
  'Relizane':    [35.7347,  0.5564],
  'Biskra':      [34.8500,  5.7333],
  'Ghardaïa':    [32.4900,  3.6700],
  'Ouargla':     [31.9500,  5.3250],
  'Batna':       [35.5559,  6.1742],
  'Skikda':      [36.8764,  6.9064],
  'Tizi Ouzou': [36.7169,  4.0497],
  'Bouira':      [36.3778,  3.9006],
};

function getCityCoords(name: string): [number, number] {
  const known = CITY_COORDS[name];
  if (known) return known;
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [34 + (hash % 4), 2 + (hash % 6)];
}

// Interpolate along the line at progress t (0–1)
function interpolateLine(from: [number, number], to: [number, number], t: number): [number, number] {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

// Build intermediate waypoints for a slightly curved route
function buildRoutePoints(from: [number, number], to: [number, number]): [number, number][] {
  const mid: [number, number] = [
    (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.08,
    (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.08,
  ];
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const u = 1 - t;
    pts.push([
      u * u * from[0] + 2 * u * t * mid[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * mid[1] + t * t * to[1],
    ]);
  }
  return pts;
}

const STATUS_PROGRESS: Record<Status, number> = {
  brouillon: 0, en_attente: 0.15, validee: 0.35,
  affectee: 0.5, confirmee: 0.65, en_cours: 0.8,
  terminee: 1, annulee: 0, rejetee: 0,
};

// Fix Leaflet default icon paths (broken in Vite)
function fixLeafletIcons() {
  // @ts-expect-error Leaflet internal
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}
fixLeafletIcons();

function makeIcon(color: string, size = 14) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  });
}

function makePinIcon(color: string, label: string) {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:${color};color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-family:Inter,sans-serif;">${label}</div>
        <div style="width:2px;height:8px;background:${color};margin-top:0;"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;margin-top:-2px;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
      </div>`,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
    className: '',
  });
}

function makeVehicleIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;">
        <div style="width:32px;height:32px;border-radius:50%;background:#F97316;border:3px solid white;box-shadow:0 2px 12px rgba(249,115,22,0.5);display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
        </div>
        <div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#22C55E;border:2px solid white;animation:pulse 1.5s ease-in-out infinite;"></div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: '',
  });
}

// Component to fit map bounds to the route
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 2) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
  }, [map, positions]);
  return null;
}

function RouteMap({ mission }: { mission: Mission }) {
  const from = getCityCoords(mission.departure);
  const to = getCityCoords(mission.destination);
  const routePoints = buildRoutePoints(from, to);
  const t = STATUS_PROGRESS[mission.status as Status] ?? 0;
  const currentPos = interpolateLine(from, to, t);
  const isActive = ['en_cours', 'affectee', 'confirmee'].includes(mission.status);
  const isDone = mission.status === 'terminee';
  const isRejected = ['annulee', 'rejetee'].includes(mission.status);

  // Split route into traveled and remaining
  const traveledCount = Math.round(t * routePoints.length);
  const traveledPoints = routePoints.slice(0, Math.max(traveledCount, 2));
  const remainingPoints = routePoints.slice(Math.max(traveledCount - 1, 0));

  const center: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <FitBounds positions={[from, to]} />

      {/* Remaining route — dashed gray */}
      {!isRejected && t < 1 && (
        <Polyline
          positions={remainingPoints}
          pathOptions={{ color: '#94A3B8', weight: 3, dashArray: '8 6', opacity: 0.6 }}
        />
      )}

      {/* Traveled route — cyan/green glow */}
      {!isRejected && t > 0 && (
        <>
          {/* Glow layer */}
          <Polyline
            positions={traveledPoints}
            pathOptions={{
              color: isDone ? '#10B981' : '#22D3EE',
              weight: 10,
              opacity: 0.15,
              lineCap: 'round',
            }}
          />
          {/* Main line */}
          <Polyline
            positions={traveledPoints}
            pathOptions={{
              color: isDone ? '#10B981' : '#22D3EE',
              weight: 4,
              opacity: 0.95,
              lineCap: 'round',
            }}
          />
        </>
      )}

      {/* Full route outline when rejected */}
      {isRejected && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: '#EF4444', weight: 3, opacity: 0.4, dashArray: '6 8' }}
        />
      )}

      {/* Departure pin */}
      <Marker position={from} icon={makePinIcon('#075985', mission.departure)}>
        <Popup>{mission.departure} — Départ</Popup>
      </Marker>

      {/* Destination pin */}
      <Marker position={to} icon={makePinIcon(isDone ? '#10B981' : '#22D3EE', mission.destination)}>
        <Popup>{mission.destination} — Arrivée</Popup>
      </Marker>

      {/* Moving vehicle */}
      {isActive && t > 0 && t < 1 && (
        <Marker position={currentPos} icon={makeVehicleIcon()}>
          <Popup>En route</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

const STAGES = ['Brouillon', 'En attente', 'Validée', 'Affectée', 'En cours', 'Terminée'] as const;
const STAGE_STATUSES: Record<string, Status> = {
  'Brouillon': 'brouillon', 'En attente': 'en_attente', 'Validée': 'validee',
  'Affectée': 'affectee', 'En cours': 'en_cours', 'Terminée': 'terminee',
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Toutes', en_attente: 'En attente', validee: 'Validées',
  affectee: 'Affectées', en_cours: 'En cours', terminee: 'Terminées', rejetee: 'Rejetées',
};

const STATUS_DOT: Record<string, string> = {
  en_cours: 'bg-cyan-400', terminee: 'bg-emerald-400', en_attente: 'bg-amber-400',
  validee: 'bg-sky-400', affectee: 'bg-violet-400', rejetee: 'bg-red-400',
  annulee: 'bg-red-400', brouillon: 'bg-slate-400',
};

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

export default function FleetMissions({ onNavigate }: Props) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = missions.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (search && !m.object.toLowerCase().includes(search.toLowerCase()) &&
        !m.employee.toLowerCase().includes(search.toLowerCase()) &&
        !m.destination.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = missions.find(m => m.id === selectedId) ?? null;
  const vehicle = selected?.vehicleId ? vehicles.find(v => v.id === selected!.vehicleId) : null;
  const driver = selected?.driverId ? drivers.find(d => d.id === selected!.driverId) : null;
  const t = STATUS_PROGRESS[selected?.status as Status] ?? 0;
  const mapMission = selected ?? missions[0];

  const counts = {
    en_cours: missions.filter(m => m.status === 'en_cours').length,
    en_attente: missions.filter(m => m.status === 'en_attente').length,
    terminee: missions.filter(m => m.status === 'terminee').length,
  };

  return (
    <div className="flex gap-4 h-full" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* LEFT: mission list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-hidden">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'En cours', count: counts.en_cours, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
            { label: 'En attente', count: counts.en_attente, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Terminées', count: counts.terminee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border px-3 py-2.5 ${s.bg}`}>
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
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

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(STATUS_FILTER_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterStatus === val ? 'bg-navy text-white' : 'bg-white border border-border text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mission cards */}
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">Aucune mission trouvée</p>
            </div>
          )}
          {filtered.map(m => {
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
                  <span className="font-medium">{m.departure}</span>
                  <span className={`px-1 ${isSelected ? 'text-white/30' : 'text-muted/40'}`}>→</span>
                  <span>{m.destination}</span>
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
                      <span className="text-navy font-semibold text-sm">{selected.departure}</span>
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
                      <span className="text-cyan-700 font-semibold text-sm">{selected.destination}</span>
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
                     selected.status === 'en_attente' ? '⏳ En attente' :
                     selected.status === 'validee' ? '✓ Validée' :
                     selected.status === 'affectee' ? '🚗 Affectée' : selected.status}
                  </span>
                </div>
              </div>
              )}

              {/* Map — always shows, key on selected id or first mission */}
              <RouteMap key={selected?.id ?? mapMission.id} mission={selected ?? mapMission} />

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
                        <p className="text-ink text-sm font-semibold leading-tight">{selected.departure}</p>
                        <p className="text-muted text-[11px] leading-tight">→ {selected.destination}</p>
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
                          {new Date(selected.returnDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                          Détails
                        </button>
                        {selected.status === 'en_attente' && (
                          <button className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-dark transition-colors whitespace-nowrap">
                            Valider
                          </button>
                        )}
                        {selected.status === 'validee' && (
                          <button className="px-4 py-2 bg-orange text-white text-sm font-semibold rounded-xl hover:bg-orange-dark transition-colors whitespace-nowrap">
                            Affecter
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
