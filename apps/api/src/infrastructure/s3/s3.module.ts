import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { DatabaseService } from '../database/database.service';
import { BUCKET_REPOSITORY } from '../../domain/repositories/bucket.repository';
import { S3BucketRepository } from './s3-bucket.repository';

@Global()
@Module({
  providers: [
    S3Service,
    {
      provide: BUCKET_REPOSITORY,
      useFactory: (s3: S3Service, database: DatabaseService) =>
        new S3BucketRepository(s3, database),
      inject: [S3Service, DatabaseService],
    },
  ],
  exports: [S3Service, BUCKET_REPOSITORY],
})
export class S3Module {}
