import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { StorageObject, SearchResult } from '../../domain/entities/object.entity';
import { CreateFolderBodyDto, DeleteObjectsDto } from '../buckets/dto/bucket.dto';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service';

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n < 1024 ** 4) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  return `${(n / 1024 ** 4).toFixed(2)} TB`;
}

@Injectable()
export class ObjectsService {
  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly repo: IBucketRepository,
    private readonly config: ConfigService,
    private readonly activity: ActivityService,
  ) {}

  list(providerId: string, bucket: string, prefix?: string): Promise<StorageObject[]> {
    return this.repo.listObjects(providerId, bucket, prefix);
  }

  search(bucket: string, providerId: string, query: string): Promise<SearchResult[]> {
    return this.repo.searchObjects(bucket, providerId, query);
  }

  fileTypes() {
    return this.repo.getFileTypes();
  }

  presignedUrl(providerId: string, bucket: string, key: string): Promise<{ url: string }> {
    return this.repo.getPresignedUrl(providerId, bucket, key).then((url: string) => ({ url }));
  }

  stream(providerId: string, bucket: string, key: string): Promise<NodeJS.ReadableStream> {
    return this.repo.getObjectStream(providerId, bucket, key);
  }

  async delete(
    providerId: string,
    bucket: string,
    dto: DeleteObjectsDto,
    actor?: string,
  ): Promise<{ success: boolean }> {
    if (!Array.isArray(dto.keys) || dto.keys.length === 0) {
      throw new BadRequestException('keys must be a non-empty array');
    }
    await this.repo.deleteObjects(providerId, bucket, dto.keys);
    if (actor) {
      this.activity.log({
        actor,
        action: 'delete',
        target: dto.keys.slice(0, 3).join(', ') + (dto.keys.length > 3 ? ` +${dto.keys.length - 3}` : ''),
        bucket,
        provider: providerId,
      });
    }
    return { success: true };
  }

  async createFolder(
    providerId: string,
    bucket: string,
    dto: CreateFolderBodyDto,
    actor?: string,
  ): Promise<{ success: boolean }> {
    if (!dto.folderName) {
      throw new BadRequestException('folderName is required');
    }
    await this.repo.createFolder(providerId, bucket, dto.folderName, dto.prefix ?? '');
    if (actor) {
      this.activity.log({
        actor,
        action: 'folder',
        target: dto.folderName,
        bucket,
        provider: providerId,
      });
    }
    return { success: true };
  }

  async upload(
    providerId: string,
    bucket: string,
    files: Express.Multer.File[],
    prefix = '',
    actor?: string,
  ): Promise<{ success: boolean; uploaded: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const limit = this.repo.getBucketLimit(providerId, bucket);
    if (limit !== null && limit > 0) {
      const incomingSize = files.reduce((s, f) => s + f.size, 0);
      const currentUsage = await this.repo.getBucketUsage(providerId, bucket);
      if (currentUsage + incomingSize > limit) {
        throw new PayloadTooLargeException(
          `Bucket limit exceeded: ${fmtBytes(limit)} (current ${fmtBytes(currentUsage)} + incoming ${fmtBytes(incomingSize)})`,
        );
      }
    }

    const tempDir = this.config.get<string>('dbPath') ?? './data';
    const uploadDir = path.join(tempDir, '..', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const uploaded: string[] = [];
    for (const file of files) {
      const tempPath = path.join(uploadDir, `${crypto.randomUUID()}-${file.originalname}`);
      await fs.writeFile(tempPath, file.buffer);
      const objectName = prefix
        ? `${prefix.replace(/\/$/, '')}/${file.originalname}`
        : file.originalname;
      await this.repo.uploadFile(providerId, bucket, objectName, tempPath);
      uploaded.push(objectName);
    }
    if (actor) {
      this.activity.log({
        actor,
        action: 'upload',
        target: uploaded.slice(0, 3).join(', ') + (uploaded.length > 3 ? ` +${uploaded.length - 3}` : ''),
        bucket,
        provider: providerId,
      });
    }
    return { success: true, uploaded };
  }
}
