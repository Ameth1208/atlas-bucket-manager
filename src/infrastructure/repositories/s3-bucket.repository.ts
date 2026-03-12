import * as Minio from 'minio';
import { IBucketRepository } from '../../domain/repositories/bucket.repository.interface';
import { Bucket, BucketStats } from '../../domain/entities/bucket.entity';
import { StorageObject, SearchResult } from '../../domain/entities/object.entity';
import { Provider, ProviderInfo } from '../../domain/entities/provider.entity';

export class S3BucketRepository implements IBucketRepository {
  private clients: Map<string, Minio.Client> = new Map();
  private providerConfigs: Map<string, Provider> = new Map();

  constructor(providers: Provider[]) {
    console.log(`🔌 Initializing S3 Bucket Repository...`);
    providers.forEach(p => {
      try {
        if (!p.accessKey || !p.secretKey) {
          console.warn(`   - Skipping Provider: ${p.name} (${p.id}) - Missing Credentials`);
          return;
        }
        const client = new Minio.Client({
          endPoint: p.endPoint,
          port: p.port,
          useSSL: p.useSSL,
          accessKey: p.accessKey,
          secretKey: p.secretKey,
          ...(p.region && { region: p.region })
        });
        this.clients.set(p.id, client);
        this.providerConfigs.set(p.id, p);
        console.log(`   - Added Provider: ${p.name} (${p.id}) ✅`);
      } catch (err: any) {
        console.error(`   - Failed to initialize Provider: ${p.name} (${p.id}):`, err.message);
      }
    });
  }

  private getClient(providerId: string): Minio.Client {
    const client = this.clients.get(providerId);
    if (!client) throw new Error(`Provider ${providerId} not found`);
    return client;
  }

  getActiveProviders(): ProviderInfo[] {
    return Array.from(this.providerConfigs.values()).map(p => ({
      id: p.id,
      name: p.name
    }));
  }

  async listBuckets(): Promise<Bucket[]> {
    const allBuckets: Bucket[] = [];
    
    for (const [id, client] of this.clients.entries()) {
      const buckets = await client.listBuckets();
      const providerName = this.providerConfigs.get(id)!.name;

      const bucketInfos = await Promise.all(buckets.map(async (bucket) => {
        let isPublic = false;
        try {
          const policyStr = await client.getBucketPolicy(bucket.name);
          if (policyStr) {
            const policy = JSON.parse(policyStr);
            isPublic = policy.Statement?.some((stmt: any) => 
              stmt.Effect === 'Allow' && 
              stmt.Principal?.AWS?.includes('*') &&
              stmt.Action?.includes('s3:GetObject')
            );
          }
        } catch { isPublic = false; }

        return {
          name: bucket.name,
          creationDate: bucket.creationDate,
          isPublic,
          providerId: id,
          providerName
        };
      }));
      allBuckets.push(...bucketInfos);
    }
    return allBuckets;
  }

  async createBucket(providerId: string, bucketName: string): Promise<void> {
    const client = this.getClient(providerId);
    const conf = this.providerConfigs.get(providerId)!;
    
    console.log(`[S3Repository] Creating bucket "${bucketName}" on provider "${providerId}"...`);
    await client.makeBucket(bucketName, conf.region || '');
  }

  async deleteBucket(providerId: string, bucketName: string): Promise<void> {
    await this.getClient(providerId).removeBucket(bucketName);
  }

  async setBucketVisibility(providerId: string, bucketName: string, isPublic: boolean): Promise<void> {
    const client = this.getClient(providerId);
    if (isPublic) {
      const policy = {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }]
      };
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
    } else {
      await client.setBucketPolicy(bucketName, "");
    }
  }

  async getBucketStats(providerId: string, bucketName: string): Promise<BucketStats> {
    const client = this.getClient(providerId);
    return new Promise((resolve, reject) => {
      let size = 0;
      let count = 0;
      const stream = client.listObjectsV2(bucketName, '', true);
      stream.on('data', (obj) => {
        size += obj.size || 0;
        count++;
      });
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve({ size, count }));
    });
  }

  async listObjects(providerId: string, bucketName: string, prefix: string = ''): Promise<StorageObject[]> {
    const client = this.getClient(providerId);
    return new Promise((resolve, reject) => {
      const objects: any[] = [];
      const stream = client.listObjectsV2(bucketName, prefix, false, '/');
      stream.on('data', (obj) => {
        // If it's a folder (prefix), preserve both name and prefix for compatibility
        if (obj.prefix) {
          objects.push({
            name: obj.prefix,
            prefix: obj.prefix,
            size: 0,
            lastModified: new Date(),
            isFolder: true
          });
        } else {
          // It's a file
          objects.push({
            name: obj.name || '',
            size: obj.size || 0,
            lastModified: obj.lastModified || new Date(),
            isFolder: false,
            ...(obj.etag && { etag: obj.etag })
          });
        }
      });
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(objects));
    });
  }

  async uploadFile(providerId: string, bucketName: string, objectName: string, filePath: string): Promise<void> {
    await this.getClient(providerId).fPutObject(bucketName, objectName, filePath);
  }

  async deleteObjects(providerId: string, bucketName: string, objectNames: string[]): Promise<void> {
    await this.getClient(providerId).removeObjects(bucketName, objectNames);
  }

  async createFolder(providerId: string, bucketName: string, folderPath: string): Promise<void> {
    const client = this.getClient(providerId);
    const name = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    await client.putObject(bucketName, name, Buffer.alloc(0));
  }

  async searchObjects(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    for (const [id, client] of this.clients.entries()) {
      const buckets = await client.listBuckets();
      await Promise.all(buckets.map(async (bucket) => {
        return new Promise<void>((resolve) => {
          const stream = client.listObjectsV2(bucket.name, '', true);
          stream.on('data', (obj) => {
            if (obj.name && obj.name.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                bucket: bucket.name,
                object: obj.name,
                providerId: id,
                size: obj.size || 0,
                lastModified: obj.lastModified || new Date()
              });
            }
          });
          stream.on('error', () => resolve());
          stream.on('end', () => resolve());
        });
      }));
    }
    return results;
  }

  async getPresignedUrl(providerId: string, bucketName: string, objectName: string, expiry: number = 3600): Promise<string> {
    return await this.getClient(providerId).presignedGetObject(bucketName, objectName, expiry);
  }

  async getObjectStream(providerId: string, bucketName: string, objectName: string): Promise<any> {
    return await this.getClient(providerId).getObject(bucketName, objectName);
  }

  async objectExists(providerId: string, bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.getClient(providerId).statObject(bucketName, objectName);
      return true;
    } catch (err: any) {
      if (err.code === 'NotFound') {
        return false;
      }
      throw err;
    }
  }

  async uploadStream(providerId: string, bucketName: string, objectName: string, stream: any, size: number): Promise<void> {
    await this.getClient(providerId).putObject(bucketName, objectName, stream, size);
  }
}
