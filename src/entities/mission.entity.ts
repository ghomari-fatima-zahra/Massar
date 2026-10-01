import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { MissionStatus, MissionType } from '../common/enums';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';
import { MissionStop } from './mission-stop.entity';

@Entity('missions')
export class Mission {
  @PrimaryColumn({ type: 'varchar', length: 32 }) id!: string;
  @Column({ name: 'demandeur_id', length: 32 }) demandeurId!: string;
  @ManyToOne(() => User, (user) => user.missions, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'demandeur_id' }) demandeur!: User;
  @Column({ type: 'enum', enum: MissionType }) type!: MissionType;
  @Column({ length: 500 }) object!: string;
  @Column({ length: 160 }) departure!: string;
  @Column({ length: 160 }) destination!: string;
  @Column({ name: 'round_trip', type: 'boolean', default: false }) roundTrip!: boolean;
  @Column({ name: 'departure_date', type: 'date' }) departureDate!: string;
  @Column({ name: 'return_date', type: 'date', nullable: true }) returnDate!: string | null;
  @Column({ name: 'departure_time', type: 'time' }) departureTime!: string;
  @Column({ name: 'return_time', type: 'time', nullable: true }) returnTime!: string | null;
  @Column({ type: 'integer' }) passengers!: number;
  @Column({ name: 'vehicle_needed', type: 'boolean', default: false }) vehicleNeeded!: boolean;
  @Column({ name: 'vehicle_type', type: 'varchar', length: 80, nullable: true }) vehicleType!: string | null;
  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.BROUILLON }) status!: MissionStatus;
  @Column({ name: 'vehicle_id', type: 'varchar', length: 32, nullable: true }) vehicleId!: string | null;
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.missions, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'vehicle_id' }) vehicle!: Vehicle | null;
  @Column({ name: 'driver_id', type: 'varchar', length: 32, nullable: true }) driverId!: string | null;
  @ManyToOne(() => Driver, (driver) => driver.missions, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'driver_id' }) driver!: Driver | null;
  @Column({ name: 'validated_by', type: 'varchar', length: 32, nullable: true }) validatedBy!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'validated_by' }) validator!: User | null;
  @Column({ name: 'rejection_reason', type: 'text', nullable: true }) rejectionReason!: string | null;
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true }) cancellationReason!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;

  @OneToMany(() => MissionStop, (stop) => stop.mission, { cascade: ['insert', 'update'] }) stops!: MissionStop[];
}
