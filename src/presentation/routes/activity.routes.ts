import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';

export const createActivityRoutes = (
  activityController: ActivityController,
  authMiddleware: (req: any, res: any, next: any) => void
): Router => {
  const router = Router();

  router.get('/activity', authMiddleware, activityController.list);

  return router;
};
