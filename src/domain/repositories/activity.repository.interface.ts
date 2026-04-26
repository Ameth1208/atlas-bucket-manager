export interface ActivityEntry {
  id?: number;
  userId?: string;
  actor: string;
  action: string;
  target?: string;
  bucket?: string;
  provider?: string;
  ip?: string;
  statusCode?: number;
  createdAt?: number;
}

export interface IActivityRepository {
  log(entry: ActivityEntry): void;
  list(limit?: number, offset?: number): ActivityEntry[];
  listByBucket(bucket: string, limit?: number): ActivityEntry[];
  listByUser(userId: string, limit?: number): ActivityEntry[];
}
