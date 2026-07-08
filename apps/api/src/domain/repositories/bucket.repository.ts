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

export interface IBucketRepository {
  // Providers
  listProviders(): ProviderInfo[];
  getProvider(id: string): ProviderInfo | null;
  createProvider(input: CreateProviderInput): ProviderInfo;
  deleteProvider(id: string): boolean;

  // Buckets
  listBuckets(): Promise<Bucket[]>;
  createBucket(input: CreateBucketInput): Promise<void>;
  deleteBucket(providerId: string, name: string): Promise<void>;
  setBucketVisibility(
    providerId: string,
    name: string,
    isPublic: boolean,
  ): Promise<void>;
  getBucketStats(
    providerId: string,
    name: string,
  ): Promise<BucketStats>;

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
