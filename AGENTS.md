# AGENTS.md - Context for AI Assistants

## Project Overview

**Atlas Bucket Manager** (minio-bucket-manager) is a multi-cloud storage management web application that provides a unified, modern UI for managing S3-compatible storage providers. It serves as a bridge between local development (MinIO) and cloud production environments (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.).

**Version**: 0.0.5  
**Repository**: https://github.com/ameth1208/atlas-bucket-manager  
**Author**: Ameth Galarcio (https://amethgm.com)  
**License**: MIT

---

## Technology Stack

### Backend

- **Runtime**: Node.js v18+
- **Language**: TypeScript (compiled to CommonJS)
- **Framework**: Express.js v5.2.1
- **Authentication**: JWT with HTTP-only cookies
- **Storage SDK**: MinIO JavaScript SDK v8.0.6 (S3-compatible)
- **File Upload**: Multer v1.4.5
- **Environment**: dotenv v17.2.3
- **Security**: cookie-parser, CORS support

### Frontend

- **Architecture**: Vanilla JavaScript (ES6 Modules) - No framework
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Iconify (Phosphor, Solar icon sets)
- **Pattern**: Single Page Application (SPA) with client-side routing
- **State Management**: Simple store pattern (store.js)
- **Languages**: 6 supported (EN, ES, PT, FR, JA, ZH)

### DevOps

- **Build**: TypeScript Compiler (tsc)
- **Container**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions → GitHub Container Registry (GHCR)
- **Development**: Nodemon + ts-node with hot reload

---

## Project Structure

**Clean Architecture Implementation** with separation of concerns across layers:

```
minio-bucket-manager/
├── src/
│   ├── domain/                      # Domain Layer (Business Logic Core)
│   │   ├── entities/                # Domain entities (business objects)
│   │   │   ├── bucket.entity.ts
│   │   │   ├── object.entity.ts
│   │   │   └── provider.entity.ts
│   │   └── repositories/            # Repository interfaces (contracts)
│   │       └── bucket.repository.interface.ts
│   ├── application/                 # Application Layer (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── bucket/              # Bucket-related use cases
│   │   │   │   ├── create-bucket.use-case.ts
│   │   │   │   ├── delete-bucket.use-case.ts
│   │   │   │   ├── get-bucket-stats.use-case.ts
│   │   │   │   ├── get-providers.use-case.ts
│   │   │   │   ├── list-buckets.use-case.ts
│   │   │   │   └── update-bucket-policy.use-case.ts
│   │   │   ├── object/              # Object-related use cases
│   │   │   │   ├── create-folder.use-case.ts
│   │   │   │   ├── delete-objects.use-case.ts
│   │   │   │   ├── get-object-stream.use-case.ts
│   │   │   │   ├── get-presigned-url.use-case.ts
│   │   │   │   ├── list-objects.use-case.ts
│   │   │   │   ├── search-objects.use-case.ts
│   │   │   │   └── upload-file.use-case.ts
│   │   │   └── auth/                # Authentication use cases
│   │   │       └── login.use-case.ts
│   │   └── dtos/                    # Data Transfer Objects
│   │       ├── create-bucket.dto.ts
│   │       ├── login.dto.ts
│   │       └── upload-file.dto.ts
│   ├── infrastructure/              # Infrastructure Layer (External Services)
│   │   ├── repositories/
│   │   │   └── s3-bucket.repository.ts  # S3 repository implementation
│   │   └── config/
│   │       └── app.config.ts        # Application configuration
│   ├── presentation/                # Presentation Layer (HTTP Interface)
│   │   ├── controllers/             # HTTP controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── bucket.controller.ts
│   │   │   └── object.controller.ts
│   │   ├── routes/                  # Route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── bucket.routes.ts
│   │   │   ├── object.routes.ts
│   │   │   └── ui.routes.ts
│   │   └── middleware/              # Express middleware
│   │       ├── auth.middleware.ts
│   │       └── error-handler.middleware.ts
│   └── server.ts                    # Application entry point (DI composition)
├── public/                          # Frontend static assets
│   ├── login.html
│   ├── manager.html
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── store.js
│       ├── i18n.js
│       ├── utils.js
│       └── components/
│           ├── BucketList.js
│           ├── Explorer.js
│           ├── Modals.js
│           ├── LoginForm.js
│           ├── SupportButton.js
│           └── Tooltip.js
├── dist/                            # Compiled JavaScript
├── uploads/                         # Temporary uploads
├── .github/workflows/
│   └── docker-publish.yml
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── tsconfig.json
├── package.json
└── README.md
```

### Architecture Layers

1. **Domain Layer** (`src/domain/`)
   - Contains business entities and repository interfaces
   - No dependencies on external frameworks
   - Defines contracts that other layers must follow

2. **Application Layer** (`src/application/`)
   - Contains use cases (business logic orchestration)
   - Each use case represents a single user action
   - Uses DTOs for data transfer between layers

3. **Infrastructure Layer** (`src/infrastructure/`)
   - Implements domain interfaces (repositories)
   - Handles external services (S3, MinIO)
   - Manages configuration

4. **Presentation Layer** (`src/presentation/`)
   - HTTP controllers that handle requests/responses
   - Routes that define API endpoints
   - Middleware for auth, validation, and error handling

---

## Core Components

### Domain Layer

#### Entities (`src/domain/entities/`)

- **bucket.entity.ts** - Defines `Bucket` and `BucketStats` interfaces
- **object.entity.ts** - Defines `StorageObject` and `SearchResult` interfaces
- **provider.entity.ts** - Defines `Provider` and `ProviderInfo` interfaces

#### Repository Interfaces (`src/domain/repositories/`)

- **bucket.repository.interface.ts** - `IBucketRepository` contract defining all storage operations

### Application Layer

#### Use Cases (`src/application/use-cases/`)

**Bucket Use Cases:**

- `create-bucket.use-case.ts` - Creates bucket with S3 naming validation
- `delete-bucket.use-case.ts` - Deletes bucket
- `list-buckets.use-case.ts` - Lists all buckets across providers
- `update-bucket-policy.use-case.ts` - Updates public/private policy
- `get-bucket-stats.use-case.ts` - Calculates bucket size and object count
- `get-providers.use-case.ts` - Returns active providers

**Object Use Cases:**

- `upload-file.use-case.ts` - Uploads file to bucket
- `delete-objects.use-case.ts` - Deletes multiple objects
- `list-objects.use-case.ts` - Lists objects with prefix support
- `create-folder.use-case.ts` - Creates virtual folder
- `search-objects.use-case.ts` - Searches across all buckets
- `get-presigned-url.use-case.ts` - Generates temporary share links
- `get-object-stream.use-case.ts` - Streams file for preview

**Auth Use Cases:**

- `login.use-case.ts` - Validates credentials and generates JWT

#### DTOs (`src/application/dtos/`)

- Data Transfer Objects for passing data between layers
- `create-bucket.dto.ts`, `upload-file.dto.ts`, `login.dto.ts`

### Infrastructure Layer

#### Repositories (`src/infrastructure/repositories/`)

- **s3-bucket.repository.ts** - Implements `IBucketRepository` using MinIO SDK
  - Manages multiple S3-compatible clients
  - Handles bucket and object operations
  - Provider-agnostic implementation

#### Configuration (`src/infrastructure/config/`)

- **app.config.ts** - Loads environment variables and provider configurations
  - Supports MinIO, AWS S3, Cloudflare R2, DigitalOcean Spaces
  - JWT secret and admin credentials

### Presentation Layer

#### Controllers (`src/presentation/controllers/`)

- **auth.controller.ts** - Handles login/logout, sets cookies
- **bucket.controller.ts** - Orchestrates bucket use cases
- **object.controller.ts** - Orchestrates object use cases

#### Routes (`src/presentation/routes/`)

- **auth.routes.ts** - `/api/login`, `/api/logout`
- **bucket.routes.ts** - Bucket CRUD endpoints
- **object.routes.ts** - Object operations and search
- **ui.routes.ts** - HTML page serving

#### Middleware (`src/presentation/middleware/`)

- **auth.middleware.ts** - JWT validation, protects routes
- **error-handler.middleware.ts** - Global error handling

### Application Bootstrap

#### server.ts - Dependency Injection Container

- Initializes repository with providers
- Creates all use cases
- Injects dependencies into controllers
- Configures Express middleware
- Mounts routes
- Starts HTTP server

### Backend Routes

#### routes/auth.ts

- `POST /api/login` - Authenticate user, issue JWT cookie
- `POST /api/logout` - Clear authentication cookie

#### routes/buckets.ts

- `GET /api/providers` - List active storage providers
- `GET /api/buckets` - List all buckets across providers with metadata
- `POST /api/buckets` - Create new bucket (body: `{providerId, name}`)
- `PUT /api/buckets/:providerId/:name/policy` - Update bucket policy (body: `{isPublic}`)
- `DELETE /api/buckets/:providerId/:name` - Delete bucket

#### routes/objects.ts

- `GET /api/buckets/:providerId/:name/objects` - List objects (query: `prefix`)
- `GET /api/buckets/:providerId/:name/stats` - Get bucket statistics
- `GET /api/buckets/:providerId/:name/objects/:objectName/url` - Generate presigned URL (query: `expiry`)
- `POST /api/buckets/:providerId/:name/upload` - Multi-file upload (multipart/form-data)
- `POST /api/buckets/:providerId/:name/folder` - Create folder (body: `{folderName}`)
- `DELETE /api/buckets/:providerId/:name/objects` - Bulk delete (body: `{objectNames: string[]}`)
- `GET /api/view/:providerId/:bucket` - Proxy stream for file preview (query: `file`)
- `GET /api/search` - Global search (query: `q`)

#### routes/ui.ts

- `GET /` - Redirect to login
- `GET /login` - Serve login page
- `GET /manager` - Serve manager app (protected)
- `GET /manager/*` - Handle SPA routes (protected)

### Frontend Components

#### 1. app.js - Application Orchestrator

- Initializes theme, language, tooltips
- Manages data loading (`loadData()`) and filtering
- Handles SPA routing (`navigateTo()`)
- Global search functionality
- Bucket creation workflow
- Exposes `window.app` global API

#### 2. api.js - HTTP Client

- Wraps all fetch calls to backend
- Handles response parsing and errors
- Auto-redirects on 401 (unauthorized)
- Methods: `login()`, `logout()`, `getProviders()`, `getBuckets()`, `createBucket()`, `deleteBucket()`, `updateBucketPolicy()`, `getObjects()`, `uploadFiles()`, `createFolder()`, `deleteObjects()`, `getObjectUrl()`, `getBucketStats()`, `search()`

#### 3. store.js - Client State

```javascript
{
  buckets: [],           // All buckets from all providers
  currentBucket: null,   // Currently opened bucket
  currentProvider: null, // Currently selected provider
  currentPrefix: '',     // Current folder path
  filterProvider: 'all', // Filter: 'all', 'minio', 'aws'
  deleteTarget: null     // Target for deletion (bucket or object)
}
```

#### 4. i18n.js - Internationalization

- Supports 6 languages: EN, ES, PT, FR, JA, ZH
- Language selector with country flags
- Dynamic translation via `data-i18n` attributes
- Persists preference to localStorage
- Translation keys for all UI text

#### 5. utils.js - Utilities

- `toggleTheme()` - Switch dark/light mode
- `showToast(message, type)` - Show notifications
- Theme persistence to localStorage
- System preference detection

#### 6. components/BucketList.js

- Renders bucket cards in responsive grid (1-3 columns)
- Shows provider badges (MinIO, AWS S3, etc.)
- Public/private toggle switches
- Delete and explore actions
- Stats refresh button
- Filter by provider

#### 7. components/Explorer.js

- File browser with breadcrumb navigation
- Folder/file listing with type-specific icons
- Upload button (multi-file support)
- Create folder button
- Bulk delete with checkbox selection
- Actions: preview, share, download, delete
- Handles SPA routing for deep links (`/manager/:provider/:bucket/:prefix`)

#### 8. components/Modals.js

- Preview modal for:
  - Images (jpg, png, gif, webp, svg)
  - Videos (mp4, webm, ogg) with controls
  - Audio (mp3, wav, ogg) with controls
  - PDFs (embedded viewer)
  - APK detection (Android packages)
- Delete confirmation modal
- Copy share link functionality

#### 9. components/LoginForm.js

- Login form submission handler
- Password visibility toggle
- Error display

#### 10. components/SupportButton.js

- Floating "Buy Me a Coffee" button
- Expands on hover
- Links to https://buymeacoffee.com/amethgm

#### 11. components/Tooltip.js

- Custom tooltip system
- Position-aware (avoids viewport edges)
- Activated via `data-tooltip` attribute

---

## API Reference

### Authentication

```
POST /api/login
Body: { username: string, password: string }
Response: { success: true }
Sets: HTTP-only cookie with JWT
```

```
POST /api/logout
Response: { success: true }
Clears: Authentication cookie
```

### Providers

```
GET /api/providers
Response: { id: string, name: string }[]
```

### Buckets

```
GET /api/buckets
Response: { name, provider, creationDate, isPublic }[]
```

```
POST /api/buckets
Body: { providerId: string, name: string }
Response: { success: true }
```

```
PUT /api/buckets/:providerId/:name/policy
Body: { isPublic: boolean }
Response: { success: true }
```

```
DELETE /api/buckets/:providerId/:name
Response: { success: true }
```

### Objects

```
GET /api/buckets/:providerId/:name/objects?prefix=...
Response: { name, size, lastModified, isFolder, etag }[]
```

```
GET /api/buckets/:providerId/:name/stats
Response: { totalSize: number, objectCount: number }
```

```
POST /api/buckets/:providerId/:name/upload
Content-Type: multipart/form-data
Body: files (one or multiple)
Response: { success: true, uploadedFiles: string[] }
```

```
POST /api/buckets/:providerId/:name/folder
Body: { folderName: string }
Response: { success: true }
```

```
DELETE /api/buckets/:providerId/:name/objects
Body: { objectNames: string[] }
Response: { success: true }
```

```
GET /api/buckets/:providerId/:name/objects/:objectName/url?expiry=3600
Response: { url: string }
```

```
GET /api/view/:providerId/:bucket?file=path/to/file.jpg
Response: File stream (proxied through backend)
```

```
GET /api/search?q=search-term
Response: { bucket, object, provider, size, lastModified }[]
```

---

## Environment Configuration

### Required Variables

```bash
# Application
PORT=3000                    # Server port
ADMIN_USER=admin            # Admin username
ADMIN_PASS=password         # Admin password
```

### Provider Configuration

#### MinIO (Local Development)

```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_REGION=us-east-1
```

#### AWS S3 (Production)

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_ENDPOINT=s3.amazonaws.com
AWS_S3_PORT=443
AWS_S3_USE_SSL=true
```

#### Cloudflare R2

```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_ENDPOINT=${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

#### DigitalOcean Spaces

```bash
DO_SPACES_KEY=your_key
DO_SPACES_SECRET=your_secret
DO_SPACES_ENDPOINT=${region}.digitaloceanspaces.com
DO_SPACES_REGION=nyc3
```

---

## Development Workflow

### Setup

```bash
npm install
cp .env.example .env  # Configure environment variables
```

### Development (Hot Reload)

```bash
npm run dev
# Runs: nodemon --exec ts-node src/server.ts
# Access: http://localhost:3000
```

### Build

```bash
npm run build
# Compiles TypeScript to dist/
```

### Production

```bash
npm start
# Runs: node dist/server.js
```

### Docker Development (with MinIO)

```bash
docker-compose up -d
# Services:
# - minio: MinIO server (ports 9000, 9001)
# - atlas-manager: App (port 3000)
# Access Manager: http://localhost:3000
# Access MinIO Console: http://localhost:9001
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
# Uses pre-built image from ghcr.io
# Requires .env with provider credentials
```

---

## Key Features

### 1. Multi-Cloud Unified Dashboard

- View buckets from multiple S3-compatible providers in single interface
- Provider-specific badges and filtering
- Automatic provider detection from credentials

### 2. Bucket Management

- Create/delete buckets across providers
- Toggle public/private access policies (bucket-level)
- View creation dates and metadata
- Real-time statistics (size, object count)

### 3. File Explorer

- Navigate folder hierarchies with breadcrumbs
- Upload multiple files simultaneously
- Create folders (virtual directories)
- Bulk delete with checkbox selection
- File type icons (folder, image, video, audio, document, code, archive, etc.)

### 4. Secure File Preview

- Internal proxy prevents CORS issues for private files
- Supported formats:
  - **Images**: jpg, png, gif, webp, svg, ico, bmp
  - **Videos**: mp4, webm, ogg (with HTML5 player)
  - **Audio**: mp3, wav, ogg (with HTML5 player)
  - **Documents**: PDF (embedded viewer)
- APK file detection (Android packages)

### 5. Smart Share Links

- Generate presigned URLs with custom expiration
- Expiry options: 1min, 5min, 1hr, 24hr, 7days
- Copy-to-clipboard functionality
- Works with private buckets

### 6. Global Search

- Search files across all buckets and providers
- Real-time search results
- Click to navigate and preview
- Shows file size and modification date

### 7. Multi-Language Support

- 6 languages: English, Spanish, Portuguese, French, Japanese, Chinese
- Flag-based language selector
- Persistent preference in localStorage
- Complete UI translation

### 8. Dark/Light Mode

- System preference detection
- Manual toggle
- Smooth CSS transitions
- Persistent theme in localStorage

### 9. Responsive Design

- Mobile-friendly layout
- Adaptive grid (1 column mobile → 3 columns desktop)
- Touch-friendly controls
- Responsive modals

### 10. Authentication & Security

- JWT-based stateless authentication
- HTTP-only cookies (XSS protection)
- Protected routes (backend + frontend)
- Secure file streaming (no direct S3 exposure)

---

## Architecture Decisions

### Why Vanilla JavaScript?

- **Zero framework overhead** - Minimal bundle size
- **Fast page loads** - No hydration, no virtual DOM
- **Simple deployment** - Static files + Node backend
- **Easy maintenance** - No framework updates/migrations

### Why Multi-Provider Pattern?

- **Single codebase** - Manage all S3-compatible providers
- **Consistent API** - MinioManager abstracts provider differences
- **Easy extension** - Add new providers via config

### Why Stateless JWT?

- **No session store** - Reduces infrastructure complexity
- **Horizontal scaling** - No sticky sessions required
- **Security** - HTTP-only cookies prevent XSS

### Why Proxy for Preview?

- **CORS solution** - Avoids cross-origin issues with private buckets
- **Security** - Never exposes S3 credentials to frontend
- **Flexibility** - Custom headers, auth checks, logging

### Why SPA with History API?

- **Clean URLs** - No hash fragments (#)
- **Deep linking** - Share direct links to buckets/folders
- **Browser navigation** - Back/forward buttons work naturally

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/docker-publish.yml`

**Triggers**:

- Push to `main` or `master` branches
- Semver tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**Steps**:

1. Checkout code
2. Setup Docker Buildx
3. Login to GitHub Container Registry
4. Extract metadata (tags, labels)
5. Build multi-platform image (linux/amd64, linux/arm64)
6. Push to `ghcr.io/ameth1208/atlas-bucket-manager`
7. Sign image with Cosign (on releases)

**Tags Generated**:

- `latest` - Latest build from main
- `<branch>` - Branch name (e.g., `main`)
- `<semver>` - Version tags (e.g., `1.0.0`, `1.0`, `1`)
- `sha-<git_sha>` - Git commit SHA

---

## Testing

**Current State**: ✅ **Automated tests implemented with Jest**

### Test Infrastructure

- **Framework**: Jest v29.7.0 with TypeScript support (ts-jest)
- **Test Location**: `tests/` directory (excluded from compilation)
- **Mock Repository**: `tests/mocks/mock-bucket.repository.ts` for isolated testing
- **Coverage**: 32 unit tests covering 5/14 use cases (35% use case coverage)

### Test Scripts

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:e2e": "jest tests/e2e"
}
```

### Test Coverage Status

**Tested Use Cases** (32 tests, 100% passing):

- ✅ **CreateBucketUseCase** (12 tests) - S3 validation, error handling
- ✅ **ListBucketsUseCase** (3 tests) - Multi-provider listing
- ✅ **UploadFileUseCase** (3 tests) - File upload with metadata
- ✅ **DeleteObjectsUseCase** (6 tests) - Bulk deletion
- ✅ **LoginUseCase** (8 tests) - Authentication and JWT

**Pending Test Coverage** (9 use cases):

- ⏳ DeleteBucketUseCase
- ⏳ GetBucketStatsUseCase
- ⏳ GetProvidersUseCase
- ⏳ UpdateBucketPolicyUseCase
- ⏳ CreateFolderUseCase
- ⏳ GetObjectStreamUseCase
- ⏳ GetPresignedUrlUseCase
- ⏳ ListObjectsUseCase
- ⏳ SearchObjectsUseCase

### Testing Strategy

- **Unit Tests**: Test use cases in isolation with mock repository
- **Integration Tests**: Test API endpoints with Supertest (planned)
- **E2E Tests**: Test UI flows with Playwright/Cypress (planned)
- **Mock Providers**: Use Testcontainers with MinIO for isolated tests (planned)

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run only unit tests
npm run test:unit
```

**See**: `TESTING.md` for complete testing documentation and examples

---

## Common Tasks

### Adding a New Provider

1. Add credentials to `.env`:

   ```bash
   NEW_PROVIDER_ENDPOINT=...
   NEW_PROVIDER_ACCESS_KEY=...
   NEW_PROVIDER_SECRET_KEY=...
   ```

2. Update `src/config.ts`:

   ```typescript
   export const config = {
     providers: {
       // ... existing providers
       newProvider: {
         endPoint: process.env.NEW_PROVIDER_ENDPOINT,
         port: parseInt(process.env.NEW_PROVIDER_PORT || "443"),
         useSSL: process.env.NEW_PROVIDER_USE_SSL === "true",
         accessKey: process.env.NEW_PROVIDER_ACCESS_KEY,
         secretKey: process.env.NEW_PROVIDER_SECRET_KEY,
         region: process.env.NEW_PROVIDER_REGION,
       },
     },
   };
   ```

3. Restart server - provider auto-initializes

### Adding a New Translation

1. Edit `public/js/i18n.js`
2. Add language to `languages` object:

   ```javascript
   languages: {
     // ... existing
     de: { name: 'Deutsch', flag: '🇩🇪' }
   }
   ```

3. Add translations to `translations` object:
   ```javascript
   translations: {
     de: {
       'app.title': 'Atlas Bucket Manager',
       // ... all keys
     }
   }
   ```

### Adding a New File Type Icon

1. Edit `public/js/components/Explorer.js`
2. Update `getFileIcon()` function:
   ```javascript
   function getFileIcon(fileName) {
     const ext = fileName.split(".").pop().toLowerCase();
     const iconMap = {
       // ... existing mappings
       newext: "ph:file-new", // Iconify icon
     };
     return iconMap[ext] || "ph:file";
   }
   ```

### Debugging Authentication Issues

1. Check JWT secret in `.env` matches between restarts
2. Verify cookie is set: DevTools → Application → Cookies
3. Check token expiration: Decode JWT at jwt.io
4. Verify credentials in `.env` match login form
5. Check backend logs for auth middleware errors

### Performance Optimization

- **Large buckets**: Implement pagination in `listObjects()`
- **Slow stats**: Cache results with TTL in MinioManager
- **Upload speed**: Increase `maxFileSize` in multer config
- **Bundle size**: Tree-shake Iconify icons, self-host Tailwind

---

## Security Considerations

### Authentication

- ✅ JWT tokens in HTTP-only cookies (XSS protection)
- ✅ No credentials stored in localStorage
- ⚠️ Single admin user (consider multi-user auth)
- ⚠️ No rate limiting on login endpoint

### File Operations

- ✅ File streaming proxied through backend
- ✅ Presigned URLs with expiration
- ⚠️ No file type validation on upload
- ⚠️ No virus scanning

### API Security

- ✅ CORS configured
- ✅ Protected routes with auth middleware
- ⚠️ No request size limits (DoS risk)
- ⚠️ No input sanitization on bucket/object names

### Provider Credentials

- ✅ Stored in environment variables
- ✅ Never exposed to frontend
- ⚠️ Logged in plain text if debug enabled
- ⚠️ No encryption at rest

**Recommendations**:

1. Add rate limiting (express-rate-limit)
2. Implement file type validation
3. Add request body size limits
4. Sanitize user inputs
5. Use secrets management (HashiCorp Vault, AWS Secrets Manager)
6. Add audit logging

---

## Troubleshooting

### "Cannot connect to MinIO"

- Check `MINIO_ENDPOINT` and `MINIO_PORT` in `.env`
- Verify MinIO is running: `docker ps` or `curl http://localhost:9000`
- Check network connectivity
- Verify credentials match MinIO configuration

### "Unauthorized" on login

- Check `ADMIN_USER` and `ADMIN_PASS` in `.env`
- Clear browser cookies
- Check backend logs for detailed error

### "Failed to upload file"

- Check `uploads/` directory exists and is writable
- Verify file size under multer limit (default 100MB)
- Check disk space
- Review backend logs for S3 errors

### "Preview not working"

- Verify object exists in bucket
- Check CORS configuration on S3 bucket
- Try direct download first
- Check browser console for errors
- Verify `/api/view` endpoint is accessible

### "Stats not calculating"

- Large buckets take time - check backend logs
- Verify ListObjects permission on provider
- Try refreshing after a few seconds
- Check for API rate limits on provider

### Docker compose fails

- Check port conflicts (3000, 9000, 9001)
- Verify `.env` file exists
- Check Docker daemon is running
- Review logs: `docker-compose logs -f`

---

## Code Conventions

### TypeScript

- Use explicit types, avoid `any`
- Prefer interfaces over types for object shapes
- Use async/await over promises
- Handle errors with try/catch
- Export functions/classes explicitly

### JavaScript (Frontend)

- Use ES6+ features (const/let, arrow functions, destructuring)
- Prefer `const` over `let`
- Use template literals for strings
- Add JSDoc comments for complex functions
- Keep functions small and focused

### File Naming

- **Backend (Clean Architecture)**: kebab-case (e.g., `create-bucket.use-case.ts`, `s3-bucket.repository.ts`)
- **Frontend components**: PascalCase (e.g., `BucketList.js`)
- **Routes**: kebab-case (e.g., `bucket.routes.ts`)
- **Config files**: lowercase with dots (e.g., `tsconfig.json`)

### Git Commits

- Format: `<type>: <description>`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
- Examples:
  - `feat: add Cloudflare R2 support`
  - `fix: correct bucket deletion error handling`
  - `refactor: extract auth logic to middleware`

---

## Future Enhancements

### Planned Features

- [ ] Multi-user authentication with roles
- [ ] Bucket versioning support
- [ ] Object metadata editor
- [ ] Batch operations (copy, move) - _Partial: Delete implemented_
- [ ] Object lifecycle policies
- [ ] Server-side encryption toggle
- [ ] Access logs viewer
- [ ] Webhook notifications
- [ ] CLI tool for automation

### Technical Improvements

- [x] **Add automated tests (Jest, Supertest)** - 32 unit tests with Jest ✅
- [ ] Implement pagination for large buckets
- [ ] Add caching layer (Redis)
- [ ] Websocket for real-time updates
- [ ] GraphQL API option
- [ ] OpenAPI/Swagger documentation
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Distributed tracing
- [ ] Rate limiting
- [ ] Request validation (Zod)

### Completed Enhancements

- [x] **Clean Architecture Migration** (2026-03-05)
  - 4-layer separation (Domain, Application, Infrastructure, Presentation)
  - 14 use cases with single responsibility
  - Repository pattern with dependency injection
  - Kebab-case naming convention

- [x] **Comprehensive Testing Infrastructure** (2026-03-05)
  - Jest configuration with TypeScript
  - MockBucketRepository for test isolation
  - 32 unit tests covering 5/14 use cases
  - Test scripts for watch, coverage, and targeted testing

- [x] **Bug Fixes** (2026-03-05)
  - Fixed folder navigation in Explorer component
  - Updated StorageObject entity to preserve `prefix` field for folders

---

## Resources

### Documentation

- **MinIO SDK**: https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html
- **AWS S3 API**: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html
- **Express.js**: https://expressjs.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Related Projects

- **MinIO**: https://github.com/minio/minio
- **S3 Browser**: https://s3browser.com/
- **Cyberduck**: https://cyberduck.io/

### Support

- **GitHub Issues**: https://github.com/ameth1208/atlas-bucket-manager/issues
- **Author Website**: https://amethgm.com
- **Support**: https://buymeacoffee.com/amethgm

---

## Quick Reference

### Start Development

```bash
npm run dev
# Access: http://localhost:3000
# Login: admin / password (default)
```

### Build Production

```bash
npm run build
npm start
```

### Docker Quick Start

```bash
docker-compose up -d
# Includes MinIO + Manager
```

### Environment Template

```bash
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=password

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Common API Calls

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# List buckets
curl http://localhost:3000/api/buckets -b cookies.txt

# Upload file
curl -X POST http://localhost:3000/api/buckets/minio/my-bucket/upload \
  -F "files=@photo.jpg" \
  -b cookies.txt
```

---

**Last Updated**: 2026-03-05  
**For AI Assistants**: This document provides complete context about the Atlas Bucket Manager project. Use it to understand architecture, locate files, debug issues, and make informed code changes.
