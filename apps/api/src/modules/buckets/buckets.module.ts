import { Module } from '@nestjs/common';
import { BucketsService } from './buckets.service';
import { BucketsController } from './buckets.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [BucketsController],
  providers: [BucketsService],
  exports: [BucketsService],
})
export class BucketsModule {}
