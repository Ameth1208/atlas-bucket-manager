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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('action') action?: string,
    @Query('actions') actions?: string,
    @Query('actor') actor?: string,
    @Query('bucket') bucket?: string,
    @Query('provider') provider?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activity.list({
      limit,
      offset,
      action,
      actions,
      actor,
      bucket,
      provider,
      from,
      to,
    });
  }
}
