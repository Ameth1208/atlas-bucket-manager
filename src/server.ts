import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';

// Ensure directories exist
['uploads/', 'temp/', 'data/'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Config & DB
import { appConfig } from './infrastructure/config/app.config';
import { getDatabase } from './infrastructure/database/database';

// Initialize DB eagerly
getDatabase();

// Repositories
import { S3BucketRepository } from './infrastructure/repositories/s3-bucket.repository';
import { SqliteUserRepository } from './infrastructure/repositories/sqlite-user.repository';
import { SqliteApiKeyRepository } from './infrastructure/repositories/sqlite-api-key.repository';
import { SqliteActivityRepository } from './infrastructure/repositories/sqlite-activity.repository';

// Use Cases - Bucket
import { GetProvidersUseCase } from './application/use-cases/bucket/get-providers.use-case';
import { ListBucketsUseCase } from './application/use-cases/bucket/list-buckets.use-case';
import { CreateBucketUseCase } from './application/use-cases/bucket/create-bucket.use-case';
import { DeleteBucketUseCase } from './application/use-cases/bucket/delete-bucket.use-case';
import { UpdateBucketPolicyUseCase } from './application/use-cases/bucket/update-bucket-policy.use-case';
import { GetBucketStatsUseCase } from './application/use-cases/bucket/get-bucket-stats.use-case';
import { CreateProviderUseCase } from './application/use-cases/bucket/create-provider.use-case';

// Use Cases - Object
import { ListObjectsUseCase } from './application/use-cases/object/list-objects.use-case';
import { UploadFileUseCase } from './application/use-cases/object/upload-file.use-case';
import { DeleteObjectsUseCase } from './application/use-cases/object/delete-objects.use-case';
import { CreateFolderUseCase } from './application/use-cases/object/create-folder.use-case';
import { SearchObjectsUseCase } from './application/use-cases/object/search-objects.use-case';
import { GetPresignedUrlUseCase } from './application/use-cases/object/get-presigned-url.use-case';
import { GetObjectStreamUseCase } from './application/use-cases/object/get-object-stream.use-case';

// Use Cases - Auth / Users / API Keys / Activity
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { SetupUseCase } from './application/use-cases/auth/setup.use-case';
import { ListUsersUseCase } from './application/use-cases/users/list-users.use-case';
import { CreateUserUseCase } from './application/use-cases/users/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/users/delete-user.use-case';
import { CreateApiKeyUseCase } from './application/use-cases/api-keys/create-api-key.use-case';
import { ListApiKeysUseCase } from './application/use-cases/api-keys/list-api-keys.use-case';
import { RevokeApiKeyUseCase } from './application/use-cases/api-keys/revoke-api-key.use-case';
import { LogActivityUseCase } from './application/use-cases/activity/log-activity.use-case';
import { ListActivityUseCase } from './application/use-cases/activity/list-activity.use-case';

// Copy Infrastructure
import { CopyJobStore } from './infrastructure/copy/copy-job-store';
import { CopyManager } from './infrastructure/copy/copy-manager';
import { SocketManager } from './infrastructure/websocket/socket-manager';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { BucketController } from './presentation/controllers/bucket.controller';
import { ObjectController } from './presentation/controllers/object.controller';
import { CopyController } from './presentation/controllers/copy.controller';
import { UserController } from './presentation/controllers/user.controller';
import { ApiKeyController } from './presentation/controllers/api-key.controller';
import { ActivityController } from './presentation/controllers/activity.controller';

// Middleware & Routes
import { createAuthMiddleware } from './presentation/middleware/auth.middleware';
import { errorHandler } from './presentation/middleware/error-handler.middleware';
import { createAuthRoutes } from './presentation/routes/auth.routes';
import { createBucketRoutes } from './presentation/routes/bucket.routes';
import { createObjectRoutes } from './presentation/routes/object.routes';
import { createCopyRoutes } from './presentation/routes/copy.routes';
import { createUserRoutes } from './presentation/routes/user.routes';
import { createApiKeyRoutes } from './presentation/routes/api-key.routes';
import { createActivityRoutes } from './presentation/routes/activity.routes';
import { createUiRoutes } from './presentation/routes/ui.routes';

// ─── Load providers from environment (seed if DB empty) ────────────────────
import { Provider } from './domain/entities/provider.entity';
const { getDatabase: db } = require('./infrastructure/database/database');

function loadProvidersFromEnv(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY) {
    providers.push({
      id: 'minio',
      name: process.env.MINIO_NAME || 'MinIO',
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      region: process.env.MINIO_REGION || 'us-east-1',
    });
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    providers.push({
      id: 'aws',
      name: 'AWS S3',
      endPoint: process.env.AWS_S3_ENDPOINT || 's3.amazonaws.com',
      port: parseInt(process.env.AWS_S3_PORT || '443'),
      useSSL: process.env.AWS_S3_USE_SSL !== 'false',
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return providers;
}

function loadProvidersFromDb(): Provider[] {
  const rows = db().prepare('SELECT * FROM provider_configs').all() as any[];
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    endPoint: r.endpoint,
    port: r.port,
    useSSL: r.use_ssl === 1,
    accessKey: r.access_key,
    secretKey: r.secret_key,
    region: r.region,
  }));
}

const dbProviders = loadProvidersFromDb();
const initialProviders = dbProviders.length > 0 ? dbProviders : loadProvidersFromEnv();

