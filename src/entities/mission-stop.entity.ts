import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Mission } from './mission.entity';

@Entity('mission_stops')
export class MissionStop {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'mission_id', length: 32 }) missionId!: string;
  @ManyToOne(() => Mission, (mission) => mission.stops, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'mission_id' }) mission!: Mission;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'integer' }) sequence!: number;
}
