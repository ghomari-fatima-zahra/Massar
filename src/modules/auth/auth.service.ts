import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersRepository, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async login(dto: LoginDto) {
    const identifier = dto.identifier ?? dto.email ?? dto.matricule;
    if (!identifier) throw new UnauthorizedException('Invalid credentials');
    const user = await this.users.findByIdentifier(identifier);
    if (!user || user.status !== 'actif' || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    user.lastLoginAt = new Date();
    const tokens = await this.issueTokens(user);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    await this.users.save(user);
    return { ...tokens, user: { id: user.id, name: user.name, email: user.email, matricule: user.matricule, role: user.role, structure: user.structure, status: user.status, createdAt: user.createdAt } };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; type: string }>(refreshToken, { secret: this.config.getOrThrow<string>('jwt.refreshSecret') });
      if (payload.type !== 'refresh') throw new Error('wrong token type');
      const user = await this.users.findWithRefreshToken(payload.sub);
      if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) throw new UnauthorizedException('Invalid refresh token');
      const tokens = await this.issueTokens(user);
      user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
      await this.users.save(user);
      return { ...tokens, user: { id: user.id, name: user.name, email: user.email, matricule: user.matricule, role: user.role, structure: user.structure, status: user.status, createdAt: user.createdAt } };
    } catch { throw new UnauthorizedException('Invalid refresh token'); }
  }

  async logout(userId: string) {
    const user = await this.users.findWithRefreshToken(userId);
    if (user) { user.refreshTokenHash = null; await this.users.save(user); }
    return { success: true };
  }

  private async issueTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: user.id, role: user.role, type: 'access' }, { secret: this.config.getOrThrow<string>('jwt.accessSecret'), expiresIn: this.config.get<string>('jwt.accessExpiresIn', '15m') as any }),
      this.jwt.signAsync({ sub: user.id, role: user.role, type: 'refresh' }, { secret: this.config.getOrThrow<string>('jwt.refreshSecret'), expiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d') as any }),
    ]);
    return { accessToken, refreshToken };
  }
}
