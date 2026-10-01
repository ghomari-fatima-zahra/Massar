import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { Driver } from '../entities/driver.entity';
import { FuelLog } from '../entities/fuel-log.entity';
import { MissionStop } from '../entities/mission-stop.entity';
import { Mission } from '../entities/mission.entity';
import { MonthlyUsage } from '../entities/monthly-usage.entity';
import { Notification } from '../entities/notification.entity';
import { ServiceEntry } from '../entities/service-entry.entity';
import { User } from '../entities/user.entity';
import { VehicleTelemetry } from '../entities/vehicle-telemetry.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { DriverStatus, LicenceCategory, MissionStatus, MissionType, NotificationType, UserRole, UserStatus, VehicleCategory, VehicleStatus } from '../common/enums';

const demoPassword = 'Massar123!';

async function seed() {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect();
  await runner.query('TRUNCATE TABLE "monthly_usage", "fuel_logs", "service_entries", "vehicle_telemetry", "notifications", "mission_stops", "missions", "vehicles", "drivers", "users" CASCADE');
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const users = [
    ['U001', 'Mohamed Salah Benali', 'ms.benali@dot.dz', 'ALT-2341', 'Direction Régionale Oran', '2022-06-15', UserStatus.ACTIF],
    ['U002', 'Fatima Zohra Khelif', 'fz.khelif@dot.dz', 'ALT-1876', 'Division Infrastructure', '2021-09-01', UserStatus.ACTIF],
    ['U003', 'Karim Meziani', 'k.meziani@dot.dz', 'ALT-3012', 'Centre Télécom Tlemcen', '2023-01-20', UserStatus.ACTIF],
    ['U004', 'Amina Bouhired', 'a.bouhired@dot.dz', 'ALT-0987', 'Direction Générale', '2020-03-10', UserStatus.ACTIF],
    ['U005', 'Rachid Aouad', 'r.aouad@dot.dz', 'ALT-0542', 'Direction Générale', '2019-11-05', UserStatus.ACTIF],
    ['U006', 'Nadia Ferdi', 'n.ferdi@dot.dz', 'ALT-0120', 'Direction Générale', '2018-07-22', UserStatus.ACTIF],
    ['U007', 'Omar Haddad', 'o.haddad@dot.dz', 'ALT-4100', 'Direction Régionale Constantine', '2021-04-18', UserStatus.INACTIF],
  ].map(([id, name, email, matricule, structure, createdAt, status]) => AppDataSource.getRepository(User).create({ id: id as string, name: name as string, email: email as string, matricule: matricule as string, structure: structure as string, role: UserRole.ADMIN, status: status as UserStatus, passwordHash, createdAt: new Date(createdAt as string) }));
  await AppDataSource.getRepository(User).save(users);

  const vehicles = [
    ['V001', VehicleCategory.CAR, '16-12345-DZ', 'GPS-DZ-16001', 'Toyota', 'Land Cruiser', 'SUV', 7, VehicleStatus.DISPONIBLE, '2026-01-10', '2027-01-10'],
    ['V002', VehicleCategory.CAR, '16-98765-DZ', 'GPS-DZ-16002', 'Renault', 'Symbol', 'Berline', 5, VehicleStatus.DISPONIBLE, '2026-02-15', '2027-02-15'],
    ['V003', VehicleCategory.BUS, '23-45678-DZ', 'GPS-DZ-23001', 'Hyundai', 'H1', 'Minibus', 12, VehicleStatus.MAINTENANCE, '2025-12-01', '2026-06-01'],
    ['V004', VehicleCategory.CAR, '16-11111-DZ', 'GPS-DZ-16003', 'Peugeot', '301', 'Berline', 5, VehicleStatus.DISPONIBLE, '2026-03-01', '2027-03-01'],
    ['V005', VehicleCategory.BUS, '31-22222-DZ', 'GPS-DZ-31001', 'Mercedes', 'Vito', 'Minivan', 8, VehicleStatus.DISPONIBLE, '2026-02-20', '2027-02-20'],
  ].map(([id, category, registration, gps, brand, model, type, capacity, status, lastInspection, nextInspection]) => AppDataSource.getRepository(Vehicle).create({ id: id as string, category: category as VehicleCategory, registration: registration as string, gps: gps as string, brand: brand as string, model: model as string, type: type as string, capacity: capacity as number, status: status as VehicleStatus, lastInspection: lastInspection as string, nextInspection: nextInspection as string }));
  await AppDataSource.getRepository(Vehicle).save(vehicles);

  const drivers = [
    ['D001', 'Ahmed Bouchenak', 'DRV-0041', [LicenceCategory.B, LicenceCategory.D], '2027-08-15', '+213 555 01 23 45', DriverStatus.DISPONIBLE],
    ['D002', 'Yacine Hamidi', 'DRV-0017', [LicenceCategory.B], '2027-03-20', '+213 555 06 78 90', DriverStatus.DISPONIBLE],
    ['D003', 'Mourad Chikhi', 'DRV-0029', [LicenceCategory.B, LicenceCategory.D], '2028-01-10', '+213 555 11 22 33', DriverStatus.DISPONIBLE],
    ['D004', 'Ibrahim Salhi', 'DRV-0058', [LicenceCategory.B], '2026-11-20', '+213 555 44 55 66', DriverStatus.CONGE],
  ].map(([id, name, matricule, licenceCategories, licenceExpiry, phone, status]) => AppDataSource.getRepository(Driver).create({ id: id as string, name: name as string, matricule: matricule as string, licenceCategories: licenceCategories as LicenceCategory[], licenceExpiry: licenceExpiry as string, phone: phone as string, status: status as DriverStatus }));
  await AppDataSource.getRepository(Driver).save(drivers);

  const missionRows = [
    ['M2026-001', 'U001', MissionType.EXTERNE, 'Réunion technique – Installation fibre optique', 'Alger', 'Centre Télécom Tlemcen', true, '2026-03-18', '2026-03-19', '07:00', '18:00', 3, true, 'SUV', MissionStatus.EN_ATTENTE, 'V005', 'D001', null],
    ['M2026-002', 'U002', MissionType.EXTERNE, 'Audit réseau cuivre – Zone Mitidja', 'Alger', 'Blida', false, '2026-03-20', '2026-03-20', '08:30', '17:00', 2, true, 'Berline', MissionStatus.EN_ATTENTE, 'V004', 'D003', 'U005'],
    ['M2026-003', 'U003', MissionType.EXTERNE, 'Formation technique FTTH – Centre Constantine', 'Tlemcen', 'Constantine', false, '2026-03-22', '2026-03-24', '06:00', '20:00', 1, true, 'Berline', MissionStatus.EN_COURS, 'V002', 'D001', 'U005'],
    ['M2026-004', 'U004', MissionType.INTERNE, 'Réunion de coordination – Direction Régionale Annaba', 'Alger', 'Annaba', false, '2026-03-15', '2026-03-15', '09:00', '16:00', 4, true, 'SUV', MissionStatus.EN_COURS, 'V001', 'D002', 'U005'],
    ['M2026-005', 'U001', MissionType.EXTERNE, 'Inspection antennes – Zone Sétif', 'Oran', 'Sétif', false, '2026-03-05', '2026-03-06', '07:00', '19:00', 2, true, 'SUV', MissionStatus.TERMINEE, 'V001', 'D003', 'U005'],
    ['M2026-006', 'U003', MissionType.INTERNE, 'Visite client – Béjaïa', 'Tlemcen', 'Béjaïa', false, '2026-03-28', '2026-03-29', '08:00', '18:00', 2, false, null, MissionStatus.BROUILLON, null, null, null],
    ['M2026-007', 'U002', MissionType.EXTERNE, 'Déploiement fibre – Zone Boumerdès', 'Alger', 'Boumerdès', false, '2026-03-12', '2026-03-12', '08:00', '17:30', 3, true, 'Minibus', MissionStatus.ANNULEE, null, null, null],
  ];
  const missionRepository = AppDataSource.getRepository(Mission);
  const missions = missionRows.map(([id, demandeurId, type, object, departure, destination, roundTrip, departureDate, returnDate, departureTime, returnTime, passengers, vehicleNeeded, vehicleType, status, vehicleId, driverId, validatedBy]) => missionRepository.create({ id: id as string, demandeurId: demandeurId as string, type: type as MissionType, object: object as string, departure: departure as string, destination: destination as string, roundTrip: roundTrip as boolean, departureDate: departureDate as string, returnDate: returnDate as string, departureTime: departureTime as string, returnTime: returnTime as string, passengers: passengers as number, vehicleNeeded: vehicleNeeded as boolean, vehicleType: vehicleType as string | null, status: status as MissionStatus, vehicleId: vehicleId as string | null, driverId: driverId as string | null, validatedBy: validatedBy as string | null, createdAt: new Date('2026-03-01') }));
  await missionRepository.save(missions);
  const stopsRepository = AppDataSource.getRepository(MissionStop);
  const stopNames: Record<string, string[]> = { 'M2026-001': ['Alger', 'Centre Télécom Tlemcen', 'Alger'], 'M2026-002': ['Alger', 'Blida'], 'M2026-003': ['Tlemcen', 'Constantine'], 'M2026-004': ['Alger', 'Annaba'], 'M2026-005': ['Oran', 'Sétif'], 'M2026-006': ['Tlemcen', 'Béjaïa'], 'M2026-007': ['Alger', 'Boumerdès'] };
  await stopsRepository.save(Object.entries(stopNames).flatMap(([missionId, names]) => names.map((name, index) => stopsRepository.create({ missionId, name, sequence: index + 1 }))));

  const notifications = [
    ['N001', 'Mission validée', 'Votre mission M2026-002 vers Blida a été validée.', NotificationType.SUCCESS, false, '2026-03-14T10:30:00'],
    ['N002', 'Véhicule affecté', 'Un véhicule (Renault Symbol – 16-98765-DZ) a été affecté à votre mission M2026-003.', NotificationType.INFO, false, '2026-03-14T14:15:00'],
    ['N003', 'Mission annulée', 'Votre mission M2026-007 a été annulée. Veuillez choisir une nouvelle date.', NotificationType.DANGER, false, '2026-03-13T09:00:00'],
    ['N004', 'Permis expirant bientôt', 'Le permis du conducteur Ibrahim Salhi expire le 20/11/2026.', NotificationType.WARNING, true, '2026-03-12T08:00:00'],
    ['N005', 'Inspection technique requise', "Le véhicule Hyundai H1 (23-45678-DZ) doit être présenté à l'inspection.", NotificationType.WARNING, true, '2026-03-11T16:00:00'],
    ['N006', 'Mission en cours', 'La mission M2026-004 vers Annaba est maintenant en cours.', NotificationType.INFO, true, '2026-03-15T09:05:00'],
    ['N007', 'Maintenance véhicule proche', 'La prochaine inspection du Toyota Land Cruiser (16-12345-DZ) arrive dans 30 jours.', NotificationType.WARNING, false, '2026-03-16T08:00:00'],
  ].map(([id, title, body, type, read, createdAt]) => AppDataSource.getRepository(Notification).create({ id: id as string, title: title as string, body: body as string, type: type as NotificationType, read: read as boolean, userId: null, createdAt: new Date(createdAt as string) }));
  await AppDataSource.getRepository(Notification).save(notifications);

  const telemetryRepo = AppDataSource.getRepository(VehicleTelemetry);
  const serviceRepo = AppDataSource.getRepository(ServiceEntry);
  const fuelRepo = AppDataSource.getRepository(FuelLog);
  const usageRepo = AppDataSource.getRepository(MonthlyUsage);
  for (const [index, vehicle] of vehicles.entries()) {
    const odometer = 68000 + index * 17300;
    await telemetryRepo.save(telemetryRepo.create({ vehicleId: vehicle.id, odometerKm: odometer, fuelLevelPct: 28 + index * 11, avgConsumption: 7.1 + index * 0.9, healthScore: 94 - index * 4, brakeWearPct: 12 + index * 7, tireWearPct: 18 + index * 5, oilLifePct: 78 - index * 6, nextServiceKm: 900 + index * 530, nextServiceDays: 18 + index * 9 }));
    await serviceRepo.save([0, 1, 2].map((serviceIndex) => serviceRepo.create({ id: `S-${vehicle.id}-${serviceIndex}`, vehicleId: vehicle.id, date: `2026-0${Math.min(9, serviceIndex + 1)}-10`, km: odometer - (serviceIndex + 1) * 2300, type: ['Vidange + filtres', 'Inspection technique', 'Révision complète'][serviceIndex], center: ['Atelier central — Alger', 'Garage agréé — Oran', 'Centre auto — Constantine'][serviceIndex], costDA: 6500 + serviceIndex * 7200 })));
    await fuelRepo.save([0, 1, 2].map((fuelIndex) => { const liters = 42 + fuelIndex * 6; return fuelRepo.create({ id: `F-${vehicle.id}-${fuelIndex}`, vehicleId: vehicle.id, date: `2026-03-${String(5 + fuelIndex * 5).padStart(2, '0')}`, liters, costDA: Math.round(liters * 45.2), km: odometer - fuelIndex * 420 }); }));
    const usage = Array.from({ length: 12 }, (_, monthIndex) => { const month = new Date(Date.UTC(2025, 3 + monthIndex, 1)).toISOString().slice(0, 10); return usageRepo.create({ vehicleId: vehicle.id, month, km: 720 + ((index * 173 + monthIndex * 97) % 1050) }); });
    await usageRepo.save(usage);
  }
  await runner.release();
  await AppDataSource.destroy();
  console.log(`Seed complete. Demo password for all users: ${demoPassword}`);
}

void seed().catch(async (error: unknown) => { console.error(error); if (AppDataSource.isInitialized) await AppDataSource.destroy(); process.exitCode = 1; });
