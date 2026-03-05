# Contributing to Atlas Bucket Manager

## Architecture Overview

This project follows **Clean Architecture** principles. Please read `ARCHITECTURE.md` for a complete understanding before contributing.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── domain/          # Business entities and interfaces (NO framework dependencies)
├── application/     # Use cases and DTOs (business logic)
├── infrastructure/  # External services (S3, config)
├── presentation/    # HTTP layer (controllers, routes, middleware)
└── server.ts        # Dependency injection composition
```

## Adding a New Feature

Follow these steps to maintain clean architecture:

### 1. Domain Layer (if needed)

**When**: Adding a new entity or repository method

```typescript
// src/domain/repositories/bucket.repository.interface.ts
export interface IBucketRepository {
  // Add new method signature
  copyBucket(providerId: string, sourceBucket: string, destBucket: string): Promise<void>;
}
```

### 2. Application Layer

**Create Use Case**:

```typescript
// src/application/use-cases/bucket/copy-bucket.use-case.ts
import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class CopyBucketUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, sourceBucket: string, destBucket: string): Promise<void> {
    // Add validation logic here
    if (!sourceBucket || !destBucket) {
      throw new Error('Source and destination buckets are required');
    }

    await this.bucketRepository.copyBucket(providerId, sourceBucket, destBucket);
  }
}
```

**Create DTO (if complex data)**:

```typescript
// src/application/dtos/copy-bucket.dto.ts
export interface CopyBucketDto {
  providerId: string;
  sourceBucket: string;
  destBucket: string;
}
```

### 3. Infrastructure Layer

**Implement Repository Method**:

```typescript
// src/infrastructure/repositories/s3-bucket.repository.ts
export class S3BucketRepository implements IBucketRepository {
  // ... existing code

  async copyBucket(providerId: string, sourceBucket: string, destBucket: string): Promise<void> {
    const client = this.getClient(providerId);
    // Implementation using MinIO SDK
    await client.copyBucket(sourceBucket, destBucket);
  }
}
```

### 4. Presentation Layer

**Add Controller Method**:

```typescript
// src/presentation/controllers/bucket.controller.ts
export class BucketController {
  constructor(
    // ... existing use cases
    private copyBucketUseCase: CopyBucketUseCase
  ) {}

  copyBucket = async (req: Request, res: Response) => {
    const { providerId, sourceBucket, destBucket } = req.body;
    await this.copyBucketUseCase.execute(providerId, sourceBucket, destBucket);
    res.json({ success: true });
  };
}
```

**Add Route**:

```typescript
// src/presentation/routes/bucket.routes.ts
export const createBucketRoutes = (bucketController: BucketController, authMiddleware: any) => {
  const router = Router();

  // ... existing routes
  router.post('/buckets/copy', authMiddleware, bucketController.copyBucket);

  return router;
};
```

### 5. Wire Dependencies

**Update server.ts**:

```typescript
// src/server.ts

// 1. Create use case
const copyBucketUseCase = new CopyBucketUseCase(bucketRepository);

// 2. Inject into controller
const bucketController = new BucketController(
  getProvidersUseCase,
  listBucketsUseCase,
  createBucketUseCase,
  deleteBucketUseCase,
  updateBucketPolicyUseCase,
  copyBucketUseCase  // <-- Add here
);
```

## Code Style Guidelines

### File Naming

All files use **kebab-case** (lowercase with hyphens):

```
✅ create-bucket.use-case.ts
✅ auth.controller.ts
✅ bucket.entity.ts

❌ CreateBucket.ts
❌ AuthController.ts
❌ BucketEntity.ts
```

### Class Naming

Use **PascalCase** for class names:

```typescript
✅ export class CreateBucketUseCase { }
✅ export class BucketController { }

❌ export class createBucketUseCase { }
❌ export class bucket_controller { }
```

### TypeScript Guidelines

1. **Explicit Types**: Avoid `any`, use proper interfaces
2. **Async/Await**: Prefer over promises
3. **Error Handling**: Let errors bubble up to middleware
4. **Dependency Injection**: Use constructor injection

```typescript
// ✅ Good
export class CreateBucketUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(dto: CreateBucketDto): Promise<void> {
    await this.bucketRepository.createBucket(dto.providerId, dto.name);
  }
}

