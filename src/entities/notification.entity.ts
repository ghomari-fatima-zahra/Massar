import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotificationType } from '../common/enums';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryColumn({ type: 'varchar', length: 32 }) id!: string;
  @Column({ length: 180 }) title!: string;
  @Column({ type: 'text' }) body!: string;
  @Column({ type: 'enum', enum: NotificationType }) type!: NotificationType;
  @Column({ type: 'boolean', default: false }) read!: boolean;
  @Column({ name: 'user_id', type: 'varchar', length: 32, nullable: true }) userId!: string | null;
  @ManyToOne(() => User, (user) => user.notifications, { nullable: true, onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user!: User | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
