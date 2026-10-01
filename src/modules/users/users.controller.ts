import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatusDto } from './dto/status.dto';
import { UsersService } from './users.service';

@ApiTags('users') @ApiBearerAuth() @Roles(UserRole.ADMIN) @Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get() list(@Query() query: QueryUserDto) { return this.service.list(query); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id).then((user) => this.service.toResponse(user)); }
  @Post() create(@Body() dto: CreateUserDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.service.update(id, dto); }
  @Patch(':id/status') status(@Param('id') id: string, @Body() dto: UserStatusDto) { return this.service.setStatus(id, dto.status); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
