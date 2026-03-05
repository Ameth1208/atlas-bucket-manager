# Clean Architecture - Atlas Bucket Manager

## Overview

This project follows **Clean Architecture** principles with clear separation of concerns across four distinct layers. Dependencies flow inward: outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (HTTP Interface - Controllers, Routes, Middleware)         │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Auth     │  │  Bucket    │  │  Object    │           │
│  │ Controller │  │ Controller │  │ Controller │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│          (Business Logic - Use Cases & DTOs)                 │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   Bucket Use Cases   │  │  Object Use Cases    │        │
│  │  - Create Bucket     │  │  - Upload File       │        │
│  │  - List Buckets      │  │  - Delete Objects    │        │
│  │  - Delete Bucket     │  │  - Search Objects    │        │
│  │  - Update Policy     │  │  - Create Folder     │        │
│  │  - Get Stats         │  │  - Get Stream        │        │
│  └──────────────────────┘  └──────────────────────┘        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                             │
│         (Business Entities & Repository Contracts)           │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Bucket    │  │   Object    │  │  Provider   │        │
│  │   Entity    │  │   Entity    │  │   Entity    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│           ┌───────────────────────────────┐                 │
│           │  IBucketRepository Interface  │                 │
│           └───────────────────────────────┘                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                         │
│    (External Services - Database, APIs, File System)        │
│                                                              │
│  ┌───────────────────────────────────────────────┐         │
│  │      S3BucketRepository (implements           │         │
│  │         IBucketRepository)                    │         │
│  │                                               │         │
│  │  - Manages MinIO Client instances            │         │
│  │  - Implements S3 operations                  │         │
│  │  - Handles multiple providers                │         │
│  └───────────────────────────────────────────────┘         │
│                                                              │
│  ┌───────────────────────────────────────────────┐         │
│  │         App Configuration                     │         │
│  │  - Loads environment variables                │         │
│  │  - Provider configs (MinIO, AWS, R2, etc)     │         │
│  └───────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Flow

```
server.ts (Entry Point)
    │
    ├─> Creates S3BucketRepository (Infrastructure)
    │       │
    │       └─> Implements IBucketRepository (Domain)
    │
    ├─> Creates Use Cases (Application)
    │       │
    │       └─> Depends on IBucketRepository (Domain)
    │
    ├─> Creates Controllers (Presentation)
    │       │
    │       └─> Depends on Use Cases (Application)
    │
    └─> Creates Routes (Presentation)
            │
            └─> Depends on Controllers (Presentation)
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose**: Core business logic and rules, framework-agnostic

**Contains**:
- **Entities**: Pure business objects (Bucket, StorageObject, Provider)
- **Repository Interfaces**: Contracts for data access

**Rules**:
- NO dependencies on other layers
- NO framework imports (Express, MinIO, etc.)
- Only TypeScript and pure logic

**Example**:
```typescript
// bucket.entity.ts
export interface Bucket {
  name: string;
  providerId: string;
  providerName: string;
  creationDate: Date;
  isPublic: boolean;
}
```

### 2. Application Layer (`src/application/`)

**Purpose**: Orchestrate business logic through use cases

**Contains**:
- **Use Cases**: Single-responsibility actions (CreateBucket, UploadFile)
- **DTOs**: Data Transfer Objects for communication between layers

**Rules**:
- Depends ONLY on Domain layer
- Each use case = one user action
- NO knowledge of HTTP, databases, or UI

**Example**:
```typescript
// create-bucket.use-case.ts
export class CreateBucketUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(dto: CreateBucketDto): Promise<void> {
    // Business validation
    if (dto.name.length < 3) {
      throw new Error('Bucket name too short');
    }
    
    // Delegate to repository
    await this.bucketRepository.createBucket(dto.providerId, dto.name);
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implement external service connections

**Contains**:
- **Repositories**: Concrete implementations using MinIO SDK
- **Configuration**: Environment variables, provider setup

**Rules**:
- Implements Domain interfaces
- Can depend on Domain and Application layers
- Contains all "dirty" external dependencies

**Example**:
```typescript
// s3-bucket.repository.ts
export class S3BucketRepository implements IBucketRepository {
  private clients: Map<string, Minio.Client>;
  
  async createBucket(providerId: string, bucketName: string) {
    const client = this.getClient(providerId);
    await client.makeBucket(bucketName);
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**Purpose**: Handle HTTP requests/responses

**Contains**:
- **Controllers**: Translate HTTP to use case calls
- **Routes**: Define API endpoints
- **Middleware**: Auth, error handling, validation

**Rules**:
- Depends on Application layer (use cases)
- Handles request/response formatting
- NO business logic

**Example**:
```typescript
// bucket.controller.ts
export class BucketController {
  constructor(private createBucketUseCase: CreateBucketUseCase) {}

