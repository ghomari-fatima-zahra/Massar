import type {
  AppUser,
  Driver,
  Mission,
  MissionRoute,
  Notification,
  Vehicle,
} from '../data/mock';
import type { FuelLog, ServiceEntry } from '../data/telemetry';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'massar.accessToken';
const REFRESH_TOKEN_KEY = 'massar.refreshToken';
const USER_KEY = 'massar.user';

let refreshPromise: Promise<AuthResponse> | null = null;

export interface DashboardStats {
  kpis: {
    totalMissions: number;
    pendingMissions: number;
    inProgressMissions: number;
    completedMissions: number;
    totalVehicles: number;
    availableVehicles: number;
    totalDrivers: number;
    availableDrivers: number;
  };
  missionsByMonth: Array<{ month: string; count: number }>;
  missionCountsByMonth?: Array<{ month: string; count: number }>;
  fleetAvailability: Array<{ status: string; count: number }>;
  fleetBreakdown?: Array<{ status: string; count: number }>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}

export interface ListResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface VehicleTelemetry {
  vehicleId: string;
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
  updatedAt: string;
  services: ServiceEntry[];
  fuelLogs: FuelLog[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getStored(key: string) {
  return window.localStorage.getItem(key);
}

function setStored(key: string, value: string) {
  window.localStorage.setItem(key, value);
}

export function getStoredUser(): AppUser | null {
  const value = getStored(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AppUser;
  } catch {
    clearSession();
    return null;
  }
}

function saveSession(response: AuthResponse) {
  setStored(ACCESS_TOKEN_KEY, response.accessToken);
  setStored(REFRESH_TOKEN_KEY, response.refreshToken);
  setStored(USER_KEY, JSON.stringify(response.user));
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function parseError(response: Response) {
  try {
    const body = await response.json() as { message?: string | string[] };
    return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? response.statusText;
  } catch {
    return response.statusText || 'Une erreur est survenue.';
  }
}

function refreshSession() {
  if (!refreshPromise) {
    const refreshToken = getStored(REFRESH_TOKEN_KEY);
    if (!refreshToken) return Promise.reject(new ApiError('Votre session a expiré.', 401));

    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) throw new ApiError(await parseError(response), response.status);
        return response.json() as Promise<AuthResponse>;
      })
      .then((response) => {
        saveSession(response);
        return response;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getStored(ACCESS_TOKEN_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && getStored(REFRESH_TOKEN_KEY)) {
    try {
      await refreshSession();
      return request<T>(path, init, false);
    } catch {
      clearSession();
    }
  }
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function query(params: Record<string, string | number | boolean | undefined>) {
  const values = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  return values.length ? `?${new URLSearchParams(values.map(([key, value]) => [key, String(value)]))}` : '';
}

function toMissionPayload(data: Partial<Mission> & { route?: MissionRoute }) {
  return {
    demandeurId: data.demandeurId,
    type: data.type,
    object: data.object,
    departure: data.departure,
    destination: data.destination,
    departureDate: data.departureDate,
    returnDate: data.returnDate || undefined,
    departureTime: data.departureTime,
    returnTime: data.returnTime || undefined,
    passengers: data.passengers,
    vehicleNeeded: data.vehicleNeeded ?? Boolean(data.vehicleId),
    vehicleType: data.vehicleType || undefined,
    roundTrip: data.route?.roundTrip ?? false,
    stops: data.route?.stops?.map((stop, index) => ({ name: stop.name, sequence: index + 1 })),
  };
}

export const api = {
  login(identifier: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
      .then((response) => { saveSession(response); return response; });
  },
  logout() {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' }).finally(clearSession);
  },
  dashboardStats() { return request<DashboardStats>('/dashboard/stats'); },
  missions(params: Record<string, string | number | boolean | undefined> = {}) {
    return request<ListResponse<Mission>>(`/missions${query({ page: 1, limit: 100, ...params })}`);
  },
  createMission(data: Partial<Mission>) {
    return request<Mission>('/missions', { method: 'POST', body: JSON.stringify(toMissionPayload(data)) });
  },
  updateMission(id: string, data: Partial<Mission>) {
    return request<Mission>(`/missions/${id}`, { method: 'PATCH', body: JSON.stringify(toMissionPayload(data)) });
  },
  submitMission(id: string) { return request<Mission>(`/missions/${id}/submit-for-validation`, { method: 'POST' }); },
  validateMission(id: string) { return request<Mission>(`/missions/${id}/validate`, { method: 'POST' }); },
  assignMission(id: string, vehicleId?: string, driverId?: string) {
    return request<Mission>(`/missions/${id}/assign`, { method: 'POST', body: JSON.stringify({ vehicleId, driverId }) });
  },
  confirmMission(id: string) { return request<Mission>(`/missions/${id}/confirm`, { method: 'POST' }); },
  startMission(id: string) { return request<Mission>(`/missions/${id}/start`, { method: 'POST' }); },
  completeMission(id: string) { return request<Mission>(`/missions/${id}/complete`, { method: 'POST' }); },
  rejectMission(id: string, reason: string) {
    return request<Mission>(`/missions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  },
  cancelMission(id: string, reason = 'Annulée depuis le tableau de bord') {
    return request<Mission>(`/missions/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
  },
  vehicles(params: Record<string, string | number | boolean | undefined> = {}) {
    return request<ListResponse<Vehicle>>(`/vehicles${query({ page: 1, limit: 100, ...params })}`);
  },
  createVehicle(data: Omit<Vehicle, 'id'>) {
    return request<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) });
  },
  updateVehicle(id: string, data: Partial<Vehicle>) {
    return request<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  updateVehicleStatus(id: string, status: Vehicle['status']) {
    return request<Vehicle>(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  deleteVehicle(id: string) { return request<{ success: boolean }>(`/vehicles/${id}`, { method: 'DELETE' }); },
  vehicleTelemetry(id: string) { return request<VehicleTelemetry>(`/vehicles/${id}/telemetry`); },
  createVehicleService(id: string, data: Omit<ServiceEntry, 'id'>) {
    return request<ServiceEntry>(`/vehicles/${id}/telemetry/services`, { method: 'POST', body: JSON.stringify(data) });
  },
  createVehicleFuelLog(id: string, data: Omit<FuelLog, 'id'>) {
    return request<FuelLog>(`/vehicles/${id}/telemetry/fuel-logs`, { method: 'POST', body: JSON.stringify(data) });
  },
  updateVehicleWear(id: string, data: Partial<Pick<VehicleTelemetry, 'brakeWearPct' | 'tireWearPct' | 'oilLifePct' | 'fuelLevelPct' | 'healthScore' | 'odometerKm'>>) {
    return request<VehicleTelemetry>(`/vehicles/${id}/telemetry/wear`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  drivers(params: Record<string, string | number | boolean | undefined> = {}) {
    return request<ListResponse<Driver>>(`/drivers${query({ page: 1, limit: 100, ...params })}`);
  },
  createDriver(data: Omit<Driver, 'id'>) {
    return request<Driver>('/drivers', { method: 'POST', body: JSON.stringify(data) });
  },
  updateDriver(id: string, data: Partial<Driver> & { status?: string }) {
    return request<Driver>(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteDriver(id: string) { return request<{ success: boolean }>(`/drivers/${id}`, { method: 'DELETE' }); },
  users(params: Record<string, string | number | boolean | undefined> = {}) {
    return request<ListResponse<AppUser>>(`/users${query({ page: 1, limit: 100, ...params })}`);
  },
  createUser(data: Record<string, unknown>) { return request<AppUser>('/users', { method: 'POST', body: JSON.stringify(data) }); },
  deleteUser(id: string) { return request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }); },
  notifications(params: Record<string, string | number | boolean | undefined> = {}) {
    return request<ListResponse<Notification> & { unreadCount: number }>(`/notifications${query({ page: 1, limit: 100, ...params })}`);
  },
  markNotificationRead(id: string) { return request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }); },
  markAllNotificationsRead() { return request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }); },
};

export { API_BASE_URL };
