import { Inject, Injectable } from '@nestjs/common';
import {
  IActivityRepository,
  ACTIVITY_REPOSITORY,
} from '../../domain/repositories/activity.repository';
import { ActivityEntry } from '../../domain/entities/activity.entity';

export interface ActivityFilters {
  action?: string;
  actor?: string;
  bucket?: string;
  provider?: string;
  from?: number;
  to?: number;
}

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repo: IActivityRepository,
  ) {}

  list(limit: number, offset: number, filters: ActivityFilters = {}): ActivityEntry[] {
    return this.repo.list(limit, offset, filters);
  }

  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>) {
    this.repo.log(entry);
  }
}
