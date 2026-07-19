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
    @Query('action') action?: string,
    @Query('actor') actor?: string,
    @Query('bucket') bucket?: string,
    @Query('provider') provider?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activity.list(parseInt(limit, 10), parseInt(offset, 10), {
      action,
      actor,
      bucket,
      provider,
      from: from ? parseInt(from, 10) : undefined,
      to: to ? parseInt(to, 10) : undefined,
    });
  }
}
