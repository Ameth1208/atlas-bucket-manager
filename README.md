# 🪣 Atlas Bucket Manager

> A high-performance, unified Multi-Cloud UI for managing S3-compatible storage (MinIO, AWS S3, R2, Spaces).

![Atlas Manager](public/atlas-portada.png)

Atlas is a lightweight, secure, and modern web interface designed to bridge the gap between local development and cloud production. Manage visibility, explore files, and perform global searches across all your storage providers in one unified place.

---

## ✨ Multi-Cloud Features

- **🌐 Unified Dashboard**: View buckets from MinIO and AWS S3 in a single view with provider-specific badges.
- **🔍 Global Search**: Search for any file across **all buckets and all providers** at the same time.
- **🛡️ Secure Preview Tunnel**: Preview private images, videos, audio (with integrated player), and PDFs through an internal proxy. No need to expose ports or deal with CORS.
- **📤 Bulk Operations**: Support for multi-file upload and bulk deletion.
- **🔗 Smart Share Links**: Generate temporary download links with custom expiration (1m to 7 days).
- **📊 Storage Stats**: Instant calculation of total size and object count per bucket.
- **🌍 Multi-language**: 🇺🇸 EN, 🇪🇸 ES, 🇧🇷 PT, 🇫🇷 FR, 🇯🇵 JP, 🇨🇳 ZH.
- **🌗 Modern UI**: Fully persistent Dark/Light mode and mobile-responsive design.

---

## 🔌 Supported Providers

### Available Now (v0.0.3) ✅

- **MinIO** (Amazon S3 compatible)
- **AWS S3** (Amazon Web Services)
- **Cloudflare R2**
- **DigitalOcean Spaces**
- **Wasabi Hot Cloud Storage**
- **Any S3-Compatible API**

### Coming Soon (Roadmap) 🚀

- **Google Cloud Storage (GCS)**
- **Azure Blob Storage**
- **Backblaze B2**
- **Oracle Cloud Storage**

---

## 🚀 Quick Start (Production)

### 1. Create a `docker-compose.yml`

```yaml
version: "3.8"

services:
  atlas-manager:
    image: ghcr.io/ameth1208/atlas-bucket-manager:latest
    container_name: atlas-manager
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: always
```

### 2. Configure Credentials (`.env`)

```bash
# App Credentials
ADMIN_USER=admin
ADMIN_PASS=password

# Provider 1: MinIO
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_key
MINIO_SECRET_KEY=your_secret

# Provider 2: AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
```

### 3. Run

```bash
docker-compose up -d
```

Visit `http://localhost:3000`. 🎉

---

## ☕ Support

If you find this project useful, consider buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/amethgmc)

---

## 🛠️ Development

1.  **Clone:** `git clone https://github.com/ameth1208/atlas-bucket-manager.git`
2.  **Install:** `npm install`
3.  **Build & Run:** `npm run build && npm start`

---

&copy; 2026 [Ameth Galarcio](https://amethgm.com). Open Source under MIT License.
