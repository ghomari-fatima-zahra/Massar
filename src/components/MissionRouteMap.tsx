import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import GoogleMissionRouteMap, { GOOGLE_MAPS_API_KEY } from './GoogleMissionRouteMap';
import { getMissionStops, missionRouteSummary } from '../data/mock';
import type { Mission, Status } from '../data/mock';

const CITY_COORDS: Record<string, [number, number]> = {
  Alger: [36.7538, 3.0588],
  Oran: [35.6969, -0.6331],
  Tlemcen: [34.8827, -1.3158],
  Constantine: [36.365, 6.6147],
  Annaba: [36.9, 7.7667],
  Sétif: [36.1898, 5.4098],
  Blida: [36.47, 2.83],
  Béjaïa: [36.7522, 5.0567],
  Boumerdès: [36.76, 3.48],
  Médéa: [36.2639, 2.7508],
  Chlef: [36.165, 1.3317],
  Mascara: [35.3963, 0.1408],
  Relizane: [35.7347, 0.5564],
  Biskra: [34.85, 5.7333],
  Ghardaïa: [32.49, 3.67],
  Ouargla: [31.95, 5.325],
  Batna: [35.5559, 6.1742],
  Skikda: [36.8764, 6.9064],
  'Tizi Ouzou': [36.7169, 4.0497],
  Bouira: [36.3778, 3.9006],
};

// Road-like corridors keep the simulated line close to the Algerian routes
// shown in the supplied map reference instead of drawing a single straight arc.
const ROUTE_WAYPOINTS: Record<string, [number, number][]> = {
  'M2026-001': [
    [36.7538, 3.0588], [36.6, 2.96], [36.47, 2.83], [36.34, 2.54],
    [36.165, 1.3317], [35.93, 0.84], [35.7347, 0.5564], [35.47, -0.2],
    [35.19, -0.63], [34.8827, -1.3158],
  ],
  'M2026-002': [[36.7538, 3.0588], [36.62, 2.98], [36.47, 2.83]],
  'M2026-003': [
    [34.8827, -1.3158], [35.19, -0.63], [35.3963, 0.1408], [35.37, 1.32],
    [35.7, 4.54], [35.5559, 6.1742], [36.365, 6.6147],
  ],
  'M2026-004': [
    [36.7538, 3.0588], [36.3778, 3.9006], [36.1898, 5.4098],
    [36.365, 6.6147], [36.46, 7.43], [36.9, 7.7667],
  ],
  'M2026-005': [
    [35.6969, -0.6331], [35.3963, 0.1408], [35.37, 1.32],
    [35.15, 2.45], [35.72, 4.25], [36.1898, 5.4098],
  ],
  'M2026-006': [
    [34.8827, -1.3158], [35.19, -0.63], [35.7347, 0.5564], [36.165, 1.3317],
    [36.7538, 3.0588], [36.7169, 4.0497], [36.7522, 5.0567],
  ],
  'M2026-007': [[36.7538, 3.0588], [36.76, 3.48]],
};

export const STATUS_PROGRESS: Record<Status, number> = {
  brouillon: 0,
  en_attente: 0.15,
  validee: 0.35,
  affectee: 0.5,
  confirmee: 0.65,
  en_cours: 0.8,
  terminee: 1,
  annulee: 0,
};

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getCityCoords(name: string): [number, number] {
  const exact = Object.entries(CITY_COORDS).find(([city]) => normalize(name).includes(normalize(city)));
  if (exact) return exact[1];

  const hash = name.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  return [34 + (hash % 4), 2 + (hash % 6)];
}

