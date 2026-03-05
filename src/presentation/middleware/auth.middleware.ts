import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  user: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const createAuthMiddleware = (jwtSecret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      if (req.originalUrl.startsWith('/api')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      } else {
        res.redirect('/login');
        return;
      }
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as UserPayload;
      req.user = payload;
      next();
    } catch (err) {
      if (req.originalUrl.startsWith('/api')) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      } else {
        res.redirect('/login');
        return;
      }
    }
  };
};
