import { Module } from '@nestjs/common';
import { CopyService } from './copy.service';
import { CopyController } from './copy.controller';
import { CopyGateway } from './copy.gateway';

@Module({
  controllers: [CopyController],
  providers: [CopyService, CopyGateway],
  exports: [CopyService],
})
export class CopyModule {}
