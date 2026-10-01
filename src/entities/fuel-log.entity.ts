import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('fuel_logs')
export class FuelLog {
  @PrimaryColumn({ type: 'varchar', length: 64 }) id!: string;
  @Column({ name: 'vehicle_id', length: 32 }) vehicleId!: string;
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.fuelLogs, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'vehicle_id' }) vehicle!: Vehicle;
  @Column({ type: 'date' }) date!: string;
  @Column({ type: 'numeric', precision: 8, scale: 2 }) liters!: number;
  @Column({ name: 'cost_da', type: 'integer' }) costDA!: number;
  @Column({ type: 'integer' }) km!: number;
}
