import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BucketsService } from './buckets.service';
import {
  CreateBucketDto,
  SetBucketLimitDto,
  UpdateBucketPolicyDto,
} from './dto/bucket.dto';

@Controller('buckets')
export class BucketsController {
  constructor(private readonly buckets: BucketsService) {}

  @Get()
  list() {
    return this.buckets.list();
  }

  @Post()
  create(@Body() dto: CreateBucketDto) {
    return this.buckets.create(dto);
  }

  @Delete(':providerId/:name')
  @HttpCode(HttpStatus.OK)
  remove(@Param('providerId') providerId: string, @Param('name') name: string) {
    return this.buckets.remove(providerId, name);
  }

  @Put(':providerId/:name/policy')
  @HttpCode(HttpStatus.OK)
  setPolicy(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
    @Body() dto: UpdateBucketPolicyDto,
  ) {
    return this.buckets.setVisibility(providerId, name, dto.isPublic);
  }

  @Put(':providerId/:name/limit')
  @HttpCode(HttpStatus.OK)
  setLimit(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
    @Body() dto: SetBucketLimitDto,
  ) {
    return this.buckets.setLimit(providerId, name, dto);
  }

  @Get(':providerId/:name/stats')
  stats(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
  ) {
    return this.buckets.stats(providerId, name);
  }
}
