import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { CreateProviderDto } from './dto/provider.dto';
import { ProviderInfo } from '../../domain/entities/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly buckets: IBucketRepository,
  ) {}

  list(): ProviderInfo[] {
    return this.buckets.listProviders();
  }

  get(id: string): ProviderInfo {
    const provider = this.buckets.getProvider(id);
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  create(dto: CreateProviderDto): ProviderInfo {
    return this.buckets.createProvider({
      ...dto,
      useSSL: dto.useSSL ?? false,
      region: dto.region ?? 'us-east-1',
    });
  }

  remove(id: string): { success: boolean } {
    const ok = this.buckets.deleteProvider(id);
    if (!ok) throw new NotFoundException('Provider not found');
    return { success: true };
  }
}
