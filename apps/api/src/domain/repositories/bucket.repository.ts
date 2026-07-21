import {
  Bucket,
  BucketStats,
  CreateBucketInput,
} from '../entities/bucket.entity';
import { StorageObject, SearchResult } from '../entities/object.entity';
import {
  ProviderInfo,
  CreateProviderInput,
  ProviderCredentials,
} from '../entities/provider.entity';

export const BUCKET_REPOSITORY = Symbol('BUCKET_REPOSITORY');

export interface ProviderListError {
  providerId: string;
  providerName: string;
  error: string;
}

export interface BucketListResult {
  buckets: Bucket[];
  providerErrors: ProviderListError[];
}

export interface IBucketRepository {
  // Providers
  listProviders(): ProviderInfo[];
  getProvider(id: string): ProviderInfo | null;
  createProvider(input: CreateProviderInput): Promise<ProviderInfo>;
  updateProvider(id: string, input: Partial<CreateProviderInput>): Promise<ProviderInfo>;
  deleteProvider(id: string): boolean;

  // Buckets
  listBuckets(): Promise<BucketListResult>;
  createBucket(input: CreateBucketInput): Promise<void>;
  deleteBucket(providerId: string, name: string): Promise<void>;
  setBucketVisibility(
    providerId: string,
    name: string,
    isPublic: boolean,
  ): Promise<void>;
  setBucketLimit(
    providerId: string,
    name: string,
    maxSize: number,
  ): void;
  getPublicEndpoint(
    providerId: string,
    name: string,
  ): string | null;
  getBucketLimit(
    providerId: string,
    name: string,
  ): number | null;
  getBucketUsage(providerId: string, name: string): Promise<number>;
  getBucketStats(
    providerId: string,
    name: string,
  ): Promise<BucketStats>;
  getBucketStatsMany(
    buckets: { providerId: string; name: string }[],
  ): Promise<Record<string, { totalSize: number; totalObjects: number; limit?: number }>>;

  // Objects
  listObjects(
    providerId: string,
    bucket: string,
    prefix?: string,
  ): Promise<StorageObject[]>;
  uploadFile(
    providerId: string,
    bucket: string,
    objectName: string,
    filePath: string,
  ): Promise<void>;
  deleteObjects(
    providerId: string,
    bucket: string,
    keys: string[],
  ): Promise<void>;
  createFolder(
    providerId: string,
    bucket: string,
    folderName: string,
    prefix: string,
  ): Promise<void>;
  searchObjects(
    bucket: string,
    providerId: string,
    query: string,
  ): Promise<SearchResult[]>;
  getFileTypes(): Promise<{ type: string; count: number; size: number }[]>;

  // Streaming
  getPresignedUrl(
    providerId: string,
    bucket: string,
    key: string,
    expirySeconds?: number,
  ): Promise<string>;
  getObjectStream(
    providerId: string,
    bucket: string,
    key: string,
  ): Promise<NodeJS.ReadableStream>;
  getProviderCredentials(
    providerId: string,
  ): ProviderCredentials | null;
}
