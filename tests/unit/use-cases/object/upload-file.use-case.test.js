"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upload_file_use_case_1 = require("../../../../src/application/use-cases/object/upload-file.use-case");
const mock_bucket_repository_1 = require("../../../mocks/mock-bucket.repository");
describe('UploadFileUseCase', () => {
    let mockRepository;
    let useCase;
    beforeEach(() => {
        mockRepository = new mock_bucket_repository_1.MockBucketRepository();
        useCase = new upload_file_use_case_1.UploadFileUseCase(mockRepository);
    });
    it('should upload file successfully', async () => {
        const dto = {
            providerId: 'minio',
            bucketName: 'test-bucket',
            objectName: 'file.txt',
            filePath: '/tmp/file.txt'
        };
        mockRepository.uploadFile.mockResolvedValue();
        await useCase.execute(dto);
        expect(mockRepository.uploadFile).toHaveBeenCalledWith('minio', 'test-bucket', 'file.txt', '/tmp/file.txt');
        expect(mockRepository.uploadFile).toHaveBeenCalledTimes(1);
    });
    it('should upload file with folder prefix', async () => {
        const dto = {
            providerId: 'aws',
            bucketName: 'my-bucket',
            objectName: 'documents/report.pdf',
            filePath: '/uploads/report.pdf'
        };
        mockRepository.uploadFile.mockResolvedValue();
        await useCase.execute(dto);
        expect(mockRepository.uploadFile).toHaveBeenCalledWith('aws', 'my-bucket', 'documents/report.pdf', '/uploads/report.pdf');
    });
    it('should propagate upload errors', async () => {
        const dto = {
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
//# sourceMappingURL=upload-file.use-case.test.js.map