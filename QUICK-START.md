# Quick Start - Clean Architecture

## 🏗️ Architecture at a Glance

```
┌──────────────────────────────────────────────────────┐
│  Presentation → Application → Domain ← Infrastructure │
└──────────────────────────────────────────────────────┘
```

### 📂 Directory Structure

```
src/
├── 🎯 domain/           Business entities & contracts (CORE)
├── 🧠 application/      Use cases & DTOs (BUSINESS LOGIC)
├── 🔌 infrastructure/   S3 repository & config (EXTERNAL)
├── 🌐 presentation/     Controllers, routes, middleware (HTTP)
└── 🚀 server.ts         Dependency injection (COMPOSITION ROOT)
```

## 🚀 Running the Project

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Docker
docker-compose up -d
```

## 📝 Adding a Feature

### Example: Add "Rename Bucket"

**1. Domain** - Define the contract:
```typescript
// src/domain/repositories/bucket.repository.interface.ts
renameBucket(providerId: string, oldName: string, newName: string): Promise<void>;
```

**2. Infrastructure** - Implement it:
```typescript
// src/infrastructure/repositories/s3-bucket.repository.ts
async renameBucket(providerId: string, oldName: string, newName: string) {
  const client = this.getClient(providerId);
  await client.renameBucket(oldName, newName);
}
```

**3. Application** - Create use case:
```typescript
// src/application/use-cases/bucket/rename-bucket.use-case.ts
export class RenameBucketUseCase {
  constructor(private repo: IBucketRepository) {}
  
  async execute(providerId: string, oldName: string, newName: string) {
    if (newName.length < 3) throw new Error('Name too short');
    await this.repo.renameBucket(providerId, oldName, newName);
  }
}
```

**4. Presentation** - Add controller:
```typescript
// src/presentation/controllers/bucket.controller.ts
renameBucket = async (req: Request, res: Response) => {
  const { providerId, oldName, newName } = req.body;
  await this.renameBucketUseCase.execute(providerId, oldName, newName);
  res.json({ success: true });
};
```

**5. Presentation** - Add route:
```typescript
// src/presentation/routes/bucket.routes.ts
router.put('/buckets/rename', authMiddleware, bucketController.renameBucket);
```

**6. Composition** - Wire dependencies:
```typescript
// src/server.ts
const renameBucketUseCase = new RenameBucketUseCase(bucketRepository);
const bucketController = new BucketController(
  // ... existing use cases
  renameBucketUseCase
);
```

## 📋 Current Use Cases

### Bucket (6)
- ✅ Get Providers
- ✅ List Buckets
- ✅ Create Bucket
- ✅ Delete Bucket
- ✅ Update Policy
- ✅ Get Stats

### Object (7)
- ✅ List Objects
- ✅ Upload File
- ✅ Delete Objects
- ✅ Create Folder
- ✅ Search Objects
- ✅ Get Presigned URL
- ✅ Get Object Stream

### Auth (1)
- ✅ Login

## 🧪 Testing

```typescript
// Example: Testing a use case
import { CreateBucketUseCase } from './create-bucket.use-case';

class MockRepository implements IBucketRepository {
  createBucket = jest.fn();
  // ... other methods
}

test('should reject short bucket names', async () => {
  const mockRepo = new MockRepository();
  const useCase = new CreateBucketUseCase(mockRepo);
  
  await expect(
    useCase.execute({ providerId: 'minio', name: 'ab' })
  ).rejects.toThrow();
});
```

## 📚 Documentation

- **`ARCHITECTURE.md`** - Complete architecture guide
- **`AGENTS.md`** - Full project context for AI assistants
- **`CONTRIBUTING.md`** - How to contribute
- **`MIGRATION-SUMMARY.md`** - What changed from old architecture

## 🎯 Key Principles

1. **Domain** = Core business rules (framework-agnostic)
2. **Application** = Use cases (what the app does)
3. **Infrastructure** = External services (how it's done)
4. **Presentation** = HTTP interface (how users interact)

## ⚡ Quick Commands

```bash
# Build
npm run build

# Clean build
rm -rf dist && npm run build

# Check TypeScript errors
npx tsc --noEmit

# Format code (if prettier configured)
npm run format
```

## 🔑 Environment Variables

```env
# App
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=password
JWT_SECRET=your-secret

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

## 🐛 Common Issues

### "Cannot find module"
- Run `npm run build` to recompile
- Delete `dist/` and rebuild

### "Provider not found"
- Check your `.env` file
- Verify credentials are set

### LSP/TypeScript errors
- Restart TypeScript server in your IDE
- Run `npm run build` to verify actual errors

## 📖 Further Reading

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

---

**Need help?** Check `CONTRIBUTING.md` or open an issue on GitHub.
