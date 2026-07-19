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
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('buckets')
export class BucketsController {
  constructor(private readonly buckets: BucketsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.buckets.list(user);
  }

  @Get('stats')
  async statsAll(@CurrentUser() user: AuthUser) {
    return this.buckets.statsMany(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  create(@Body() dto: CreateBucketDto, @CurrentUser() user: AuthUser) {
    return this.buckets.create(dto, user?.email);
  }

  @Delete(':providerId/:name')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  remove(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.buckets.remove(providerId, name, user?.email);
  }

  @Put(':providerId/:name/policy')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  setPolicy(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
    @Body() dto: UpdateBucketPolicyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.buckets.setVisibility(providerId, name, dto.isPublic, user?.email);
  }

  @Put(':providerId/:name/limit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  setLimit(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
    @Body() dto: SetBucketLimitDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.buckets.setLimit(providerId, name, dto, user?.email);
  }

  @Get(':providerId/:name/stats')
  stats(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
  ) {
    return this.buckets.stats(providerId, name);
  }

  @Get(':providerId/:name/public-endpoint')
  async publicEndpoint(
    @Param('providerId') providerId: string,
    @Param('name') name: string,
  ) {
    const url = await this.buckets.publicEndpoint(providerId, name);
    return { url };
  }
}
