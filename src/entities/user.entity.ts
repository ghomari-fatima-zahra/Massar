import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { Notification } from './notification.entity';
import { UserRole, UserStatus } from '../common/enums';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 32 }) id!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ unique: true, length: 255 }) email!: string;
  @Column({ unique: true, length: 64 }) matricule!: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN }) role!: UserRole;
  @Column({ length: 160 }) structure!: string;
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIF }) status!: UserStatus;
  @Column({ name: 'password_hash', length: 255, select: false }) passwordHash!: string;
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true, select: false }) refreshTokenHash!: string | null;
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true }) lastLoginAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @OneToMany(() => Mission, (mission) => mission.demandeur) missions!: Mission[];
  @OneToMany(() => Notification, (notification) => notification.user) notifications!: Notification[];
}
