import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { CreateProviderDto } from './dto/provider.dto';
import { ProviderInfo } from '../../domain/entities/provider.entity';
import { ActivityService } from '../activity/activity.service';

export type PublicProvider = Omit<ProviderInfo, 'secretKey'> & { secretKey: '' };

@Injectable()
export class ProvidersService {
  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly buckets: IBucketRepository,
    private readonly activity: ActivityService,
  ) {}

  list(): PublicProvider[] {
    return this.buckets.listProviders().map(this.redact);
  }

  get(id: string): PublicProvider {
    const provider = this.buckets.getProvider(id);
    if (!provider) throw new NotFoundException('Provider not found');
    return this.redact(provider);
  }

  async create(dto: CreateProviderDto, actor?: string): Promise<PublicProvider> {
    const created = await this.buckets.createProvider({
      ...dto,
      useSSL: dto.useSSL ?? false,
      region: dto.region ?? 'us-east-1',
    });
    if (actor) {
      this.activity.log({ actor, action: 'provider', target: created.name });
    }
    return this.redact(created);
  }

  async update(id: string, dto: CreateProviderDto, actor?: string): Promise<PublicProvider> {
    if (!this.buckets.getProvider(id)) {
      throw new NotFoundException('Provider not found');
    }
    const updated = await this.buckets.updateProvider(id, {
      ...dto,
      useSSL: dto.useSSL ?? false,
      region: dto.region ?? 'us-east-1',
    });
    if (actor) {
      this.activity.log({ actor, action: 'provider', target: updated.name });
    }
    return this.redact(updated);
  }

  remove(id: string, actor?: string): { success: boolean } {
    const provider = this.buckets.getProvider(id);
    if (!provider) throw new NotFoundException('Provider not found');
    const ok = this.buckets.deleteProvider(id);
    if (!ok) throw new NotFoundException('Provider not found');
    if (actor) {
      this.activity.log({ actor, action: 'provider', target: provider.name });
    }
    return { success: true };
  }

  private redact = (p: ProviderInfo): PublicProvider => {
    const { secretKey, ...rest } = p;
    return { ...rest, secretKey: '' };
  };
}
