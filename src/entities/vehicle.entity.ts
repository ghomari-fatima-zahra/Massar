import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { VehicleCategory, VehicleStatus } from '../common/enums';
import { Mission } from './mission.entity';
import { VehicleTelemetry } from './vehicle-telemetry.entity';
import { ServiceEntry } from './service-entry.entity';
import { FuelLog } from './fuel-log.entity';
import { MonthlyUsage } from './monthly-usage.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryColumn({ type: 'varchar', length: 32 }) id!: string;
  @Column({ type: 'enum', enum: VehicleCategory }) category!: VehicleCategory;
  @Column({ unique: true, length: 32 }) registration!: string;
  @Column({ unique: true, length: 64 }) gps!: string;
  @Column({ length: 80 }) brand!: string;
  @Column({ length: 80 }) model!: string;
  @Column({ length: 80 }) type!: string;
  @Column({ type: 'integer' }) capacity!: number;
  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.DISPONIBLE }) status!: VehicleStatus;
  @Column({ name: 'last_inspection', type: 'date' }) lastInspection!: string;
  @Column({ name: 'next_inspection', type: 'date' }) nextInspection!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @OneToMany(() => Mission, (mission) => mission.vehicle) missions!: Mission[];
  @OneToOne(() => VehicleTelemetry, (telemetry) => telemetry.vehicle) telemetry!: VehicleTelemetry;
  @OneToMany(() => ServiceEntry, (entry) => entry.vehicle) services!: ServiceEntry[];
  @OneToMany(() => FuelLog, (entry) => entry.vehicle) fuelLogs!: FuelLog[];
  @OneToMany(() => MonthlyUsage, (usage) => usage.vehicle) monthlyUsage!: MonthlyUsage[];
}
