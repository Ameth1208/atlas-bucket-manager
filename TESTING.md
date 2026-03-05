# Testing Strategy - Atlas Bucket Manager

## Overview

This project uses **Jest** for testing with a focus on **unit tests** for use cases. The Clean Architecture makes testing easy because business logic is isolated from infrastructure.

## Test Structure

```
tests/
├── unit/                    # Unit tests (isolated, fast)
│   └── use-cases/
│       ├── bucket/          # Bucket use case tests
│       ├── object/          # Object use case tests
│       └── auth/            # Auth use case tests
├── integration/             # Integration tests (with repository)
├── e2e/                     # End-to-end tests (full stack)
└── mocks/                   # Reusable mocks
    └── mock-bucket.repository.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only e2e tests
npm run test:e2e
```

## Test Results

```
Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
Time:        ~12s
```

### Covered Use Cases

#### ✅ Bucket Use Cases (2/6)
- [x] CreateBucketUseCase - 12 tests
- [x] ListBucketsUseCase - 3 tests
- [ ] DeleteBucketUseCase
- [ ] UpdateBucketPolicyUseCase
- [ ] GetBucketStatsUseCase
- [ ] GetProvidersUseCase

#### ✅ Object Use Cases (2/7)
- [x] UploadFileUseCase - 3 tests
- [x] DeleteObjectsUseCase - 6 tests
- [ ] ListObjectsUseCase
- [ ] CreateFolderUseCase
- [ ] SearchObjectsUseCase
- [ ] GetPresignedUrlUseCase
- [ ] GetObjectStreamUseCase

#### ✅ Auth Use Cases (1/1)
- [x] LoginUseCase - 8 tests

**Total Coverage**: 5/14 use cases (35%)

## Testing Philosophy

### 1. Unit Tests (Use Cases)

**Focus**: Test business logic in isolation

**Benefits**:
- ✅ Fast execution (< 1s per suite)
- ✅ No external dependencies
- ✅ Easy to write and maintain
- ✅ Catch bugs early

**Example**:
```typescript
describe('CreateBucketUseCase', () => {
  it('should throw error if bucket name is too short', async () => {
    const mockRepo = new MockBucketRepository();
    const useCase = new CreateBucketUseCase(mockRepo);
    
    await expect(
      useCase.execute({ providerId: 'minio', name: 'ab' })
    ).rejects.toThrow('Bucket name must be between 3 and 63 characters');
    
    expect(mockRepo.createBucket).not.toHaveBeenCalled();
  });
});
```

### 2. Integration Tests (Repository)

**Focus**: Test repository with real S3/MinIO

**Benefits**:
- ✅ Verify S3 SDK integration
- ✅ Test multi-provider logic
- ✅ Catch configuration issues

**Example** (not yet implemented):
```typescript
describe('S3BucketRepository Integration', () => {
  let repository: S3BucketRepository;
  
  beforeAll(() => {
    // Setup test MinIO container
    repository = new S3BucketRepository([testProvider]);
  });
  
  it('should create bucket in MinIO', async () => {
    await repository.createBucket('minio', 'test-bucket');
    const buckets = await repository.listBuckets();
    
    expect(buckets.find(b => b.name === 'test-bucket')).toBeDefined();
  });
});
```

### 3. E2E Tests (Full Stack)

**Focus**: Test complete HTTP flow

**Benefits**:
- ✅ Verify API contracts
- ✅ Test authentication flow
- ✅ Catch integration bugs

**Example** (not yet implemented):
```typescript
describe('Bucket API E2E', () => {
  let app: Express;
  let authCookie: string;
  
  beforeAll(async () => {
    // Login and get cookie
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password' });
    
    authCookie = response.headers['set-cookie'][0];
  });
  
  it('should create bucket via API', async () => {
    const response = await request(app)
      .post('/api/buckets')
      .set('Cookie', authCookie)
      .send({ providerId: 'minio', name: 'test-bucket' });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });
});
```

## Test Coverage Goals

### Current Coverage: ~35% (5/14 use cases)

### Short-term Goal: 80% (11/14 use cases)

**Priority**:
1. ✅ CreateBucketUseCase
2. ✅ LoginUseCase
3. ✅ UploadFileUseCase
4. ✅ DeleteObjectsUseCase
5. ✅ ListBucketsUseCase
6. 🔲 DeleteBucketUseCase (high impact)
7. 🔲 ListObjectsUseCase (frequently used)
8. 🔲 CreateFolderUseCase (simple)
9. 🔲 SearchObjectsUseCase (complex)
10. 🔲 GetPresignedUrlUseCase (security)
11. 🔲 UpdateBucketPolicyUseCase (important)

