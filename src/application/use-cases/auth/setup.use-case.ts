import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserInfo } from '../../../domain/entities/user.entity';

export interface SetupDto {
  name: string;
  email: string;
  password: string;
}

export class SetupUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string
  ) {}

  isComplete(): boolean {
    return this.userRepository.count() > 0;
  }

  execute(dto: SetupDto): { token: string; user: UserInfo } {
    if (this.isComplete()) {
      throw new Error('ALREADY_SETUP');
    }

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: 'owner',
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    const info: UserInfo = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return { token, user: info };
  }
}
