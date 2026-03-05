import { Request, Response } from 'express';
import fs from 'fs';
import { ListObjectsUseCase } from '../../application/use-cases/object/list-objects.use-case';
import { UploadFileUseCase } from '../../application/use-cases/object/upload-file.use-case';
import { DeleteObjectsUseCase } from '../../application/use-cases/object/delete-objects.use-case';
import { CreateFolderUseCase } from '../../application/use-cases/object/create-folder.use-case';
import { SearchObjectsUseCase } from '../../application/use-cases/object/search-objects.use-case';
import { GetPresignedUrlUseCase } from '../../application/use-cases/object/get-presigned-url.use-case';
import { GetObjectStreamUseCase } from '../../application/use-cases/object/get-object-stream.use-case';
import { GetBucketStatsUseCase } from '../../application/use-cases/bucket/get-bucket-stats.use-case';

export class ObjectController {
  constructor(
    private listObjectsUseCase: ListObjectsUseCase,
    private uploadFileUseCase: UploadFileUseCase,
    private deleteObjectsUseCase: DeleteObjectsUseCase,
    private createFolderUseCase: CreateFolderUseCase,
    private searchObjectsUseCase: SearchObjectsUseCase,
    private getPresignedUrlUseCase: GetPresignedUrlUseCase,
    private getObjectStreamUseCase: GetObjectStreamUseCase,
    private getBucketStatsUseCase: GetBucketStatsUseCase
  ) {}

  listObjects = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    const prefix = (req.query.prefix as string) || '';
    
    const objects = await this.listObjectsUseCase.execute(providerId, name, prefix);
    res.json(objects);
  };

  getStats = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    
    const stats = await this.getBucketStatsUseCase.execute(providerId, name);
    res.json(stats);
  };

  getUrl = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const name = req.params.name as string;
    const objectName = req.params.objectName as string;
    const expiry = parseInt(req.query.expiry as string) || 3600;
    
    const url = await this.getPresignedUrlUseCase.execute(providerId, name, objectName, expiry);
    res.json({ url });
  };

  upload = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const bucketName = req.params.name as string;
    const prefix = (req.body.prefix as string) || '';
    const files = req.files as Express.Multer.File[];

    if (files) {
      for (const file of files) {
        const objectName = prefix ? `${prefix}${file.originalname}` : file.originalname;
        await this.uploadFileUseCase.execute({
          providerId,
          bucketName,
          objectName,
          filePath: file.path
        });
        fs.unlinkSync(file.path);
      }
    }
    res.json({ success: true });
  };

  createFolder = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const bucketName = req.params.name as string;
    const { folderName, prefix } = req.body;
    
    const fullPath = prefix ? `${prefix}${folderName}/` : `${folderName}/`;
    await this.createFolderUseCase.execute(providerId, bucketName, fullPath);
    res.json({ success: true });
  };

  deleteObjects = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const bucketName = req.params.name as string;
    const { objects } = req.body;
    
    await this.deleteObjectsUseCase.execute(providerId, bucketName, objects);
    res.json({ success: true });
  };

  view = async (req: Request, res: Response) => {
    const providerId = req.params.providerId as string;
    const bucketName = req.params.bucket as string;
    const objectName = req.query.file as string;
    
    const stream = await this.getObjectStreamUseCase.execute(providerId, bucketName, objectName);
    
    const ext = objectName.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = { 
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 
      'webp': 'image/webp', 'svg': 'image/svg+xml', 'mp4': 'video/mp4', 'webm': 'video/webm', 
      'mov': 'video/quicktime', 'mkv': 'video/x-matroska', 'mp3': 'audio/mpeg', 
      'wav': 'audio/wav', 'ogg': 'audio/ogg', 'flac': 'audio/flac', 'm4a': 'audio/mp4',
      'pdf': 'application/pdf', 'apk': 'application/vnd.android.package-archive'
    };

    if (ext && mimeMap[ext]) {
      res.setHeader('Content-Type', mimeMap[ext]);
    }
    
    stream.pipe(res);
  };

  search = async (req: Request, res: Response) => {
    const query = (req.query.q as string) || '';
    const results = await this.searchObjectsUseCase.execute(query);
    res.json(results);
  };
}
