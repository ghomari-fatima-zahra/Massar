import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateFuelLogDto, CreateServiceEntryDto, UpdateWearDto } from './dto/telemetry.dto';
import { VehicleStatusDto } from './dto/status.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles') @ApiBearerAuth() @Roles(UserRole.ADMIN) @Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}
  @Get('export') async export(@Query() query: QueryVehicleDto, @Res() response: Response) { response.type('text/csv').setHeader('Content-Disposition', 'attachment; filename=vehicles.csv'); response.send(await this.service.exportCsv(query)); }
  @Get() list(@Query() query: QueryVehicleDto) { return this.service.list(query); }
  @Get(':id/telemetry') telemetry(@Param('id') id: string) { return this.service.telemetry(id); }
  @Post(':id/telemetry/services') serviceEntry(@Param('id') id: string, @Body() dto: CreateServiceEntryDto) { return this.service.addService(id, dto); }
  @Post(':id/telemetry/fuel-logs') fuel(@Param('id') id: string, @Body() dto: CreateFuelLogDto) { return this.service.addFuel(id, dto); }
  @Patch(':id/telemetry/wear') wear(@Param('id') id: string, @Body() dto: UpdateWearDto) { return this.service.updateWear(id, dto); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() dto: CreateVehicleDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) { return this.service.update(id, dto); }
  @Patch(':id/status') status(@Param('id') id: string, @Body() dto: VehicleStatusDto) { return this.service.changeStatus(id, dto.status); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
