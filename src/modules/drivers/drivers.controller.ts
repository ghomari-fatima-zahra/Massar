import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateDriverDto } from './dto/create-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriversService } from './drivers.service';

@ApiTags('drivers') @ApiBearerAuth() @Roles(UserRole.ADMIN) @Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) {}
  @Get('export') async export(@Query() query: QueryDriverDto, @Res() response: Response) { response.type('text/csv').setHeader('Content-Disposition', 'attachment; filename=drivers.csv'); response.send(await this.service.exportCsv(query)); }
  @Get() list(@Query() query: QueryDriverDto) { return this.service.list(query); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() dto: CreateDriverDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateDriverDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
