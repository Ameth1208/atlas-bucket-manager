import { Inject, Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { UserInfo } from '../../domain/entities/user.entity';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { LoginDto, SetupDto, ChangePasswordDto } from './dto/auth.dto';

export interface AuthResult {
  token: string;
  user: UserInfo;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  isSetupComplete(): boolean {
    return this.users.count() > 0;
  }

  setup(dto: SetupDto): Promise<AuthResult> {
    if (this.isSetupComplete()) {
      throw new ConflictException('Already set up');
    }
    const user = this.users.create({ ...dto, role: 'owner' });
    return this.buildResult(user);
  }

  login(dto: LoginDto): Promise<AuthResult> {
    const user = this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!bcrypt.compareSync(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const info: UserInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarSeed: user.avatarSeed,
      createdAt: user.createdAt,
    };
    return this.buildResult(info);
  }

  me(payload: AuthUser): UserInfo | null {
    const user = this.users.findById(payload.userId);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarSeed: user.avatarSeed,
      createdAt: user.createdAt,
    };
  }

  changePassword(payload: AuthUser, dto: ChangePasswordDto): { success: boolean } {
    const user = this.users.findById(payload.userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!bcrypt.compareSync(dto.currentPassword, user.passwordHash)) {
      throw new ForbiddenException('Current password is incorrect');
    }
    this.users.update(user.id, { password: dto.newPassword });
    return { success: true };
  }

  private async buildResult(user: UserInfo): Promise<AuthResult> {
    const token = await this.jwt.signAsync(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' },
    );
    return { token, user };
  }
}
