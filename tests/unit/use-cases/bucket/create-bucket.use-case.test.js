"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_bucket_use_case_1 = require("../../../../src/application/use-cases/bucket/create-bucket.use-case");
const mock_bucket_repository_1 = require("../../../mocks/mock-bucket.repository");
describe('CreateBucketUseCase', () => {
    let mockRepository;
    let useCase;
    beforeEach(() => {
        mockRepository = new mock_bucket_repository_1.MockBucketRepository();
        useCase = new create_bucket_use_case_1.CreateBucketUseCase(mockRepository);
    });
    afterEach(() => {
        mockRepository.resetAllMocks();
    });
    describe('Validation', () => {
        it('should throw error if providerId is missing', async () => {
            await expect(useCase.execute({ providerId: '', name: 'valid-bucket' })).rejects.toThrow('Provider ID and bucket name are required');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name is missing', async () => {
            await expect(useCase.execute({ providerId: 'minio', name: '' })).rejects.toThrow('Provider ID and bucket name are required');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name is too short', async () => {
            await expect(useCase.execute({ providerId: 'minio', name: 'ab' })).rejects.toThrow('Bucket name must be between 3 and 63 characters');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name is too long', async () => {
            const longName = 'a'.repeat(64);
            await expect(useCase.execute({ providerId: 'minio', name: longName })).rejects.toThrow('Bucket name must be between 3 and 63 characters');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name has invalid characters', async () => {
            await expect(useCase.execute({ providerId: 'minio', name: 'Invalid_Bucket!' })).rejects.toThrow('Bucket name must follow S3 naming conventions');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name starts with hyphen', async () => {
            await expect(useCase.execute({ providerId: 'minio', name: '-invalid' })).rejects.toThrow('Bucket name must follow S3 naming conventions');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
        it('should throw error if bucket name ends with hyphen', async () => {
            await expect(useCase.execute({ providerId: 'minio', name: 'invalid-' })).rejects.toThrow('Bucket name must follow S3 naming conventions');
            expect(mockRepository.createBucket).not.toHaveBeenCalled();
        });
    });
    describe('Success Cases', () => {
        it('should create bucket with valid name', async () => {
            mockRepository.createBucket.mockResolvedValue();
            await useCase.execute({ providerId: 'minio', name: 'valid-bucket' });
            expect(mockRepository.createBucket).toHaveBeenCalledWith('minio', 'valid-bucket');
            expect(mockRepository.createBucket).toHaveBeenCalledTimes(1);
        });
        it('should create bucket with dots in name', async () => {
            mockRepository.createBucket.mockResolvedValue();
            await useCase.execute({ providerId: 'aws', name: 'my.bucket.name' });
            expect(mockRepository.createBucket).toHaveBeenCalledWith('aws', 'my.bucket.name');
        });
        it('should create bucket with numbers', async () => {
            mockRepository.createBucket.mockResolvedValue();
            await useCase.execute({ providerId: 'minio', name: 'bucket123' });
            expect(mockRepository.createBucket).toHaveBeenCalledWith('minio', 'bucket123');
        });
        it('should create bucket with maximum valid length', async () => {
            mockRepository.createBucket.mockResolvedValue();
            const validLongName = 'a'.repeat(63);
            await useCase.execute({ providerId: 'minio', name: validLongName });
            expect(mockRepository.createBucket).toHaveBeenCalledWith('minio', validLongName);
        });
    });
    describe('Error Handling', () => {
        it('should propagate repository errors', async () => {
            const error = new Error('S3 connection failed');
            mockRepository.createBucket.mockRejectedValue(error);
            await expect(useCase.execute({ providerId: 'minio', name: 'test-bucket' })).rejects.toThrow('S3 connection failed');
            expect(mockRepository.createBucket).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=create-bucket.use-case.test.js.map