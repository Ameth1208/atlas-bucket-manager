import { Inject, Injectable } from '@nestjs/common';
import {
  IActivityRepository,
  ACTIVITY_REPOSITORY,
} from '../../domain/repositories/activity.repository';
import { ActivityEntry } from '../../domain/entities/activity.entity';

export interface ActivityFilters {
  action?: string;
  actions?: string[];
  actor?: string;
  bucket?: string;
  provider?: string;
  from?: number;
  to?: number;
}

export interface ListActivityQuery {
  limit?: string;
  offset?: string;
  action?: string;
  actions?: string;
  actor?: string;
  bucket?: string;
  provider?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repo: IActivityRepository,
  ) {}

  list(query: ListActivityQuery = {}): ActivityEntry[] {
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    const actionList = query.actions
      ? query.actions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const filters: ActivityFilters = {
      action: query.action,
      actions: actionList && actionList.length > 0 ? actionList : undefined,
      actor: query.actor,
      bucket: query.bucket,
      provider: query.provider,
      from: query.from ? parseInt(query.from, 10) : undefined,
      to: query.to ? parseInt(query.to, 10) : undefined,
    };
    return this.repo.list(limit, offset, filters);
  }

  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>) {
    this.repo.log(entry);
  }
}
