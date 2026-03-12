import { Router, RequestHandler } from 'express';
import { CopyController } from '../controllers/copy.controller';

export function createCopyRoutes(copyController: CopyController, authMiddleware: RequestHandler): Router {
  const router = Router();

  // All copy routes require authentication
  router.use(authMiddleware);

  // Start a new copy job
  router.post('/start', (req, res) => copyController.startCopy(req, res));

  // Get copy job status
  router.get('/:jobId/status', (req, res) => copyController.getStatus(req, res));

  // Cancel a copy job
  router.post('/:jobId/cancel', (req, res) => copyController.cancelCopy(req, res));

  // List all copy jobs
  router.get('/jobs', (req, res) => copyController.listJobs(req, res));

  // Delete a copy job from history
  router.delete('/:jobId', (req, res) => copyController.deleteJob(req, res));

  return router;
}
