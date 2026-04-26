import { Request, Response } from 'express';
import { GetProvidersUseCase } from '../../application/use-cases/bucket/get-providers.use-case';
import { ListBucketsUseCase } from '../../application/use-cases/bucket/list-buckets.use-case';
import { CreateBucketUseCase } from '../../application/use-cases/bucket/create-bucket.use-case';
import { DeleteBucketUseCase } from '../../application/use-cases/bucket/delete-bucket.use-case';
import { UpdateBucketPolicyUseCase } from '../../application/use-cases/bucket/update-bucket-policy.use-case';
import { GetBucketStatsUseCase } from '../../application/use-cases/bucket/get-bucket-stats.use-case';
import { CreateProviderUseCase } from '../../application/use-cases/bucket/create-provider.use-case';

export class BucketController {
  constructor(
    private getProvidersUseCase: GetProvidersUseCase,
    private listBucketsUseCase: ListBucketsUseCase,
    private createBucketUseCase: CreateBucketUseCase,
    private deleteBucketUseCase: DeleteBucketUseCase,
    private updateBucketPolicyUseCase: UpdateBucketPolicyUseCase,
    private getBucketStatsUseCase: GetBucketStatsUseCase,
    private createProviderUseCase: CreateProviderUseCase
  ) {}

  getProviders = (req: Request, res: Response) => {
    try {
      const providers = this.getProvidersUseCase.execute();
      res.json(providers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  createProvider = async (req: Request, res: Response) => {
    try {
      const { name, kind, endpoint, port, ssl, accessKey, secretKey, region } = req.body;
      if (!name || !endpoint || !accessKey || !secretKey) {
        return res.status(400).json({ error: 'name, endpoint, accessKey y secretKey son requeridos' });
      }
      const result = await this.createProviderUseCase.execute({
        name,
        kind: kind || 'minio',
        endpoint,
        port: Number(port) || 9000,
        ssl: Boolean(ssl),
        accessKey,
        secretKey,
        region: region || 'us-east-1',
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  listBuckets = async (req: Request, res: Response) => {
    try {
      const buckets = await this.listBucketsUseCase.execute();
      res.json(buckets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  createBucket = async (req: Request, res: Response) => {
    try {
      const { providerId, name } = req.body;
      await this.createBucketUseCase.execute({ providerId, name });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  updatePolicy = async (req: Request, res: Response) => {
    try {
      const providerId = req.params.providerId as string;
      const name = req.params.name as string;
      const isPublic = req.body.public as boolean;
      await this.updateBucketPolicyUseCase.execute(providerId, name, isPublic);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  deleteBucket = async (req: Request, res: Response) => {
    try {
      const providerId = req.params.providerId as string;
      const name = req.params.name as string;
      await this.deleteBucketUseCase.execute(providerId, name);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const providerId = req.params.providerId as string;
      const name = req.params.name as string;
      const stats = await this.getBucketStatsUseCase.execute(providerId, name);
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
