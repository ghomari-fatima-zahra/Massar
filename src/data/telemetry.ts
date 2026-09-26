import type { Mission, Vehicle } from './mock';
import { missions } from './mock';

export interface ServiceEntry {
  id: string;
  date: string;
  km: number;
  type: string;
  center: string;
  costDA: number;
}

export interface FuelLog {
  id: string;
  date: string;
  liters: number;
  costDA: number;
  km: number;
}

export interface VehicleTelemetry {
  odometerKm: number;
  monthlyKm: number[];
  monthlyLabels: string[];
  fuelLevelPct: number;
  avgConsumption: number;
  monthlyFuelDA: number;
  healthScore: number;
  brakeWearPct: number;
  tireWearPct: number;
  oilLifePct: number;
  nextServiceKm: number;
  nextServiceDays: number;
  services: ServiceEntry[];
  fuelLogs: FuelLog[];
}

export const FUEL_PRICE_DA = 45.2;
export const SERVICE_INTERVAL_KM = 5000;

const MONTHS_FR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

const SERVICE_TYPES = [
  'Vidange + filtres',
  'Inspection technique',
  'Plaquettes de frein',
  'Remplacement pneus',
  'Révision complète',
  'Parallélisme / géométrie',
];

const SERVICE_CENTERS = [
  'Atelier central — Alger',
  'Garage agréé — Oran',
  'Centre auto — Constantine',
  'Atelier DG — Alger',
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baseConsumption(vehicleType: string): number {
  const t = vehicleType.toLowerCase();
  if (t.includes('bus') || t.includes('minibus')) return 11.2;
  if (t.includes('suv')) return 9.6;
  if (t.includes('minivan') || t.includes('monospace') || t.includes('utilitaire')) return 8.4;
  return 7.1;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function getTelemetry(v: Vehicle): VehicleTelemetry {
  const rand = mulberry32(hashStr(`${v.id}|${v.registration}`));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const now = new Date();
  const monthlyLabels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return MONTHS_FR[d.getMonth()];
  });
  const monthlyKm = Array.from({ length: 12 }, () => 700 + Math.floor(rand() * 1200));

  const odometerKm = 60000 + Math.floor(rand() * 110000);
  const avgConsumption = Math.round((baseConsumption(v.type) + rand() * 0.8) * 10) / 10;
  const monthlyFuelDA = Math.round((monthlyKm[11] / 100) * avgConsumption * FUEL_PRICE_DA);

  const services: ServiceEntry[] = Array.from({ length: 4 }, (_, i) => {
    const monthsAgo = 2 + i * 3 + Math.floor(rand() * 2);
    const km = Math.max(0, odometerKm - (monthsAgo * 1100 + Math.floor(rand() * 400)));
    const type = SERVICE_TYPES[(i + Math.floor(rand() * 2)) % SERVICE_TYPES.length];
    return {
      id: `S-${v.id}-${i}`,
      date: isoDaysAgo(monthsAgo * 30),
      km,
      type,
      center: pick(SERVICE_CENTERS),
      costDA: 4500 + Math.floor(rand() * 33500),
    };
  });

  const fuelLogs: FuelLog[] = Array.from({ length: 5 }, (_, i) => {
    const liters = Math.round(35 + rand() * 45);
    return {
      id: `F-${v.id}-${i}`,
      date: isoDaysAgo(4 + i * 9),
      liters,
      costDA: Math.round(liters * FUEL_PRICE_DA),
      km: Math.max(0, odometerKm - i * 420 - Math.floor(rand() * 120)),
    };
  });

  return {
    odometerKm,
    monthlyKm,
    monthlyLabels,
    fuelLevelPct: 18 + Math.floor(rand() * 78),
    avgConsumption,
    monthlyFuelDA,
    healthScore: 72 + Math.floor(rand() * 27),
    brakeWearPct: 8 + Math.floor(rand() * 62),
    tireWearPct: 12 + Math.floor(rand() * 55),
    oilLifePct: 15 + Math.floor(rand() * 80),
    nextServiceKm: 400 + Math.floor(rand() * 4200),
    nextServiceDays: 5 + Math.floor(rand() * 60),
    services,
    fuelLogs,
  };
}

export function missionsOfVehicle(vehicleId: string): Mission[] {
  return missions.filter((m) => m.vehicleId === vehicleId);
}
