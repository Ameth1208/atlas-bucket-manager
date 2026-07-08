import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        // simple sqlite ping
        this.database.db.prepare('SELECT 1').get();
        return { database: { status: 'up' } };
      },
    ]);
  }
}
