import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserInfo, CreateUserData } from '../../../domain/entities/user.entity';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  execute(data: CreateUserData): UserInfo {
    const existing = this.userRepository.findByEmail(data.email);
    if (existing) throw new Error('EMAIL_TAKEN');
    const user = this.userRepository.create(data);
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
