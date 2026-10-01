import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';
import { Driver } from './entities/driver.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { MissionStop } from './entities/mission-stop.entity';
import { Mission } from './entities/mission.entity';
import { MonthlyUsage } from './entities/monthly-usage.entity';
import { Notification } from './entities/notification.entity';
import { ServiceEntry } from './entities/service-entry.entity';
import { User } from './entities/user.entity';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { Vehicle } from './entities/vehicle.entity';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { MissionsModule } from './modules/missions/missions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema: envValidationSchema }),
    ThrottlerModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => [{ ttl: config.get<number>('AUTH_RATE_LIMIT_TTL', 60000), limit: config.get<number>('AUTH_RATE_LIMIT_LIMIT', 10) }] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.getOrThrow<string>('database.url'),
        ssl: config.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
        entities: [User, Driver, Vehicle, Mission, MissionStop, Notification, VehicleTelemetry, ServiceEntry, FuelLog, MonthlyUsage],
        synchronize: config.get<boolean>('database.synchronize', false),
        migrationsRun: config.get<boolean>('database.runMigrations', false),
        migrations: ['dist/database/migrations/*.js'],
        logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
      }),
    }),
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    MissionsModule,
    NotificationsModule,
    DashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
