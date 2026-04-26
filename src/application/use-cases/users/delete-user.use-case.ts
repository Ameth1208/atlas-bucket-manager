import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  execute(id: string, requesterId: string): void {
    if (id === requesterId) throw new Error('CANNOT_DELETE_SELF');
    const deleted = this.userRepository.delete(id);
    if (!deleted) throw new Error('NOT_FOUND');
  }
}
