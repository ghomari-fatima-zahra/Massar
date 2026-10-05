import { drivers, missions, notifications, users, vehicles } from '../data/mock';
import type { AppUser, Driver, Mission, Notification, Vehicle } from '../data/mock';

export function normalizeApiMission(mission: Mission & { returnDate?: string | null; returnTime?: string | null }) : Mission {
  return {
    ...mission,
    returnDate: mission.returnDate ?? '',
    returnTime: mission.returnTime ?? '',
    route: mission.route ?? { roundTrip: false, stops: [] },
  };
}

export function replaceApiData(data: {
  missions?: Mission[];
  vehicles?: Vehicle[];
  drivers?: Driver[];
  users?: AppUser[];
  notifications?: Notification[];
}) {
  if (data.missions) missions.splice(0, missions.length, ...data.missions);
  if (data.vehicles) vehicles.splice(0, vehicles.length, ...data.vehicles);
  if (data.drivers) drivers.splice(0, drivers.length, ...data.drivers);
  if (data.users) users.splice(0, users.length, ...data.users);
  if (data.notifications) notifications.splice(0, notifications.length, ...data.notifications);
}
