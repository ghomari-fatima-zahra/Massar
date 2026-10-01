import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_telemetry')
export class VehicleTelemetry {
  @PrimaryColumn({ name: 'vehicle_id', length: 32 }) vehicleId!: string;
  @OneToOne(() => Vehicle, (vehicle) => vehicle.telemetry, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'vehicle_id' }) vehicle!: Vehicle;
  @Column({ name: 'odometer_km', type: 'integer' }) odometerKm!: number;
  @Column({ name: 'fuel_level_pct', type: 'integer' }) fuelLevelPct!: number;
  @Column({ name: 'avg_consumption', type: 'numeric', precision: 7, scale: 2 }) avgConsumption!: number;
  @Column({ name: 'health_score', type: 'integer' }) healthScore!: number;
  @Column({ name: 'brake_wear_pct', type: 'integer' }) brakeWearPct!: number;
  @Column({ name: 'tire_wear_pct', type: 'integer' }) tireWearPct!: number;
  @Column({ name: 'oil_life_pct', type: 'integer' }) oilLifePct!: number;
  @Column({ name: 'next_service_km', type: 'integer' }) nextServiceKm!: number;
  @Column({ name: 'next_service_days', type: 'integer' }) nextServiceDays!: number;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