function buildRoutePoints(from: [number, number], to: [number, number], missionId: string): [number, number][] {
  const corridor = ROUTE_WAYPOINTS[missionId];
  if (corridor) {
    const distance = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    return distance(corridor[0], from) <= distance(corridor[corridor.length - 1], from)
      ? corridor
      : [...corridor].reverse();
  }

  const mid: [number, number] = [
    (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.08,
    (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.08,
  ];

  return Array.from({ length: 41 }, (_, index) => {
    const t = index / 40;
    const inverse = 1 - t;
    return [
      inverse * inverse * from[0] + 2 * inverse * t * mid[0] + t * t * to[0],
      inverse * inverse * from[1] + 2 * inverse * t * mid[1] + t * t * to[1],
    ];
  });
}

function buildMultiLegRoute(points: [number, number][], missionId: string): [number, number][] {
  if (points.length < 2) return points;
  return points.reduce<[number, number][]>((all, point, index) => {
    if (index === 0) return [point];
    return [...all, ...buildRoutePoints(points[index - 1], point, `${missionId}-${index}`).slice(1)];
  }, []);
}

function interpolate(from: [number, number], to: [number, number], progress: number): [number, number] {
  return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
}

function makeCircleIcon(color: string, size = 15) {
  return L.divIcon({
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 7px rgba(15,23,42,.35)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  });
}

function makeVehicleIcon() {
  return L.divIcon({
    html: `<span class="mission-map-vehicle"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.92 6.01A1.5 1.5 0 0 0 17.5 5h-11a1.5 1.5 0 0 0-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99ZM6.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM5 11l1.5-4.5h11L19 11H5Z"/></svg></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    className: '',
  });
}

function FitRoute({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length < 2) return;
    map.fitBounds(L.latLngBounds(positions), { padding: [58, 58], maxZoom: 9 });
    window.setTimeout(() => map.invalidateSize(), 80);
  }, [map, positions]);

  return null;
}

interface Props {
  mission: Mission | null;
  className?: string;
}

function LeafletMissionRouteMap({ mission, className = '' }: { mission: Mission; className?: string }) {
  const stops = getMissionStops(mission);
  const stopPositions = stops.map(stop => getCityCoords(stop.name));
  const from = stopPositions[0];
  const to = stopPositions.at(-1) ?? from;
  const fallbackRoute = buildMultiLegRoute(stopPositions, mission.id);
  const [roadRoute, setRoadRoute] = useState<[number, number][] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setRoadRoute(null);
    const coordinates = stopPositions.map(([lat, lng]) => `${lng},${lat}`).join(';');

    fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Road route unavailable');
        return response.json();
      })
      .then(data => {
        const points = data.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(points) && points.length > 1) {
          setRoadRoute(points.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]));
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [mission.id]);

  const route = roadRoute ?? fallbackRoute;
  const inProgress = mission.status === 'en_cours';
  const progress = inProgress ? STATUS_PROGRESS.en_cours : mission.status === 'terminee' ? 1 : 0;
  const progressIndex = Math.round(progress * (route.length - 1));
  const traveled = route.slice(0, Math.max(progressIndex + 1, 2));
  const remaining = route.slice(Math.max(progressIndex, 0));
  const current = route[Math.min(Math.round(progress * (route.length - 1)), route.length - 1)] ?? from;
  const cancelled = mission.status === 'annulee';
  const draft = mission.status === 'brouillon';
  const pending = !draft && !inProgress && !cancelled && mission.status !== 'terminee';
  const completed = mission.status === 'terminee';
  const active = ['affectee', 'confirmee', 'en_cours'].includes(mission.status);
  const routeColor = cancelled ? '#ef4444' : draft ? '#94a3b8' : completed ? '#16a34a' : pending ? '#f59e0b' : '#4c1d95';

  return (
    <div className={`mission-route-map ${className}`}>
      <MapContainer
        center={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]}
        zoom={7}
        className="mission-route-map-canvas"
        zoomControl
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitRoute positions={route} />

        {!cancelled && !inProgress && (
          <Polyline
            positions={route}
            pathOptions={{
              color: routeColor,
              weight: completed ? 7 : 6,
              opacity: 0.96,
              dashArray: draft || pending ? '1 11' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {!cancelled && inProgress && (
          <>
            <Polyline positions={remaining} pathOptions={{ color: '#94a3b8', weight: 6, opacity: 0.9, dashArray: '1 11', lineCap: 'round', lineJoin: 'round' }} />
            <Polyline positions={traveled} pathOptions={{ color: '#16a34a', weight: 7, opacity: 0.98, lineCap: 'round', lineJoin: 'round' }} />
          </>
        )}

        {cancelled && <Polyline positions={route} pathOptions={{ color: routeColor, weight: 4, dashArray: '7 8', opacity: 0.75 }} />}

        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={stopPositions[index]}
            icon={makeCircleIcon(index === 0 ? '#075985' : index === stops.length - 1 ? routeColor : '#f59e0b', index === 0 || index === stops.length - 1 ? 18 : 14)}
          >
            <Popup>{stop.sequence}. {stop.name}</Popup>
          </Marker>
        ))}
        {active && inProgress && progress > 0 && progress < 1 && (
          <Marker position={current} icon={makeVehicleIcon()}>
            <Popup>Véhicule en route</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="mission-route-map-header">
        <div>
          <span>Simulation d'itinéraire</span>
          <strong>{missionRouteSummary(mission)}</strong>
        </div>
        <span className="mission-route-map-source">Carte routière · aperçu</span>
      </div>

    </div>
  );
}

export default function MissionRouteMap({ mission, className = '' }: Props) {
  if (!mission) {
    return (
      <div className={`mission-route-map mission-route-map-empty ${className}`}>
        <div>
          <span className="mission-route-map-empty-icon">⌖</span>
          <strong>Sélectionnez une mission</strong>
          <p>L'itinéraire apparaîtra ici.</p>
        </div>
      </div>
    );
  }

  if (GOOGLE_MAPS_API_KEY) return <GoogleMissionRouteMap mission={mission} className={className} />;
  return <LeafletMissionRouteMap mission={mission} className={className} />;
}
