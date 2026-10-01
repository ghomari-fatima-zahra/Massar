import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}
  findById(id: string) { return this.repository.findOne({ where: { id } }); }
  findByIdentifier(identifier: string) { return this.repository.createQueryBuilder('user').addSelect('user.passwordHash').addSelect('user.refreshTokenHash').where('LOWER(user.email) = LOWER(:identifier) OR user.matricule = :identifier', { identifier }).getOne(); }
  findWithRefreshToken(id: string) { return this.repository.createQueryBuilder('user').addSelect('user.refreshTokenHash').where('user.id = :id', { id }).getOne(); }
  save(user: User) { return this.repository.save(user); }
  create(data: Partial<User>) { return this.repository.create(data); }
  get repo() { return this.repository; }
}
