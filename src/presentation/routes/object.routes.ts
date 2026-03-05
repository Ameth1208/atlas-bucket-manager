import { Router } from 'express';
import multer from 'multer';
import { ObjectController } from '../controllers/object.controller';

const upload = multer({ dest: 'uploads/' });

export const createObjectRoutes = (objectController: ObjectController, authMiddleware: any) => {
  const router = Router();

  router.get('/buckets/:providerId/:name/objects', authMiddleware, objectController.listObjects);
  router.get('/buckets/:providerId/:name/stats', authMiddleware, objectController.getStats);
  router.get('/buckets/:providerId/:name/objects/:objectName/url', authMiddleware, objectController.getUrl);
  router.post('/buckets/:providerId/:name/upload', authMiddleware, upload.array('files'), objectController.upload);
  router.post('/buckets/:providerId/:name/folder', authMiddleware, objectController.createFolder);
  router.delete('/buckets/:providerId/:name/objects', authMiddleware, objectController.deleteObjects);
  router.get('/view/:providerId/:bucket', authMiddleware, objectController.view);
  router.get('/search', authMiddleware, objectController.search);

  return router;
};
