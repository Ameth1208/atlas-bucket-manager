import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('activity')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  list(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.activity.list(parseInt(limit, 10), parseInt(offset, 10));
  }
}
