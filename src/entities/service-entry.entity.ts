import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('service_entries')
export class ServiceEntry {
  @PrimaryColumn({ type: 'varchar', length: 64 }) id!: string;
  @Column({ name: 'vehicle_id', length: 32 }) vehicleId!: string;
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.services, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'vehicle_id' }) vehicle!: Vehicle;
  @Column({ type: 'date' }) date!: string;
  @Column({ type: 'integer' }) km!: number;
  @Column({ length: 160 }) type!: string;
  @Column({ length: 160 }) center!: string;
  @Column({ name: 'cost_da', type: 'integer' }) costDA!: number;
}
