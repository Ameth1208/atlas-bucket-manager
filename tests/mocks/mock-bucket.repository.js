"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBucketRepository = void 0;
class MockBucketRepository {
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
exports.MockBucketRepository = MockBucketRepository;
//# sourceMappingURL=mock-bucket.repository.js.map