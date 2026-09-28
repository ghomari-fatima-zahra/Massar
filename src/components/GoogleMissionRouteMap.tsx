import { useEffect, useRef, useState } from 'react';
import type { Mission } from '../data/mock';
import { getMissionStops, missionRouteSummary } from '../data/mock';

type GoogleMapsNamespace = any;

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
let googleMapsPromise: Promise<GoogleMapsNamespace> | null = null;

function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured.'));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__massarGoogleMapsReady';
    const existing = document.querySelector<HTMLScriptElement>('script[data-massar-google-maps]');
    if (existing) {
      const timer = window.setInterval(() => {
        if (window.google?.maps) {
          window.clearInterval(timer);
          resolve(window.google);
        }
      }, 50);
      window.setTimeout(() => {
        window.clearInterval(timer);
        reject(new Error('Google Maps did not finish loading.'));
      }, 10000);
      return;
    }

    (window as any)[callbackName] = () => resolve(window.google);
    const script = document.createElement('script');
    script.dataset.massarGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&libraries=routes&loading=async&callback=${callbackName}`;
    script.onerror = () => reject(new Error('Google Maps could not be loaded.'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

interface Props {
  mission: Mission;
  className?: string;
}

export default function GoogleMissionRouteMap({ mission, className = '' }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    let disposed = false;
    let markers: any[] = [];
    let polylines: any[] = [];

    setError('');
    setRouteStats(null);

    loadGoogleMaps()
      .then((googleApi) => {
        if (disposed || !mapElement.current) return;

        const stops = getMissionStops(mission);
        const first = stops[0]?.name ?? mission.departure;
        const last = stops.at(-1)?.name ?? mission.destination;
        const map = new googleApi.maps.Map(mapElement.current, {
          center: { lat: 36.3, lng: 3.2 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: true,
        });
        const renderer = new googleApi.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          suppressPolylines: true,
          draggable: true,
          preserveViewport: false,
          polylineOptions: { strokeColor: '#4c1d95', strokeOpacity: 0.96, strokeWeight: 6 },
        });
        const service = new googleApi.maps.DirectionsService();
        const waypoints = stops.slice(1, -1).map(stop => ({ location: stop.name, stopover: true }));

        service.route({
          origin: first,
          destination: last,
          waypoints,
          optimizeWaypoints: false,
          travelMode: googleApi.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        }, (result: any, status: string) => {
          if (disposed) return;
          if (status !== 'OK' || !result?.routes?.[0]) {
            setError(`Google Maps n'a pas pu calculer cet itinéraire (${status}).`);
            return;
          }

          renderer.setDirections(result);
          const route = result.routes[0];
          const inProgress = mission.status === 'en_cours';
          const completed = mission.status === 'terminee';
          const draft = mission.status === 'brouillon';
          const cancelled = mission.status === 'annulee';
          const progress = inProgress ? 0.8 : completed ? 1 : 0;
          const routePath = route.overview_path ?? [];
          const splitIndex = Math.round(progress * Math.max(routePath.length - 1, 0));
          const dottedOptions = {
            strokeOpacity: 0,
            icons: [{
              icon: { path: googleApi.maps.SymbolPath.CIRCLE, scale: 2.4, fillColor: draft ? '#94a3b8' : cancelled ? '#ef4444' : '#f59e0b', fillOpacity: 1, strokeOpacity: 0 },
              offset: '0',
              repeat: '14px',
            }],
          };

          if (inProgress && routePath.length > 1) {
            polylines.push(new googleApi.maps.Polyline({ map, path: routePath.slice(splitIndex), geodesic: true, ...dottedOptions }));
            polylines.push(new googleApi.maps.Polyline({ map, path: routePath.slice(0, splitIndex + 1), geodesic: true, strokeColor: '#16a34a', strokeOpacity: 0.98, strokeWeight: 6 }));
          } else {
            const color = completed ? '#16a34a' : draft ? '#94a3b8' : cancelled ? '#ef4444' : '#f59e0b';
            polylines.push(new googleApi.maps.Polyline({
              map,
              path: routePath,
              geodesic: true,
              ...(completed ? { strokeColor: color, strokeOpacity: 0.98, strokeWeight: 6 } : { ...dottedOptions, icons: [{ ...dottedOptions.icons[0], icon: { ...dottedOptions.icons[0].icon, fillColor: color } }] }),
            }));
          }
          const distanceMeters = route.legs.reduce((total: number, leg: any) => total + (leg.distance?.value ?? 0), 0);
          const durationSeconds = route.legs.reduce((total: number, leg: any) => total + (leg.duration?.value ?? 0), 0);
          setRouteStats({
            distance: distanceMeters >= 1000 ? `${Math.round(distanceMeters / 100) / 10} km` : `${distanceMeters} m`,
            duration: `${Math.round(durationSeconds / 60)} min`,
          });

          const routePoints = [route.legs[0]?.start_location, ...route.legs.map((leg: any) => leg.end_location)];
          markers = routePoints.map((position: any, index: number) => new googleApi.maps.Marker({
            map,
            position,
            label: { text: String(index + 1), color: '#ffffff', fontWeight: '700' },
            title: stops[index]?.name ?? `Étape ${index + 1}`,
          }));
        });
      })
      .catch((reason: Error) => {
        if (!disposed) setError(reason.message);
      });

    return () => {
      disposed = true;
      markers.forEach(marker => marker.setMap(null));
      polylines.forEach(polyline => polyline.setMap(null));
    };
  }, [mission]);

  return (
    <div className={`mission-route-map mission-route-map-google ${className}`}>
      <div ref={mapElement} className="mission-route-map-canvas" />
      <div className="mission-route-map-header">
        <div>
          <span>Google Maps · itinéraire dynamique</span>
          <strong>{missionRouteSummary(mission)}</strong>
        </div>
        <span className="mission-route-map-source">Navigation routière</span>
      </div>
      {routeStats && (
        <div className="mission-route-map-distance" aria-label="Distance et durée de l'itinéraire">
          <strong>{routeStats.distance}</strong><span>·</span><span>{routeStats.duration}</span>
        </div>
      )}
      {error && (
        <div className="mission-route-map-error" role="status">
          <strong>Google Maps indisponible</strong>
          <span>{error}</span>
          <small>Vérifiez la clé API, la facturation et les APIs Maps JavaScript + Directions.</small>
        </div>
      )}
    </div>
  );
}

export { GOOGLE_MAPS_API_KEY };
