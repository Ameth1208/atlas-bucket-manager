import { UploadFileUseCase } from '../../../../src/application/use-cases/object/upload-file.use-case';
import { MockBucketRepository } from '../../../mocks/mock-bucket.repository';
import { UploadFileDto } from '../../../../src/application/dtos/upload-file.dto';

describe('UploadFileUseCase', () => {
  let mockRepository: MockBucketRepository;
  let useCase: UploadFileUseCase;

  beforeEach(() => {
    mockRepository = new MockBucketRepository();
    useCase = new UploadFileUseCase(mockRepository);
  });

  it('should upload file successfully', async () => {
    const dto: UploadFileDto = {
      providerId: 'minio',
      bucketName: 'test-bucket',
      objectName: 'file.txt',
      filePath: '/tmp/file.txt'
    };

    mockRepository.uploadFile.mockResolvedValue();

    await useCase.execute(dto);

    expect(mockRepository.uploadFile).toHaveBeenCalledWith(
      'minio',
      'test-bucket',
      'file.txt',
      '/tmp/file.txt'
    );
    expect(mockRepository.uploadFile).toHaveBeenCalledTimes(1);
  });

  it('should upload file with folder prefix', async () => {
    const dto: UploadFileDto = {
      providerId: 'aws',
      bucketName: 'my-bucket',
      objectName: 'documents/report.pdf',
      filePath: '/uploads/report.pdf'
    };

    mockRepository.uploadFile.mockResolvedValue();

    await useCase.execute(dto);

    expect(mockRepository.uploadFile).toHaveBeenCalledWith(
      'aws',
      'my-bucket',
      'documents/report.pdf',
      '/uploads/report.pdf'
    );
  });

  it('should propagate upload errors', async () => {
    const dto: UploadFileDto = {
      providerId: 'minio',
      bucketName: 'test-bucket',
      objectName: 'file.txt',
      filePath: '/tmp/file.txt'
    };

    const error = new Error('Upload failed: disk full');
    mockRepository.uploadFile.mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toThrow('Upload failed: disk full');
  });
});
