import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { UploadFileDto } from '../../dtos/upload-file.dto';

export class UploadFileUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(dto: UploadFileDto): Promise<void> {
    await this.bucketRepository.uploadFile(
      dto.providerId,
      dto.bucketName,
      dto.objectName,
      dto.filePath
    );
  }
}
