import { Request, Response } from 'express';
import { StartCopyUseCase } from '../../application/use-cases/copy/start-copy.use-case';
import { GetCopyStatusUseCase } from '../../application/use-cases/copy/get-copy-status.use-case';
import { CancelCopyUseCase } from '../../application/use-cases/copy/cancel-copy.use-case';
import { ListCopyJobsUseCase } from '../../application/use-cases/copy/list-copy-jobs.use-case';
import { DeleteCopyJobUseCase } from '../../application/use-cases/copy/delete-copy-job.use-case';

export class CopyController {
  constructor(
    private startCopyUseCase: StartCopyUseCase,
    private getCopyStatusUseCase: GetCopyStatusUseCase,
    private cancelCopyUseCase: CancelCopyUseCase,
    private listCopyJobsUseCase: ListCopyJobsUseCase,
    private deleteCopyJobUseCase: DeleteCopyJobUseCase
  ) {}

  async startCopy(req: Request, res: Response): Promise<void> {
    try {
      const { sourceProviderId, sourceBucket, targetProviderId, targetBucket, options } = req.body;

      const job = await this.startCopyUseCase.execute({
        sourceProviderId,
        sourceBucket,
        targetProviderId,
        targetBucket,
        options: options || {
          overwrite: false,
          skipExisting: true,
          preserveMetadata: true
        }
      });

      res.json({ success: true, jobId: job.id, job });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const job = await this.getCopyStatusUseCase.execute(jobId);
      res.json({ success: true, job });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async cancelCopy(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      await this.cancelCopyUseCase.execute(jobId);
      res.json({ success: true, message: 'Copy job cancelled' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.listCopyJobsUseCase.execute();
      res.json({ success: true, jobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      await this.deleteCopyJobUseCase.execute(jobId);
      res.json({ success: true, message: 'Copy job deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
