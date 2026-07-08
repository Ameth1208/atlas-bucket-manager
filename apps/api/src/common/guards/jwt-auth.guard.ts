import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { API_KEY_REPOSITORY } from '../../domain/repositories/api-key.repository';
import { Inject } from '@nestjs/common';
import { IApiKeyRepository } from '../../domain/repositories/api-key.repository';
import * as crypto from 'crypto';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(API_KEY_REPOSITORY)
    private readonly apiKeyRepo: IApiKeyRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // 1. Try Bearer API key
    if (authHeader?.startsWith('Bearer atl_')) {
      const rawKey = authHeader.substring(7);
      const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const key = this.apiKeyRepo.findByHash(hash);
      if (key && !key.revokedAt) {
        this.apiKeyRepo.updateLastUsed(key.id);
        (request as any).user = {
          userId: key.userId,
          email: 'apikey',
          role: 'apikey',
          apiKeyId: key.id,
          scopes: key.scopes,
        } satisfies AuthUser;
        return true;
      }
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    // 2. Try JWT cookie
    const token = (request as any).cookies?.auth_token;
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(token, {
        secret: this.config.get<string>('jwtSecret'),
      });
      (request as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
