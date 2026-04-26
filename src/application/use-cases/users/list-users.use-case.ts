import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserInfo } from '../../../domain/entities/user.entity';

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  execute(): UserInfo[] {
    return this.userRepository.list();
  }
}
