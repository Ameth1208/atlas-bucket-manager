import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { Provider, ProviderInfo } from '../../../domain/entities/provider.entity';

export interface CreateProviderInput {
  name: string;
  kind: string;
  endpoint: string;
  port: number;
  ssl: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
}

export class CreateProviderUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(input: CreateProviderInput): Promise<ProviderInfo> {
    const id = `${input.kind}-${Date.now()}`;

    const provider: Provider = {
      id,
      name: input.name,
      kind: input.kind,
      endPoint: input.endpoint,
      port: input.port,
      useSSL: input.ssl,
      accessKey: input.accessKey,
      secretKey: input.secretKey,
      region: input.region,
    };

    await this.bucketRepository.addProvider(provider);

    return { id, name: input.name };
  }
}
