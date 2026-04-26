import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireRole } from '../middleware/auth.middleware';

export const createUserRoutes = (
  userController: UserController,
  authMiddleware: (req: any, res: any, next: any) => void
): Router => {
  const router = Router();

  router.get('/users', authMiddleware, requireRole('owner', 'admin'), userController.list);
  router.post('/users', authMiddleware, requireRole('owner', 'admin'), userController.create);
  router.put('/users/:id', authMiddleware, requireRole('owner', 'admin'), userController.update);
  router.delete('/users/:id', authMiddleware, requireRole('owner', 'admin'), userController.delete);

  return router;
};
