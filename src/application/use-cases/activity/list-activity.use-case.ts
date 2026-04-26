import { IActivityRepository, ActivityEntry } from '../../../domain/repositories/activity.repository.interface';

export class ListActivityUseCase {
  constructor(private activityRepository: IActivityRepository) {}

  execute(limit = 50, offset = 0): ActivityEntry[] {
    return this.activityRepository.list(limit, offset);
  }
}
