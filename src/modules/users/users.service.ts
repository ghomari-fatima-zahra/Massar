import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findForAuth(identifier: string) { return this.users.findByIdentifier(identifier); }

  async list(query: QueryUserDto) {
    const qb = this.users.repo.createQueryBuilder('user').orderBy(`user.${query.sort === 'name' ? 'name' : 'created_at'}`, query.order === 'ASC' ? 'ASC' : 'DESC');
    if (query.status) qb.andWhere('user.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search OR user.matricule ILIKE :search OR user.structure ILIKE :search)', { search: `%${query.search}%` });
    const total = await qb.getCount();
    const data = await qb.skip((query.page - 1) * query.limit).take(query.limit).getMany();
    return { data: data.map((user) => this.toResponse(user)), meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.users.repo.findOne({ where: [{ email: dto.email }, { matricule: dto.matricule }] });
    if (existing) throw new ConflictException('Email or matricule already exists');
    const user = this.users.create({ ...dto, id: `U${Date.now()}`, passwordHash: await bcrypt.hash(dto.password, 12), role: dto.role ?? UserRole.ADMIN, status: dto.status ?? UserStatus.ACTIF });
    delete (user as Partial<User> & { password?: string }).password;
    return this.toResponse(await this.users.save(user));
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const duplicate = await this.users.repo.findOne({ where: { email: dto.email } });
      if (duplicate) throw new ConflictException('Email already exists');
    }
    if (dto.matricule && dto.matricule !== user.matricule) {
      const duplicate = await this.users.repo.findOne({ where: { matricule: dto.matricule } });
      if (duplicate) throw new ConflictException('Matricule already exists');
    }
    Object.assign(user, dto);
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 12);
    delete (user as Partial<User> & { password?: string }).password;
    return this.toResponse(await this.users.save(user));
  }

  async setStatus(id: string, status: UserStatus) {
    const user = await this.findById(id);
    user.status = status;
    return this.toResponse(await this.users.save(user));
  }

  async remove(id: string) {
    const user = await this.findById(id);
    await this.users.repo.remove(user);
    return { success: true };
  }

  toResponse(user: User) {
    return { id: user.id, name: user.name, email: user.email, matricule: user.matricule, role: user.role, structure: user.structure, status: user.status, createdAt: user.createdAt };
  }
}
