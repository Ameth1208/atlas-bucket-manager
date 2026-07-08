import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { BUCKET_REPOSITORY } from '../../domain/repositories/bucket.repository';
import { S3BucketRepository } from './s3-bucket.repository';

@Global()
@Module({
  providers: [
    S3Service,
    { provide: BUCKET_REPOSITORY, useClass: S3BucketRepository },
  ],
  exports: [S3Service, BUCKET_REPOSITORY],
})
export class S3Module {}