### Long-term Goal: 100% + Integration + E2E

## Writing Tests

### Test Structure (AAA Pattern)

```typescript
describe('UseCase', () => {
  // Arrange
  let mockRepository: MockBucketRepository;
  let useCase: SomeUseCase;

  beforeEach(() => {
    mockRepository = new MockBucketRepository();
    useCase = new SomeUseCase(mockRepository);
  });

  it('should do something', async () => {
    // Arrange
    mockRepository.someMethod.mockResolvedValue(expectedValue);
    
    // Act
    const result = await useCase.execute(input);
    
    // Assert
    expect(result).toEqual(expectedValue);
    expect(mockRepository.someMethod).toHaveBeenCalledWith(input);
  });
});
```

### Test Cases to Cover

For each use case, test:

1. **Happy Path** - Valid input → Success
2. **Validation** - Invalid input → Error
3. **Edge Cases** - Boundary values
4. **Error Handling** - Repository failures
5. **Business Rules** - Domain logic

### Example: CreateBucketUseCase Test Plan

```
✅ Validation Tests:
  - Missing providerId → Error
  - Missing name → Error
  - Name too short (< 3 chars) → Error
  - Name too long (> 63 chars) → Error
  - Invalid characters → Error
  - Starts with hyphen → Error
  - Ends with hyphen → Error

✅ Success Cases:
  - Valid name → Creates bucket
  - Name with dots → Creates bucket
  - Name with numbers → Creates bucket
  - Maximum length (63 chars) → Creates bucket

✅ Error Handling:
  - Repository error → Propagates error
```

## Mocking Strategy

### MockBucketRepository

Reusable mock implementing `IBucketRepository`:

```typescript
export class MockBucketRepository implements IBucketRepository {
  // All methods are Jest mocks
  createBucket = jest.fn(() => Promise.resolve());
  listBuckets = jest.fn(() => Promise.resolve([]));
  // ... etc
  
  // Helper to reset all mocks
  resetAllMocks() {
    jest.clearAllMocks();
  }
}
```

**Benefits**:
- ✅ Type-safe (implements interface)
- ✅ Reusable across tests
- ✅ Easy to configure per test
- ✅ No real S3 calls

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3  # Upload coverage
```

## Best Practices

### ✅ DO

- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Test error cases
- Keep tests fast (< 100ms per test)
- Use AAA pattern (Arrange, Act, Assert)

### ❌ DON'T

- Test implementation details
- Test framework code (Express, MinIO SDK)
- Make real network calls in unit tests
- Share state between tests
- Use `any` type in tests

## Test Naming Convention

```typescript
// ✅ Good: Clear and specific
it('should throw error if bucket name is too short', ...)
it('should create bucket with valid name', ...)
it('should propagate repository errors', ...)

// ❌ Bad: Vague
it('should work', ...)
it('test bucket creation', ...)
it('error handling', ...)
```

## Coverage Reports

Generate coverage report:

```bash
npm run test:coverage
```

View HTML report:

```bash
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Debugging Tests

### Run single test file

```bash
npx jest tests/unit/use-cases/bucket/create-bucket.use-case.test.ts
```

### Run tests matching pattern

```bash
npx jest --testNamePattern="should throw error"
```

### Run with verbose output

```bash
npx jest --verbose
```

### Debug in VSCode

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Next Steps

### Phase 1: Complete Unit Tests (Priority)
- [ ] DeleteBucketUseCase
- [ ] ListObjectsUseCase
- [ ] CreateFolderUseCase
- [ ] GetProvidersUseCase
- [ ] UpdateBucketPolicyUseCase
- [ ] GetBucketStatsUseCase
- [ ] SearchObjectsUseCase
- [ ] GetPresignedUrlUseCase
- [ ] GetObjectStreamUseCase

### Phase 2: Integration Tests
- [ ] S3BucketRepository with Testcontainers
- [ ] Multi-provider scenarios
- [ ] Error handling (network failures, auth errors)

### Phase 3: E2E Tests
- [ ] Authentication flow
- [ ] Bucket CRUD via API
- [ ] Object upload/download flow
- [ ] Search functionality

### Phase 4: Performance Tests
- [ ] Large file uploads
- [ ] Many objects listing
- [ ] Concurrent operations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Clean Architecture Testing](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Current Status**: ✅ 32 tests passing | 5/14 use cases covered | ~12s execution time
