import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, UsersPublicController } from './users.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [UsersController, UsersPublicController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
