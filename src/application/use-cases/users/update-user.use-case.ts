import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserInfo, UpdateUserData } from '../../../domain/entities/user.entity';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  execute(id: string, data: UpdateUserData): UserInfo {
    if (data.email) {
      const existing = this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) throw new Error('EMAIL_TAKEN');
    }
    const user = this.userRepository.update(id, data);
    if (!user) throw new Error('NOT_FOUND');
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
