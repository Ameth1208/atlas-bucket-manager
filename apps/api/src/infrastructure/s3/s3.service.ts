import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { DatabaseService } from '../database/database.service';
import { ProviderInfo } from '../../domain/entities/provider.entity';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private clients = new Map<string, MinioClient>();

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    // Ensure data dirs exist
    const dataDir = this.config.get<string>('dbPath') ?? './data';
    for (const dir of [dataDir, './uploads', './temp']) {
      const fs = require('fs') as typeof import('fs');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  getClient(providerId: string): MinioClient {
    if (this.clients.has(providerId)) {
      return this.clients.get(providerId)!;
    }
    const provider = this.findProvider(providerId);
    if (!provider) throw new Error(`Provider not found: ${providerId}`);

    const client = new MinioClient({
      endPoint: provider.endPoint,
      port: provider.port,
      useSSL: provider.useSSL,
      accessKey: provider.accessKey,
      secretKey: provider.secretKey,
      region: provider.region,
    });
    this.clients.set(providerId, client);
    return client;
  }

  invalidateClient(providerId: string): void {
    this.clients.delete(providerId);
  }

  listProviders(): ProviderInfo[] {
    const rows = this.database.db
      .prepare('SELECT * FROM provider_configs ORDER BY created_at ASC')
      .all() as any[];
    return rows.map(this.mapProvider);
  }

  findProvider(id: string): ProviderInfo | null {
    const row = this.database.db
      .prepare('SELECT * FROM provider_configs WHERE id = ?')
      .get(id) as any;
    return row ? this.mapProvider(row) : null;
  }

  private mapProvider = (r: any): ProviderInfo => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    endPoint: r.endpoint,
    port: r.port,
    useSSL: r.use_ssl === 1,
    accessKey: r.access_key,
    secretKey: r.secret_key,
    region: r.region,
    createdAt: r.created_at,
  });
}
