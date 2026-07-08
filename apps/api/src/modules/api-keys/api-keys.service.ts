import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  IApiKeyRepository,
  API_KEY_REPOSITORY,
} from '../../domain/repositories/api-key.repository';
import {
  ApiKeyInfo,
  CreatedApiKey,
} from '../../domain/entities/api-key.entity';
import { CreateApiKeyBodyDto } from './dto/api-key.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject(API_KEY_REPOSITORY)
    private readonly repo: IApiKeyRepository,
  ) {}

  list(user: AuthUser): ApiKeyInfo[] {
    // Owners/admins can see all, others see their own
    if (user.role === 'owner' || user.role === 'admin') {
      return this.repo.list();
    }
    return this.repo.list(user.userId);
  }

  create(user: AuthUser, dto: CreateApiKeyBodyDto): CreatedApiKey {
    const { fullKey, prefix, hash } = this.generateKey();
    return this.repo.create({
      userId: user.userId,
      name: dto.name,
      scopes: dto.scopes,
      bucketFilter: dto.bucketFilter,
      keyHash: hash,
      prefix,
      fullKey,
    });
  }

  revoke(id: string): { success: boolean } {
    const ok = this.repo.revoke(id);
    if (!ok) throw new NotFoundException('API key not found');
    return { success: true };
  }

  private generateKey() {
    const raw = `atl_${crypto.randomBytes(32).toString('hex')}`;
    const prefix = raw.slice(0, 12);
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { fullKey: raw, prefix, hash };
  }
}
