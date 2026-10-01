import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
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
import { InitialSchema1710000000000 } from './migrations/1710000000000-InitialSchema';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, Driver, Vehicle, Mission, MissionStop, Notification, VehicleTelemetry, ServiceEntry, FuelLog, MonthlyUsage],
  migrations: [InitialSchema1710000000000],
  synchronize: false,
});
