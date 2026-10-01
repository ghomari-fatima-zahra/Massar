import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('monthly_usage')
export class MonthlyUsage {
  @PrimaryColumn({ name: 'vehicle_id', length: 32 }) vehicleId!: string;
  @PrimaryColumn({ type: 'date' }) month!: string;
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.monthlyUsage, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'vehicle_id' }) vehicle!: Vehicle;
  @Column({ name: 'km', type: 'integer' }) km!: number;
}
