import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
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
    const tempDir = this.config.get<string>('dbPath') ?? './data';
    const uploadDir = path.join(tempDir, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const uploaded: string[] = [];
    for (const file of files) {
      const tempPath = path.join(uploadDir, `${crypto.randomUUID()}-${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);
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
