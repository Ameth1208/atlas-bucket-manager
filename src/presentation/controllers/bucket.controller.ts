import { Request, Response } from 'express';
import { GetProvidersUseCase } from '../../application/use-cases/bucket/get-providers.use-case';
import { ListBucketsUseCase } from '../../application/use-cases/bucket/list-buckets.use-case';
import { CreateBucketUseCase } from '../../application/use-cases/bucket/create-bucket.use-case';
import { DeleteBucketUseCase } from '../../application/use-cases/bucket/delete-bucket.use-case';
import { UpdateBucketPolicyUseCase } from '../../application/use-cases/bucket/update-bucket-policy.use-case';
import { GetBucketStatsUseCase } from '../../application/use-cases/bucket/get-bucket-stats.use-case';

export class BucketController {
  constructor(
    private getProvidersUseCase: GetProvidersUseCase,
    private listBucketsUseCase: ListBucketsUseCase,
    private createBucketUseCase: CreateBucketUseCase,
    private deleteBucketUseCase: DeleteBucketUseCase,
    private updateBucketPolicyUseCase: UpdateBucketPolicyUseCase,
    private getBucketStatsUseCase: GetBucketStatsUseCase
  ) {}

  getProviders = (req: Request, res: Response) => {
    const providers = this.getProvidersUseCase.execute();
    res.json(providers);
  };

  listBuckets = async (req: Request, res: Response) => {
    const buckets = await this.listBucketsUseCase.execute();
    res.json(buckets);
  };

  createBucket = async (req: Request, res: Response) => {
    const { providerId, name } = req.body;
    await this.createBucketUseCase.execute({ providerId, name });
    res.json({ success: true });
  };

  updatePolicy = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    const isPublic = req.body.public as boolean;
    
    await this.updateBucketPolicyUseCase.execute(providerId, name, isPublic);
    res.json({ success: true });
  };

  deleteBucket = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    
    await this.deleteBucketUseCase.execute(providerId, name);
    res.json({ success: true });
  };

  getStats = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    
    const stats = await this.getBucketStatsUseCase.execute(providerId, name);
    res.json(stats);
  };
}
