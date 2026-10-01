import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { AssignMissionDto } from './dto/assign-mission.dto';
import { CreateMissionDto } from './dto/create-mission.dto';
import { QueryMissionDto } from './dto/query-mission.dto';
import { ReasonDto } from './dto/reason.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionsService } from './missions.service';

@ApiTags('missions') @ApiBearerAuth() @Controller('missions')
export class MissionsController {
  constructor(private readonly service: MissionsService) {}
  @Get('export') async export(@Query() query: QueryMissionDto, @Res() response: Response) { response.type('text/csv').setHeader('Content-Disposition', 'attachment; filename=missions.csv'); response.send(await this.service.exportCsv(query)); }
  @Get() list(@Query() query: QueryMissionDto) { return this.service.list(query); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Roles(UserRole.ADMIN) @Post() create(@Body() dto: CreateMissionDto, @Req() request: Request & { user: { id: string } }) { return this.service.create(dto, request.user.id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateMissionDto) { return this.service.update(id, dto); }
  @Post(':id/submit-for-validation') submit(@Param('id') id: string) { return this.service.submit(id); }
  @Roles(UserRole.ADMIN) @Post(':id/validate') validate(@Param('id') id: string, @Req() request: Request & { user: { id: string } }) { return this.service.validate(id, request.user.id); }
  @Roles(UserRole.ADMIN) @Post(':id/reject') reject(@Param('id') id: string, @Body() dto: ReasonDto) { return this.service.reject(id, dto.reason); }
  @Roles(UserRole.ADMIN) @Post(':id/assign') assign(@Param('id') id: string, @Body() dto: AssignMissionDto) { return this.service.assign(id, dto); }
  @Post(':id/confirm') confirm(@Param('id') id: string) { return this.service.confirm(id); }
  @Post(':id/start') start(@Param('id') id: string) { return this.service.start(id); }
  @Post(':id/complete') complete(@Param('id') id: string) { return this.service.complete(id); }
  @Post(':id/cancel') cancel(@Param('id') id: string, @Body() dto: ReasonDto) { return this.service.cancel(id, dto.reason); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
