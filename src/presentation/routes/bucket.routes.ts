import { Router } from 'express';
import { BucketController } from '../controllers/bucket.controller';

export const createBucketRoutes = (bucketController: BucketController, authMiddleware: any) => {
  const router = Router();

  router.get('/providers', authMiddleware, bucketController.getProviders);
  router.get('/buckets', authMiddleware, bucketController.listBuckets);
  router.get('/buckets/:providerId/:name/stats', authMiddleware, bucketController.getStats);
  router.post('/buckets', authMiddleware, bucketController.createBucket);
  router.put('/buckets/:providerId/:name/policy', authMiddleware, bucketController.updatePolicy);
  router.delete('/buckets/:providerId/:name', authMiddleware, bucketController.deleteBucket);

  return router;
};
