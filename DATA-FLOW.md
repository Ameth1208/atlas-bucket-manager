# Data Flow in Clean Architecture

## Request Flow: Create Bucket Example

### Full Journey: `POST /api/buckets`

```
┌─────────────────────────────────────────────────────────────┐
│  1. HTTP REQUEST                                             │
│  POST /api/buckets                                          │
│  Body: { providerId: "minio", name: "my-bucket" }          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. PRESENTATION LAYER                                       │
│  📍 src/presentation/routes/bucket.routes.ts                │
│                                                              │
│  router.post('/buckets',                                    │
│              authMiddleware,            ← JWT Validation    │
│              bucketController.createBucket)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CONTROLLER                                               │
│  📍 src/presentation/controllers/bucket.controller.ts       │
│                                                              │
│  createBucket = async (req, res) => {                       │
│    await this.createBucketUseCase.execute(req.body);        │
│    res.json({ success: true });                            │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. APPLICATION LAYER (Use Case)                             │
│  📍 src/application/use-cases/bucket/create-bucket.use-case │
│                                                              │
│  execute(dto: CreateBucketDto) {                            │
│    // ✅ Business Validation                                │
│    if (!dto.providerId || !dto.name)                        │
│      throw new Error('Missing fields');                     │
│                                                              │
│    if (dto.name.length < 3 || dto.name.length > 63)        │
│      throw new Error('Invalid length');                     │
│                                                              │
│    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(dto.name))   │
│      throw new Error('Invalid S3 naming');                  │
│                                                              │
│    // ✅ Delegate to Repository                             │
│    await this.bucketRepository.createBucket(                │
│      dto.providerId,                                        │
│      dto.name                                               │
│    );                                                        │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DOMAIN LAYER (Interface)                                 │
│  📍 src/domain/repositories/bucket.repository.interface.ts  │
│                                                              │
│  interface IBucketRepository {                              │
│    createBucket(                                            │
│      providerId: string,                                    │
│      bucketName: string                                     │
│    ): Promise<void>;                                        │
│  }                                                           │
│                                                              │
│  ⚠️ This is just a CONTRACT, not implementation!            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. INFRASTRUCTURE LAYER (Implementation)                    │
│  📍 src/infrastructure/repositories/s3-bucket.repository.ts │
│                                                              │
│  class S3BucketRepository implements IBucketRepository {    │
│    async createBucket(providerId, bucketName) {             │
│      const client = this.getClient(providerId);             │
│      const config = this.providerConfigs.get(providerId);   │
│                                                              │
│      // 🔌 Actual S3/MinIO SDK call                         │
│      await client.makeBucket(bucketName, config.region);    │
│    }                                                         │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. EXTERNAL SERVICE                                         │
│  🗄️  MinIO / AWS S3 / Cloudflare R2                        │
│                                                              │
│  - Creates bucket in S3-compatible storage                  │
│  - Returns success/error                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  8. RESPONSE FLOW (Backward)                                 │
│                                                              │
│  Infrastructure → Application → Controller → Client         │
│                                                              │
│  Success Response:                                          │
│  HTTP 200 { "success": true }                              │
│                                                              │
│  Error Response (if validation fails):                      │
│  HTTP 400 { "error": "Bucket name too short" }             │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

### Scenario: Invalid Bucket Name

```
┌─────────────────────────────────────────────────────────────┐
│  Request: POST /api/buckets                                  │
│  Body: { providerId: "minio", name: "ab" }  ← TOO SHORT!   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Route → Middleware → Controller                             │
│  (All pass through successfully)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Use Case: CreateBucketUseCase                               │
│                                                              │
│  execute(dto) {                                             │
│    if (dto.name.length < 3) {                               │
│      throw new Error('Bucket name must be 3-63 chars');     │
│    }                                                         │
│    // ❌ Never reaches repository!                          │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │ throws Error
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Global Error Handler Middleware                             │
│  📍 src/presentation/middleware/error-handler.middleware.ts │
│                                                              │
│  errorHandler(err, req, res, next) {                        │
│    console.error(`[Error] ${req.method} ${req.url}:`,       │
│                  err.message);                              │
│                                                              │
│    res.status(err.status || 500).json({                     │
│      success: false,                                        │
│      error: err.message                                     │
│    });                                                       │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  HTTP Response                                               │
│  Status: 500                                                │
│  Body: {                                                    │
│    "success": false,                                        │
│    "error": "Bucket name must be 3-63 chars"               │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Injection Flow

### How `server.ts` Wires Everything

```
┌─────────────────────────────────────────────────────────────┐
│  server.ts - Composition Root                                │
└─────────────────────────────────────────────────────────────┘
                     │
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
┌──────────────┐           ┌──────────────────┐
│ Load Config  │           │ Create Repository│
│ (app.config) │           │ (Infrastructure) │
└──────┬───────┘           └────────┬─────────┘
       │                            │
       │                            │
       │     ┌──────────────────────┘
       │     │
       ▼     ▼
   ┌─────────────────────────────────┐
   │  Create Use Cases                │
   │  (Application Layer)            │
   │                                 │
   │  const createBucketUseCase =    │
   │    new CreateBucketUseCase(     │
   │      bucketRepository  ← Inject │
   │    );                           │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │  Create Controllers              │
   │  (Presentation Layer)           │
   │                                 │
   │  const bucketController =       │
   │    new BucketController(        │
   │      createBucketUseCase ← Inject│
   │      // ... other use cases     │
   │    );                           │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │  Create Routes                   │
   │  (Presentation Layer)           │
   │                                 │
   │  const bucketRoutes =           │
   │    createBucketRoutes(          │
   │      bucketController, ← Inject │
   │      authMiddleware    ← Inject │
   │    );                           │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │  Mount Routes on Express         │
   │                                 │
   │  app.use('/api', bucketRoutes); │
   │  app.use(errorHandler);         │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │  Start Server                    │
   │  app.listen(port);              │
   └─────────────────────────────────┘
```

## Multi-Provider Flow

### How the System Handles Multiple S3 Providers

```
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure: S3BucketRepository                          │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ constructor(providers: Provider[])
                     ▼
        ┌────────────────────────────┐
        │  Initialize Minio Clients  │
        │                            │
        │  clients = Map{            │
        │    'minio' → MinioClient   │
        │    'aws'   → MinioClient   │
        │    'r2'    → MinioClient   │
        │  }                         │
        └────────┬───────────────────┘
                 │
                 │ When request arrives
                 ▼
      ┌──────────────────────────┐
      │  getClient(providerId)   │
      │                          │
      │  return clients.get(id)  │
      └───────┬──────────────────┘
              │
              ▼
   ┌──────────────────────────────┐
   │  Execute Operation            │
   │                              │
   │  const client = getClient(); │
   │  await client.makeBucket();  │
   └──────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Login Request                                            │
│  POST /api/login                                            │
│  Body: { username, password }                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Auth Controller                                          │
│  Calls: loginUseCase.execute({ username, password })       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Login Use Case                                           │
│                                                              │
│  execute(dto: LoginDto): string | null {                    │
│    if (dto.username === adminUser &&                        │
│        dto.password === adminPass) {                        │
│      return jwt.sign({ user }, jwtSecret, { expiresIn });  │
│    }                                                         │
│    return null;                                             │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Controller Sets Cookie                                   │
│                                                              │
│  if (token) {                                               │
│    res.cookie('auth_token', token, {                        │
│      httpOnly: true,                                        │
│      sameSite: 'lax'                                        │
│    });                                                       │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Protected Route Request                                  │
│  GET /api/buckets                                           │
│  Cookie: auth_token=eyJhbGc...                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Auth Middleware                                          │
│                                                              │
│  const token = req.cookies.auth_token;                      │
│  const payload = jwt.verify(token, jwtSecret);              │
│  req.user = payload;                                        │
│  next();  ← Continue to controller                          │
└─────────────────────────────────────────────────────────────┘
```

## Summary: Why This Flow Matters

### Benefits of This Architecture

1. **Clear Separation**: Each layer has ONE job
   - Presentation = HTTP
   - Application = Business Logic
   - Domain = Contracts
   - Infrastructure = External Services

2. **Testability**: Test each layer independently
   ```typescript
   // Test use case without HTTP or database
   const mockRepo = { createBucket: jest.fn() };
   const useCase = new CreateBucketUseCase(mockRepo);
   await useCase.execute({ ... });
   ```

3. **Flexibility**: Swap implementations easily
   - Change from MinIO to native AWS SDK?
   - Just update S3BucketRepository, use cases unchanged!

4. **Maintainability**: Easy to locate where changes go
   - New validation? → Use Case
   - New endpoint? → Route + Controller
   - New provider? → Infrastructure

5. **Scalability**: Add features without breaking existing code
   - Each use case is independent
   - No cascading changes

## Key Takeaways

- ✅ Dependencies flow INWARD (Presentation → Application → Domain)
- ✅ Domain knows NOTHING about HTTP or databases
- ✅ Use cases contain ALL business logic
- ✅ Controllers are THIN (just orchestrate)
- ✅ Infrastructure implements domain contracts
- ✅ server.ts wires everything together (Dependency Injection)

**This is professional, scalable, VibeCoding-ready architecture!** 🚀
