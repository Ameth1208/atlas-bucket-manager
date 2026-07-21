import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
  BucketListResult,
} from '../../domain/repositories/bucket.repository';
import { BucketStats } from '../../domain/entities/bucket.entity';
import { CreateBucketDto, SetBucketLimitDto } from './dto/bucket.dto';
import { ActivityService } from '../activity/activity.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const S3_BUCKET_REGEX = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n < 1024 ** 4) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  return `${(n / 1024 ** 4).toFixed(2)} TB`;
}

@Injectable()
export class BucketsService {
  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly repo: IBucketRepository,
    private readonly activity: ActivityService,
    private readonly favorites: FavoritesService,
  ) {}

  async list(user?: AuthUser): Promise<BucketListResult> {
    const result = await this.repo.listBuckets();
    if (user) {
      result.buckets = result.buckets.map((b) => ({
        ...b,
        isFavorite: this.favorites.has(user, { providerId: b.providerId, bucketName: b.name }),
      }));
    }
    return result;
  }

  async statsMany(user?: AuthUser) {
    const { buckets } = await this.repo.listBuckets();
    if (!buckets.length) return { stats: {} };
    const filtered = user ? buckets : buckets;
    const stats = await this.repo.getBucketStatsMany(
      filtered.map((b) => ({ providerId: b.providerId, name: b.name })),
    );
    return { stats };
  }

  async create(dto: CreateBucketDto, actor?: string): Promise<{ success: boolean }> {
    if (!dto.providerId || !dto.name) {
      throw new BadRequestException('Provider ID and bucket name are required');
    }
    if (dto.name.length < 3 || dto.name.length > 63) {
      throw new BadRequestException('Bucket name must be between 3 and 63 characters');
    }
    if (!S3_BUCKET_REGEX.test(dto.name)) {
      throw new BadRequestException('Bucket name must follow S3 naming conventions');
    }
    await this.repo.createBucket(dto);
    if (actor) {
      const limitNote = dto.limit ? ` (límite ${fmtBytes(dto.limit)})` : '';
      this.activity.log({
        actor,
        action: 'create',
        target: `${dto.name}${limitNote}`,
        provider: dto.providerId,
      });
    }
    return { success: true };
  }

  async remove(providerId: string, name: string, actor?: string): Promise<{ success: boolean }> {
    await this.repo.deleteBucket(providerId, name);
    if (actor) {
      this.activity.log({
        actor,
        action: 'delete_bucket',
        target: name,
        provider: providerId,
      });
    }
    return { success: true };
  }

  async setVisibility(
    providerId: string,
    name: string,
    isPublic: boolean,
    actor?: string,
  ): Promise<{ success: boolean }> {
    await this.repo.setBucketVisibility(providerId, name, isPublic);
    if (actor) {
      this.activity.log({
        actor,
        action: 'policy',
        target: isPublic ? 'público' : 'privado',
        bucket: name,
        provider: providerId,
      });
    }
    return { success: true };
  }

  setLimit(
    providerId: string,
    name: string,
    dto: SetBucketLimitDto,
    actor?: string,
  ): { success: boolean; limit: number } {
    if (!this.repo.getProvider(providerId)) {
      throw new NotFoundException('Provider not found');
    }
    this.repo.setBucketLimit(providerId, name, dto.limit);
    if (actor) {
      this.activity.log({
        actor,
        action: 'policy',
        target: `límite ${fmtBytes(dto.limit)}`,
        bucket: name,
        provider: providerId,
      });
    }
    return { success: true, limit: dto.limit };
  }

  stats(providerId: string, name: string): Promise<BucketStats> {
    return this.repo.getBucketStats(providerId, name);
  }

  publicEndpoint(providerId: string, name: string): string | null {
    return this.repo.getPublicEndpoint(providerId, name);
  }
}
