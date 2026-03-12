import { Bucket, BucketStats } from '../entities/bucket.entity';
import { StorageObject, SearchResult } from '../entities/object.entity';
import { ProviderInfo } from '../entities/provider.entity';

export interface IBucketRepository {
  // Provider operations
  getActiveProviders(): ProviderInfo[];

  // Bucket operations
  listBuckets(): Promise<Bucket[]>;
  createBucket(providerId: string, bucketName: string): Promise<void>;
  deleteBucket(providerId: string, bucketName: string): Promise<void>;
  setBucketVisibility(providerId: string, bucketName: string, isPublic: boolean): Promise<void>;
  getBucketStats(providerId: string, bucketName: string): Promise<BucketStats>;

  // Object operations
  listObjects(providerId: string, bucketName: string, prefix?: string): Promise<StorageObject[]>;
  uploadFile(providerId: string, bucketName: string, objectName: string, filePath: string): Promise<void>;
  deleteObjects(providerId: string, bucketName: string, objectNames: string[]): Promise<void>;
  createFolder(providerId: string, bucketName: string, folderPath: string): Promise<void>;
  searchObjects(query: string): Promise<SearchResult[]>;
  
  // URL and streaming
  getPresignedUrl(providerId: string, bucketName: string, objectName: string, expiry?: number): Promise<string>;
  getObjectStream(providerId: string, bucketName: string, objectName: string): Promise<any>;
  
  // Copy operations
  objectExists(providerId: string, bucketName: string, objectName: string): Promise<boolean>;
  uploadStream(providerId: string, bucketName: string, objectName: string, stream: any, size: number): Promise<void>;
}
