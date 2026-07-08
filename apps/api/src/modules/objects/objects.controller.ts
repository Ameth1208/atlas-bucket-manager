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
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ObjectsService } from './objects.service';
import { CreateFolderBodyDto, DeleteObjectsDto } from '../buckets/dto/bucket.dto';

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
    @Res() res: Response,
  ) {
    const stream = await this.objects.stream(providerId, bucket, key);
    stream.pipe(res);
  }

  @Delete('buckets/:providerId/:bucket/objects')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Body() dto: DeleteObjectsDto,
  ) {
    return this.objects.delete(providerId, bucket, dto);
  }

  @Post('buckets/:providerId/:bucket/folder')
  @HttpCode(HttpStatus.OK)
  createFolder(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @Body() dto: CreateFolderBodyDto,
  ) {
    return this.objects.createFolder(providerId, bucket, dto);
  }

  @Post('buckets/:providerId/:bucket/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 100 }]))
  upload(
    @Param('providerId') providerId: string,
    @Param('bucket') bucket: string,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body('prefix') prefix?: string,
  ) {
    return this.objects.upload(providerId, bucket, files.files ?? [], prefix ?? '');
  }
}
