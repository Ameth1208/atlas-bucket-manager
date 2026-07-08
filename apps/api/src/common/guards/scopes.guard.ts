import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SCOPES_KEY = 'scopes';
import { SetMetadata } from '@nestjs/common';
export const RequireScope = (scope: string) => SetMetadata(SCOPES_KEY, scope);

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Unauthorized');

    // Web (JWT) users have all scopes
    if (user.role !== 'apikey') return true;

    const scopes = (user.scopes ?? '').split(',').map((s: string) => s.trim());
    if (!scopes.includes(required)) {
      throw new ForbiddenException(`API key missing scope: ${required}`);
    }
    return true;
  }
}
