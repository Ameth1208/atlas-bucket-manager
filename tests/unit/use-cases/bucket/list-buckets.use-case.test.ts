import { ListBucketsUseCase } from '../../../../src/application/use-cases/bucket/list-buckets.use-case';
import { MockBucketRepository } from '../../../mocks/mock-bucket.repository';
import { Bucket } from '../../../../src/domain/entities/bucket.entity';

describe('ListBucketsUseCase', () => {
  let mockRepository: MockBucketRepository;
  let useCase: ListBucketsUseCase;

  beforeEach(() => {
    mockRepository = new MockBucketRepository();
    useCase = new ListBucketsUseCase(mockRepository);
  });

  it('should return list of buckets from repository', async () => {
    const mockBuckets: Bucket[] = [
      {
        name: 'bucket-1',
        providerId: 'minio',
        providerName: 'MinIO',
        creationDate: new Date('2024-01-01'),
        isPublic: false
      },
      {
        name: 'bucket-2',
        providerId: 'aws',
        providerName: 'AWS S3',
        creationDate: new Date('2024-01-02'),
        isPublic: true
      }
    ];

    mockRepository.listBuckets.mockResolvedValue(mockBuckets);

    const result = await useCase.execute();

    expect(result).toEqual(mockBuckets);
    expect(mockRepository.listBuckets).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no buckets exist', async () => {
    mockRepository.listBuckets.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRepository.listBuckets).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Failed to connect to S3');
    mockRepository.listBuckets.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow('Failed to connect to S3');
  });
});
