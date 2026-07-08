import { Inject, Injectable } from '@nestjs/common';
import {
  IActivityRepository,
  ACTIVITY_REPOSITORY,
} from '../../domain/repositories/activity.repository';
import { ActivityEntry } from '../../domain/entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repo: IActivityRepository,
  ) {}

  list(limit: number, offset: number): ActivityEntry[] {
    return this.repo.list(limit, offset);
  }

  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>) {
    this.repo.log(entry);
  }
}
