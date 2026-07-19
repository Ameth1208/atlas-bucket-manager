import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { ActivityService } from '../../modules/activity/activity.service';
import { AuthUser } from '../decorators/current-user.decorator';

const LOGGABLE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLoggingInterceptor.name);

  constructor(private readonly activity: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: AuthUser }>();
    if (!LOGGABLE_METHODS.has(req.method)) return next.handle();

    const startedAt = Date.now();
    return next.handle().pipe(
      tap({
        next: () => this.maybeLog(req, context, startedAt),
        error: (err) => {
          // Log failures too, with a status code for the audit trail.
          this.maybeLog(req, context, startedAt, err?.status ?? 500);
        },
      }),
    );
  }

  private maybeLog(
    req: Request & { user?: AuthUser },
    context: ExecutionContext,
    startedAt: number,
    statusCode?: number,
  ): void {
    const user = req.user;
    if (!user?.email) return; // anonymous requests — skip
    const ctrlPath = context.getClass()?.name ?? 'Unknown';
    const handlerName = context.getHandler()?.name ?? 'unknown';
    // Skip controllers that already log explicitly (they pass `actor` in).
    const selfLogged = new Set([
      'ProvidersController',
      'BucketsController',
      'ObjectsController',
      'UsersController',
      'CopyController',
      'ApiKeysController',
      'InvitesController',
      'IntegrationsController',
    ]);
    if (selfLogged.has(ctrlPath)) return;

    const route = (req as any).route?.path ?? req.path;
    const bucket = (req.body as any)?.name ?? (req.params as any)?.name;
    const provider = (req.body as any)?.providerId ?? (req.params as any)?.providerId;
    const target = typeof bucket === 'string' ? bucket : `${req.method} ${route}`;

    try {
      this.activity.log({
        actor: user.email,
        action: handlerName,
        target,
        bucket: typeof bucket === 'string' ? bucket : undefined,
        provider: typeof provider === 'string' ? provider : undefined,
        ip: req.ip,
        statusCode,
      });
    } catch (err: any) {
      this.logger.warn(`Activity log failed: ${err.message}`);
    }
  }
}