// ❌ Bad
export class CreateBucketUseCase {
  private bucketRepository: any;

  setBucketRepository(repo: any) {
    this.bucketRepository = repo;
  }

  execute(dto: any) {
    return this.bucketRepository.createBucket(dto.providerId, dto.name);
  }
}
```

## Testing

### Unit Tests (Use Cases)

```typescript
// create-bucket.use-case.spec.ts
import { CreateBucketUseCase } from './create-bucket.use-case';
import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

class MockBucketRepository implements IBucketRepository {
  createBucket = jest.fn();
  // ... implement other methods as stubs
}

describe('CreateBucketUseCase', () => {
  it('should create bucket with valid name', async () => {
    const mockRepo = new MockBucketRepository();
    const useCase = new CreateBucketUseCase(mockRepo);

    await useCase.execute({ providerId: 'minio', name: 'test-bucket' });

    expect(mockRepo.createBucket).toHaveBeenCalledWith('minio', 'test-bucket');
  });

  it('should reject invalid bucket names', async () => {
    const mockRepo = new MockBucketRepository();
    const useCase = new CreateBucketUseCase(mockRepo);

    await expect(
      useCase.execute({ providerId: 'minio', name: 'ab' })
    ).rejects.toThrow();
  });
});
```

### Integration Tests (Controllers)

```typescript
// bucket.controller.spec.ts
import request from 'supertest';
import express from 'express';

describe('BucketController', () => {
  it('POST /api/buckets should create bucket', async () => {
    const response = await request(app)
      .post('/api/buckets')
      .set('Cookie', authCookie)
      .send({ providerId: 'minio', name: 'test-bucket' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });
});
```

## Layer Dependencies

**Remember the dependency rule**:

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain** depends on NOTHING
- **Application** depends ONLY on Domain
- **Infrastructure** implements Domain interfaces
- **Presentation** uses Application use cases

## Common Mistakes to Avoid

### ❌ DON'T: Put business logic in controllers

```typescript
// BAD
export class BucketController {
  createBucket = async (req: Request, res: Response) => {
    const { name } = req.body;
    
    // Business logic in controller! ❌
    if (name.length < 3) {
      return res.status(400).json({ error: 'Name too short' });
    }
    
    await this.repository.createBucket(name);
  };
}
```

### ✅ DO: Put business logic in use cases

```typescript
// GOOD - Controller
export class BucketController {
  createBucket = async (req: Request, res: Response) => {
    await this.createBucketUseCase.execute(req.body);
    res.json({ success: true });
  };
}

// GOOD - Use Case
export class CreateBucketUseCase {
  execute(dto: CreateBucketDto) {
    // Business validation here ✅
    if (dto.name.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }
    
    await this.repository.createBucket(dto.providerId, dto.name);
  }
}
```

### ❌ DON'T: Import MinIO in use cases

```typescript
// BAD
import * as Minio from 'minio';

export class CreateBucketUseCase {
  execute(dto: CreateBucketDto) {
    const client = new Minio.Client({ ... }); // ❌
  }
}
```

### ✅ DO: Use repository interfaces

```typescript
// GOOD
import { IBucketRepository } from '../../domain/repositories/bucket.repository.interface';

export class CreateBucketUseCase {
  constructor(private repository: IBucketRepository) {} // ✅
  
  execute(dto: CreateBucketDto) {
    await this.repository.createBucket(dto.providerId, dto.name);
  }
}
```

## Git Workflow

### Branch Naming

```
feature/add-copy-bucket
fix/bucket-deletion-error
refactor/improve-auth-middleware
docs/update-architecture-guide
```

### Commit Messages

Follow conventional commits:

```
feat: add copy bucket functionality
fix: correct bucket policy update
refactor: extract S3 client creation
docs: update contributing guide
test: add unit tests for CreateBucketUseCase
```

## Pull Request Checklist

- [ ] Code follows clean architecture principles
- [ ] File names are in kebab-case
- [ ] Business logic is in use cases, not controllers
- [ ] All dependencies flow inward
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Tests pass (when implemented)
- [ ] Documentation updated (if needed)

## Questions?

- Read `ARCHITECTURE.md` for detailed architecture explanation
- Read `AGENTS.md` for complete project context
- Open a GitHub issue for questions

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