// ─── DI Wiring ─────────────────────────────────────────────────────────────

const userRepository = new SqliteUserRepository();
const apiKeyRepository = new SqliteApiKeyRepository();
const activityRepository = new SqliteActivityRepository();
const bucketRepository = new S3BucketRepository(initialProviders);

// Use Cases
const setupUseCase = new SetupUseCase(userRepository, appConfig.jwtSecret);
const loginUseCase = new LoginUseCase(userRepository, appConfig.jwtSecret);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const createApiKeyUseCase = new CreateApiKeyUseCase(apiKeyRepository);
const listApiKeysUseCase = new ListApiKeysUseCase(apiKeyRepository);
const revokeApiKeyUseCase = new RevokeApiKeyUseCase(apiKeyRepository);
const logActivityUseCase = new LogActivityUseCase(activityRepository);
const listActivityUseCase = new ListActivityUseCase(activityRepository);

const getProvidersUseCase = new GetProvidersUseCase(bucketRepository);
const createProviderUseCase = new CreateProviderUseCase(bucketRepository);
const listBucketsUseCase = new ListBucketsUseCase(bucketRepository);
const createBucketUseCase = new CreateBucketUseCase(bucketRepository);
const deleteBucketUseCase = new DeleteBucketUseCase(bucketRepository);
const updateBucketPolicyUseCase = new UpdateBucketPolicyUseCase(bucketRepository);
const getBucketStatsUseCase = new GetBucketStatsUseCase(bucketRepository);

const listObjectsUseCase = new ListObjectsUseCase(bucketRepository);
const uploadFileUseCase = new UploadFileUseCase(bucketRepository);
const deleteObjectsUseCase = new DeleteObjectsUseCase(bucketRepository);
const createFolderUseCase = new CreateFolderUseCase(bucketRepository);
const searchObjectsUseCase = new SearchObjectsUseCase(bucketRepository);
const getPresignedUrlUseCase = new GetPresignedUrlUseCase(bucketRepository);
const getObjectStreamUseCase = new GetObjectStreamUseCase(bucketRepository);

const copyJobStore = new CopyJobStore();
const copyManager = new CopyManager(copyJobStore, bucketRepository);

// ─── Express Setup ─────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);
const socketManager = new SocketManager(httpServer);

// Copy events → Socket.io
copyManager.on('job-progress', job => socketManager.emitCopyProgress(job));
copyManager.on('job-completed', job => {
  if (job.status === 'completed') socketManager.emitCopyCompleted(job);
  else if (job.status === 'failed') socketManager.emitCopyFailed(job);
  else if (job.status === 'cancelled') socketManager.emitCopyCancelled(job);
});

// Controllers
const authController = new AuthController(loginUseCase, setupUseCase, userRepository);
const bucketController = new BucketController(
  getProvidersUseCase, listBucketsUseCase, createBucketUseCase,
  deleteBucketUseCase, updateBucketPolicyUseCase, getBucketStatsUseCase,
  createProviderUseCase
);
const copyController = new CopyController(
  new (require('./application/use-cases/copy/start-copy.use-case').StartCopyUseCase)(copyManager),
  new (require('./application/use-cases/copy/get-copy-status.use-case').GetCopyStatusUseCase)(copyManager),
  new (require('./application/use-cases/copy/cancel-copy.use-case').CancelCopyUseCase)(copyManager),
  new (require('./application/use-cases/copy/list-copy-jobs.use-case').ListCopyJobsUseCase)(copyManager),
  new (require('./application/use-cases/copy/delete-copy-job.use-case').DeleteCopyJobUseCase)(copyManager)
);
const objectController = new ObjectController(
  listObjectsUseCase, uploadFileUseCase, deleteObjectsUseCase, createFolderUseCase,
  searchObjectsUseCase, getPresignedUrlUseCase, getObjectStreamUseCase, getBucketStatsUseCase,
  socketManager
);
const userController = new UserController(listUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase);
const apiKeyController = new ApiKeyController(createApiKeyUseCase, listApiKeysUseCase, revokeApiKeyUseCase);
const activityController = new ActivityController(listActivityUseCase);

// Middleware
const authMiddleware = createAuthMiddleware(appConfig.jwtSecret, apiKeyRepository);

app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', createAuthRoutes(authController, authMiddleware));
app.use('/api', createBucketRoutes(bucketController, authMiddleware));
app.use('/api', createObjectRoutes(objectController, authMiddleware));
app.use('/api/copy', createCopyRoutes(copyController, authMiddleware));
app.use('/api', createUserRoutes(userController, authMiddleware));
app.use('/api', createApiKeyRoutes(apiKeyController, authMiddleware));
app.use('/api', createActivityRoutes(activityController, authMiddleware));

// Static UI (legacy — only served when Next.js is NOT running)
if (process.env.SERVE_STATIC !== 'false') {
  const staticDir = process.env.NODE_ENV !== 'production'
    ? path.join(__dirname, '../public')
    : path.join(__dirname, '../dist-frontend');
  app.use(express.static(staticDir));
  app.use('/', createUiRoutes(authMiddleware));
}

app.use(errorHandler);

httpServer.listen(appConfig.port, () => {
  console.log(`🚀 Atlas API running at http://localhost:${appConfig.port}`);
  console.log(`🔌 WebSocket enabled`);
  console.log(`🗄️  Database: ${process.env.DB_PATH || './data'}/atlas.db`);
});
