import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { Bucket, BucketStats } from '../../domain/entities/bucket.entity';
import { CreateBucketDto, SetBucketLimitDto } from './dto/bucket.dto';

const S3_BUCKET_REGEX = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

@Injectable()
export class BucketsService {
  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly repo: IBucketRepository,
  ) {}

  list(): Promise<Bucket[]> {
    return this.repo.listBuckets();
  }

  async create(dto: CreateBucketDto): Promise<{ success: boolean }> {
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
    return { success: true };
  }

  async remove(providerId: string, name: string): Promise<{ success: boolean }> {
    await this.repo.deleteBucket(providerId, name);
    return { success: true };
  }

  async setVisibility(
    providerId: string,
    name: string,
    isPublic: boolean,
  ): Promise<{ success: boolean }> {
    await this.repo.setBucketVisibility(providerId, name, isPublic);
    return { success: true };
  }

  setLimit(
    providerId: string,
    name: string,
    dto: SetBucketLimitDto,
  ): { success: boolean; limit: number } {
    if (!this.repo.getProvider(providerId)) {
      throw new NotFoundException('Provider not found');
    }
    return { success: true, limit: dto.limit };
  }

  stats(providerId: string, name: string): Promise<BucketStats> {
    return this.repo.getBucketStats(providerId, name);
  }
}
