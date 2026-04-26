import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserInfo } from '../../../domain/entities/user.entity';

export interface LoginDto {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string
  ) {}

  execute(dto: LoginDto): { token: string; user: UserInfo } | null {
    const user = this.userRepository.findByEmail(dto.email);
    if (!user) return null;

    const valid = bcrypt.compareSync(dto.password, user.passwordHash);
    if (!valid) return null;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    const info: UserInfo = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return { token, user: info };
  }
}
