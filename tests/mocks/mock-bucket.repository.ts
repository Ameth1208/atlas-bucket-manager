import { IBucketRepository } from "../../src/domain/repositories/bucket.repository.interface";
import { Bucket, BucketStats } from "../../src/domain/entities/bucket.entity";
import {
  StorageObject,
  SearchResult,
} from "../../src/domain/entities/object.entity";
import { ProviderInfo } from "../../src/domain/entities/provider.entity";

export class MockBucketRepository implements IBucketRepository {
  // Provider operations
  getActiveProviders = jest.fn(() => []);

  // Bucket operations
  listBuckets = jest.fn(() => Promise.resolve([]));
  createBucket = jest.fn(() => Promise.resolve());
  deleteBucket = jest.fn(() => Promise.resolve());
  setBucketVisibility = jest.fn(() => Promise.resolve());
  getBucketStats = jest.fn(() => Promise.resolve({ size: 0, count: 0 }));

  // Object operations
  listObjects = jest.fn(() => Promise.resolve([]));
  uploadFile = jest.fn(() => Promise.resolve());
  deleteObjects = jest.fn(() => Promise.resolve());
  createFolder = jest.fn(() => Promise.resolve());
  searchObjects = jest.fn(() => Promise.resolve([]));

  // URL and streaming
  getPresignedUrl = jest.fn(() => Promise.resolve("https://example.com/url"));
  getObjectStream = jest.fn(() => Promise.resolve({}));

  // Helper to reset all mocks
  resetAllMocks() {
    jest.clearAllMocks();
  }
}
