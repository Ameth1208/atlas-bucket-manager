import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class CreateFolderUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, folderPath: string): Promise<void> {
    if (!folderPath) {
      throw new Error('Folder path is required');
    }

    await this.bucketRepository.createFolder(providerId, bucketName, folderPath);
  }
}
