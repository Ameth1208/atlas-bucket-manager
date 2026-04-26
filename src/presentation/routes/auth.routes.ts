import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRoutes = (
  authController: AuthController,
  authMiddleware: (req: any, res: any, next: any) => void
): Router => {
  const router = Router();

  router.get('/auth/status', authController.status);
  router.post('/auth/setup', authController.setup);
  router.post('/auth/login', authController.login);
  router.post('/auth/logout', authController.logout);
  router.get('/auth/me', authMiddleware, authController.me);

  return router;
};