  createBucket = async (req: Request, res: Response) => {
    const { providerId, name } = req.body;
    await this.createBucketUseCase.execute({ providerId, name });
    res.json({ success: true });
  };
}
```

## Dependency Injection

All dependencies are wired manually in `server.ts`:

```typescript
// 1. Create repository
const repository = new S3BucketRepository(appConfig.providers);

// 2. Create use cases (inject repository)
const createBucketUseCase = new CreateBucketUseCase(repository);

// 3. Create controllers (inject use cases)
const bucketController = new BucketController(createBucketUseCase);

// 4. Create routes (inject controllers)
const routes = createBucketRoutes(bucketController, authMiddleware);

// 5. Mount routes
app.use('/api', routes);
```

## Benefits of This Architecture

### 1. Testability
- Each layer can be tested in isolation
- Use cases can be tested without HTTP or database
- Mock dependencies easily

### 2. Maintainability
- Clear separation of concerns
- Easy to locate where changes should be made
- Predictable structure

### 3. Flexibility
- Swap implementations without changing business logic
- Add new providers without touching use cases
- Change from Express to Fastify without rewriting logic

### 4. Scalability
- Add new features by creating new use cases
- Extend functionality without modifying existing code
- Team members can work on different layers independently

## File Naming Conventions

All files use **kebab-case** (lowercase with hyphens):

```
✅ create-bucket.use-case.ts
✅ auth.controller.ts
✅ s3-bucket.repository.ts

❌ CreateBucket.ts
❌ AuthController.ts
❌ S3BucketRepository.ts
```

## Adding New Features

### Example: Add "Copy Object" feature

1. **Domain** - Define interface method:
```typescript
// bucket.repository.interface.ts
copyObject(providerId: string, sourceBucket: string, 
           destBucket: string, objectName: string): Promise<void>;
```

2. **Infrastructure** - Implement:
```typescript
// s3-bucket.repository.ts
async copyObject(providerId, sourceBucket, destBucket, objectName) {
  const client = this.getClient(providerId);
  await client.copyObject(destBucket, objectName, 
                          `/${sourceBucket}/${objectName}`);
}
```

3. **Application** - Create use case:
```typescript
// copy-object.use-case.ts
export class CopyObjectUseCase {
  constructor(private bucketRepository: IBucketRepository) {}
  
  async execute(dto: CopyObjectDto) {
    await this.bucketRepository.copyObject(
      dto.providerId, dto.sourceBucket, 
      dto.destBucket, dto.objectName
    );
  }
}
```

4. **Presentation** - Add controller method:
```typescript
// object.controller.ts
copyObject = async (req: Request, res: Response) => {
  await this.copyObjectUseCase.execute(req.body);
  res.json({ success: true });
};
```

5. **Presentation** - Add route:
```typescript
// object.routes.ts
router.post('/buckets/:providerId/:name/copy', 
            authMiddleware, 
            objectController.copyObject);
```

6. **Entry Point** - Wire dependencies:
```typescript
// server.ts
const copyObjectUseCase = new CopyObjectUseCase(bucketRepository);
const objectController = new ObjectController(
  // ... other use cases
  copyObjectUseCase
);
```

## Testing Strategy

```typescript
// Example: Testing CreateBucketUseCase

// Mock repository
class MockBucketRepository implements IBucketRepository {
  createBucket = jest.fn();
  // ... other methods
}

// Test
test('should create bucket with valid name', async () => {
  const mockRepo = new MockBucketRepository();
  const useCase = new CreateBucketUseCase(mockRepo);
  
  await useCase.execute({ providerId: 'minio', name: 'test-bucket' });
  
  expect(mockRepo.createBucket).toHaveBeenCalledWith('minio', 'test-bucket');
});

test('should reject short bucket names', async () => {
  const mockRepo = new MockBucketRepository();
  const useCase = new CreateBucketUseCase(mockRepo);
  
  await expect(
    useCase.execute({ providerId: 'minio', name: 'ab' })
  ).rejects.toThrow('Bucket name must be between 3 and 63 characters');
});
```

## Summary

This architecture ensures:
- **Domain** = What the app does (business rules)
- **Application** = How to do it (use cases)
- **Infrastructure** = Where it runs (databases, APIs)
- **Presentation** = Who uses it (HTTP interface)

Each layer has a clear purpose and dependencies flow inward, making the codebase robust, testable, and easy to evolve.
