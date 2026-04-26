import { IActivityRepository, ActivityEntry } from '../../../domain/repositories/activity.repository.interface';

export class LogActivityUseCase {
  constructor(private activityRepository: IActivityRepository) {}

  execute(entry: ActivityEntry): void {
    try {
      this.activityRepository.log(entry);
    } catch {
      // activity logging is best-effort
    }
  }
}
