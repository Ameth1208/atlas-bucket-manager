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
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
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
    @Res() res: Response,
  ) {
    const stream = await this.objects.stream(providerId, bucket, key);
    stream.pipe(res);
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
