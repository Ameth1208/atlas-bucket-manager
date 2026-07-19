import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

export const FAVORITES_REPOSITORY = Symbol('FAVORITES_REPOSITORY');

export interface FavoriteKey {
  providerId: string;
  bucketName: string;
}

@Injectable()
export class FavoritesService {
  constructor(private readonly database: DatabaseService) {}

  list(user: AuthUser): FavoriteKey[] {
    if (!user?.userId) return [];
    const rows = this.database.db
      .prepare('SELECT provider_id, bucket_name FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.userId) as { provider_id: string; bucket_name: string }[];
    return rows.map((r) => ({ providerId: r.provider_id, bucketName: r.bucket_name }));
  }

  add(user: AuthUser, key: FavoriteKey): { success: boolean } {
    if (!user?.userId) throw new NotFoundException('User not found');
    this.database.db
      .prepare(
        `INSERT OR IGNORE INTO favorites (user_id, provider_id, bucket_name) VALUES (?, ?, ?)`,
      )
      .run(user.userId, key.providerId, key.bucketName);
    return { success: true };
  }

  remove(user: AuthUser, key: FavoriteKey): { success: boolean } {
    if (!user?.userId) throw new NotFoundException('User not found');
    this.database.db
      .prepare(
        `DELETE FROM favorites WHERE user_id = ? AND provider_id = ? AND bucket_name = ?`,
      )
      .run(user.userId, key.providerId, key.bucketName);
    return { success: true };
  }

  has(user: AuthUser | undefined, key: FavoriteKey): boolean {
    if (!user?.userId) return false;
    const row = this.database.db
      .prepare(
        'SELECT 1 FROM favorites WHERE user_id = ? AND provider_id = ? AND bucket_name = ?',
      )
      .get(user.userId, key.providerId, key.bucketName);
    return !!row;
  }
}
