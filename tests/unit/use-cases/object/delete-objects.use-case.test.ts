import { DeleteObjectsUseCase } from '../../../../src/application/use-cases/object/delete-objects.use-case';
import { MockBucketRepository } from '../../../mocks/mock-bucket.repository';

describe('DeleteObjectsUseCase', () => {
  let mockRepository: MockBucketRepository;
  let useCase: DeleteObjectsUseCase;

  beforeEach(() => {
    mockRepository = new MockBucketRepository();
    useCase = new DeleteObjectsUseCase(mockRepository);
  });

  describe('Validation', () => {
    it('should throw error if objectNames is not an array', async () => {
      await expect(
        useCase.execute('minio', 'test-bucket', 'not-an-array' as any)
      ).rejects.toThrow('Object names must be a non-empty array');

      expect(mockRepository.deleteObjects).not.toHaveBeenCalled();
    });

    it('should throw error if objectNames is empty array', async () => {
      await expect(
        useCase.execute('minio', 'test-bucket', [])
      ).rejects.toThrow('Object names must be a non-empty array');

      expect(mockRepository.deleteObjects).not.toHaveBeenCalled();
    });
  });

  describe('Success Cases', () => {
    it('should delete single object', async () => {
      mockRepository.deleteObjects.mockResolvedValue();

      await useCase.execute('minio', 'test-bucket', ['file.txt']);

      expect(mockRepository.deleteObjects).toHaveBeenCalledWith(
        'minio',
        'test-bucket',
        ['file.txt']
      );
      expect(mockRepository.deleteObjects).toHaveBeenCalledTimes(1);
    });

    it('should delete multiple objects', async () => {
      mockRepository.deleteObjects.mockResolvedValue();

      const objectNames = ['file1.txt', 'file2.jpg', 'folder/file3.pdf'];

      await useCase.execute('aws', 'my-bucket', objectNames);

      expect(mockRepository.deleteObjects).toHaveBeenCalledWith(
        'aws',
        'my-bucket',
        objectNames
      );
    });

    it('should handle objects with special characters', async () => {
      mockRepository.deleteObjects.mockResolvedValue();

      const objectNames = ['file with spaces.txt', 'спецсимволы.doc'];

      await useCase.execute('minio', 'test-bucket', objectNames);

      expect(mockRepository.deleteObjects).toHaveBeenCalledWith(
        'minio',
        'test-bucket',
        objectNames
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Permission denied');
      mockRepository.deleteObjects.mockRejectedValue(error);

      await expect(
        useCase.execute('minio', 'test-bucket', ['file.txt'])
      ).rejects.toThrow('Permission denied');
    });
  });
});
