import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../../entities/mission.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { DriverStatus, MissionStatus, VehicleStatus } from '../../common/enums';

@Injectable()
export class DashboardService {
  constructor(@InjectRepository(Mission) private readonly missions: Repository<Mission>, @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>, @InjectRepository(Driver) private readonly drivers: Repository<Driver>) {}

  async stats() {
    const [totalMissions, pendingMissions, inProgressMissions, completedMissions, totalVehicles, availableVehicles, totalDrivers, availableDrivers] = await Promise.all([
      this.missions.count(), this.missions.count({ where: { status: MissionStatus.EN_ATTENTE } }), this.missions.count({ where: { status: MissionStatus.EN_COURS } }), this.missions.count({ where: { status: MissionStatus.TERMINEE } }), this.vehicles.count(), this.vehicles.count({ where: { status: VehicleStatus.DISPONIBLE } }), this.drivers.count(), this.drivers.count({ where: { status: DriverStatus.DISPONIBLE } }),
    ]);
    const monthlyRows = await this.missions.createQueryBuilder('mission').select("TO_CHAR(DATE_TRUNC('month', mission.departure_date), 'YYYY-MM')", 'month').addSelect('COUNT(*)', 'count').where('mission.deleted_at IS NULL').groupBy("DATE_TRUNC('month', mission.departure_date)").orderBy("DATE_TRUNC('month', mission.departure_date)", 'ASC').getRawMany<{ month: string; count: string }>();
    const fleetRows = await this.vehicles.createQueryBuilder('vehicle').select('vehicle.status', 'status').addSelect('COUNT(*)', 'count').groupBy('vehicle.status').getRawMany<{ status: VehicleStatus; count: string }>();
    const missionsByMonth = monthlyRows.map((row) => ({ month: row.month, count: Number(row.count) }));
    const fleetAvailability = fleetRows.map((row) => ({ status: row.status, count: Number(row.count) }));
    return { kpis: { totalMissions, pendingMissions, inProgressMissions, completedMissions, totalVehicles, availableVehicles, totalDrivers, availableDrivers }, missionsByMonth, missionCountsByMonth: missionsByMonth, fleetAvailability, fleetBreakdown: fleetAvailability };
  }
}
