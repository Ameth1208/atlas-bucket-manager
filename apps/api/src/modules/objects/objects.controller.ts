import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ObjectsService } from './objects.service';
import { CreateFolderBodyDto, DeleteObjectsDto } from '../buckets/dto/bucket.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

function getMimeType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    avif: 'image/avif',
    tiff: 'image/tiff',
    // Documents & Text
    pdf: 'application/pdf',
    txt: 'text/plain; charset=utf-8',
    md: 'text/markdown; charset=utf-8',
    html: 'text/html; charset=utf-8',
    htm: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    ts: 'text/plain; charset=utf-8',
    tsx: 'text/plain; charset=utf-8',
    jsx: 'text/plain; charset=utf-8',
    json: 'application/json; charset=utf-8',
    xml: 'application/xml; charset=utf-8',
    yaml: 'text/yaml; charset=utf-8',
    yml: 'text/yaml; charset=utf-8',
    csv: 'text/csv; charset=utf-8',
    // Media
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    // Archives
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

@Controller()
export class ObjectsController {
  constructor(private readonly objects: ObjectsService) {}

  @Get('buckets/:providerId/:bucket/objects')
  list(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Query('prefix') prefix?: string,
  ) {
    return this.objects.list(providerId, bucket, prefix);
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('bucket') bucket: string,
    @Query('providerId') providerId: string,
  ) {
    return this.objects.search(bucket, providerId, q);
  }

  @Get('objects/types')
  fileTypes() {
    return this.objects.fileTypes();
  }

  @Get('buckets/:providerId/:bucket/objects/:key(*)/url')
  async presigned(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
  ) {
    return this.objects.presignedUrl(providerId, bucket, key);
  }

  @Get('buckets/:providerId/:bucket/objects/:key(*)/stream')
  async stream(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    try {
      const fileName = key.split('/').filter(Boolean).pop() || key;
      const mime = getMimeType(fileName);
      res.setHeader('Content-Type', mime);
      if (download === '1' || download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
      }
      res.setHeader('Cache-Control', 'private, max-age=3600');

      const stream = await this.objects.stream(providerId, bucket, key);
      stream.pipe(res);
    } catch {
      if (!res.headersSent) {
        throw new NotFoundException('Object not found');
      }
    }
  }

  @Get('buckets/:providerId/:bucket/zip')
  async downloadZip(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Query('prefix') prefix: string = '',
    @Res() res: Response,
  ) {
    await this.objects.downloadZip(providerId, bucket, prefix, res);
  }

  @Public()
  @Get(['public/share/:providerId/:bucket/:key(*)', 'public/share/:providerId/:bucket/objects/:key(*)'])
  async publicStream(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    try {
      const fileName = key.split('/').filter(Boolean).pop() || key;
      const mime = getMimeType(fileName);
      res.setHeader('Content-Type', mime);
      if (download === '1' || download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const stream = await this.objects.stream(providerId, bucket, key);
      stream.pipe(res);
    } catch {
      if (!res.headersSent) {
        throw new NotFoundException('Shared object not found');
      }
    }
  }

  @Delete('buckets/:providerId/:bucket/objects')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'editor')
  remove(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Body() dto: DeleteObjectsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.objects.delete(providerId, bucket, dto, user?.email);
  }

  @Post('buckets/:providerId/:bucket/folder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'editor')
  createFolder(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Body() dto: CreateFolderBodyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.objects.createFolder(providerId, bucket, dto, user?.email);
  }

  @Post('buckets/:providerId/:bucket/upload')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'editor')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 100 }], {
      limits: { fileSize: 500 * 1024 * 1024, files: 100 },
    }),
  )
  upload(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body('prefix') prefix?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.objects.upload(providerId, bucket, files.files ?? [], prefix ?? '', user?.email);
  }
}
