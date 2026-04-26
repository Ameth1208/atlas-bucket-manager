import { Router } from 'express';
import { ApiKeyController } from '../controllers/api-key.controller';

export const createApiKeyRoutes = (
  apiKeyController: ApiKeyController,
  authMiddleware: (req: any, res: any, next: any) => void
): Router => {
  const router = Router();

  router.get('/api-keys', authMiddleware, apiKeyController.list);
  router.post('/api-keys', authMiddleware, apiKeyController.create);
  router.delete('/api-keys/:id', authMiddleware, apiKeyController.revoke);

  return router;
};
