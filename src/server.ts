import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

// Configuration
import { appConfig } from "./infrastructure/config/app.config";

// Repository
import { S3BucketRepository } from "./infrastructure/repositories/s3-bucket.repository";

// Use Cases - Bucket
import { GetProvidersUseCase } from "./application/use-cases/bucket/get-providers.use-case";
import { ListBucketsUseCase } from "./application/use-cases/bucket/list-buckets.use-case";
import { CreateBucketUseCase } from "./application/use-cases/bucket/create-bucket.use-case";
import { DeleteBucketUseCase } from "./application/use-cases/bucket/delete-bucket.use-case";
import { UpdateBucketPolicyUseCase } from "./application/use-cases/bucket/update-bucket-policy.use-case";
import { GetBucketStatsUseCase } from "./application/use-cases/bucket/get-bucket-stats.use-case";

// Use Cases - Object
import { ListObjectsUseCase } from "./application/use-cases/object/list-objects.use-case";
import { UploadFileUseCase } from "./application/use-cases/object/upload-file.use-case";
import { DeleteObjectsUseCase } from "./application/use-cases/object/delete-objects.use-case";
import { CreateFolderUseCase } from "./application/use-cases/object/create-folder.use-case";
import { SearchObjectsUseCase } from "./application/use-cases/object/search-objects.use-case";
import { GetPresignedUrlUseCase } from "./application/use-cases/object/get-presigned-url.use-case";
import { GetObjectStreamUseCase } from "./application/use-cases/object/get-object-stream.use-case";

// Use Cases - Auth
import { LoginUseCase } from "./application/use-cases/auth/login.use-case";

// Controllers
import { AuthController } from "./presentation/controllers/auth.controller";
import { BucketController } from "./presentation/controllers/bucket.controller";
import { ObjectController } from "./presentation/controllers/object.controller";

// Middleware
import { createAuthMiddleware } from "./presentation/middleware/auth.middleware";
import { errorHandler } from "./presentation/middleware/error-handler.middleware";

// Routes
import { createAuthRoutes } from "./presentation/routes/auth.routes";
import { createBucketRoutes } from "./presentation/routes/bucket.routes";
import { createObjectRoutes } from "./presentation/routes/object.routes";
import { createUiRoutes } from "./presentation/routes/ui.routes";

// ============================================
// Dependency Injection Setup
// ============================================

// 1. Initialize Repository
const bucketRepository = new S3BucketRepository(appConfig.providers);

// 2. Initialize Use Cases - Bucket
const getProvidersUseCase = new GetProvidersUseCase(bucketRepository);
const listBucketsUseCase = new ListBucketsUseCase(bucketRepository);
const createBucketUseCase = new CreateBucketUseCase(bucketRepository);
const deleteBucketUseCase = new DeleteBucketUseCase(bucketRepository);
const updateBucketPolicyUseCase = new UpdateBucketPolicyUseCase(bucketRepository);
const getBucketStatsUseCase = new GetBucketStatsUseCase(bucketRepository);

// 3. Initialize Use Cases - Object
const listObjectsUseCase = new ListObjectsUseCase(bucketRepository);
const uploadFileUseCase = new UploadFileUseCase(bucketRepository);
const deleteObjectsUseCase = new DeleteObjectsUseCase(bucketRepository);
const createFolderUseCase = new CreateFolderUseCase(bucketRepository);
const searchObjectsUseCase = new SearchObjectsUseCase(bucketRepository);
const getPresignedUrlUseCase = new GetPresignedUrlUseCase(bucketRepository);
const getObjectStreamUseCase = new GetObjectStreamUseCase(bucketRepository);

// 4. Initialize Use Cases - Auth
const loginUseCase = new LoginUseCase(
  appConfig.adminUser as string,
  appConfig.adminPass as string,
  appConfig.jwtSecret as string
);

// 5. Initialize Controllers
const authController = new AuthController(loginUseCase);
const bucketController = new BucketController(
  getProvidersUseCase,
  listBucketsUseCase,
  createBucketUseCase,
  deleteBucketUseCase,
  updateBucketPolicyUseCase,
  getBucketStatsUseCase
);
const objectController = new ObjectController(
  listObjectsUseCase,
  uploadFileUseCase,
  deleteObjectsUseCase,
  createFolderUseCase,
  searchObjectsUseCase,
  getPresignedUrlUseCase,
  getObjectStreamUseCase,
  getBucketStatsUseCase
);

// 6. Initialize Middleware
const authMiddleware = createAuthMiddleware(appConfig.jwtSecret as string);

// 7. Initialize Routes
const authRoutes = createAuthRoutes(authController);
const bucketRoutes = createBucketRoutes(bucketController, authMiddleware);
const objectRoutes = createObjectRoutes(objectController, authMiddleware);
const uiRoutes = createUiRoutes(authMiddleware);

// ============================================
// Express Application Setup
// ============================================

const app = express();

// Ensure upload directory exists
if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

// Determine static files directory based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const staticDir = isDevelopment 
  ? path.join(__dirname, "../public")           // Dev: serve from public/
  : path.join(__dirname, "../dist-frontend");   // Prod: serve from dist-frontend/

console.log(`📁 Serving static files from: ${staticDir}`);
console.log(`🌍 Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(staticDir));

// Routes
app.use("/api", authRoutes);
app.use("/api", bucketRoutes);
app.use("/api", objectRoutes);
app.use("/", uiRoutes);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(appConfig.port, () => {
  console.log(`🚀 Server running at http://localhost:${appConfig.port}`);
  console.log(`   Open: http://localhost:${appConfig.port}/login`);
});
