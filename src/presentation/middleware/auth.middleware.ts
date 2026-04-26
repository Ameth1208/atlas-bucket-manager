import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IApiKeyRepository } from '../../domain/repositories/api-key.repository.interface';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  apiKeyId?: string;
  scopes?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const createAuthMiddleware = (
  jwtSecret: string,
  apiKeyRepository: IApiKeyRepository,
  activityRepository?: IActivityRepository
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Try Bearer API key
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer atl_')) {
      const rawKey = authHeader.substring(7);
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const keyRecord = apiKeyRepository.findByHash(keyHash);

      if (keyRecord && !keyRecord.revokedAt) {
        apiKeyRepository.updateLastUsed(keyRecord.id);
        req.user = {
          userId: keyRecord.userId,
          email: 'apikey',
          role: 'apikey',
          apiKeyId: keyRecord.id,
          scopes: keyRecord.scopes,
        };
        next();
        return;
      }

      res.status(401).json({ error: 'Invalid or revoked API key' });
      return;
    }

    // 2. Try JWT cookie
    const token = req.cookies?.auth_token;
    if (!token) {
      if (req.originalUrl.startsWith('/api')) {
        res.status(401).json({ error: 'Unauthorized' });
      } else {
        res.redirect('/login');
      }
      return;
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as UserPayload;
      req.user = payload;
      next();
    } catch {
      if (req.originalUrl.startsWith('/api')) {
        res.status(401).json({ error: 'Invalid token' });
      } else {
        res.redirect('/login');
      }
    }
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
};

export const requireScope = (scope: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Web users (JWT) have all scopes
    if (req.user.role !== 'apikey') {
      next();
      return;
    }
    // API key users must have the required scope
    const scopes = (req.user.scopes || '').split(',').map(s => s.trim());
    if (!scopes.includes(scope)) {
      res.status(403).json({ error: `API key missing scope: ${scope}` });
      return;
    }
    next();
  };
};
