import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DriverStatus, LicenceCategory } from '../common/enums';
import { Mission } from './mission.entity';

@Entity('drivers')
export class Driver {
  @PrimaryColumn({ type: 'varchar', length: 32 }) id!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ unique: true, length: 64 }) matricule!: string;
  @Column({ name: 'licence_categories', type: 'text', array: true }) licenceCategories!: LicenceCategory[];
  @Column({ name: 'licence_expiry', type: 'date' }) licenceExpiry!: string;
  @Column({ length: 40 }) phone!: string;
  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.DISPONIBLE }) status!: DriverStatus;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @OneToMany(() => Mission, (mission) => mission.driver) missions!: Mission[];
}
