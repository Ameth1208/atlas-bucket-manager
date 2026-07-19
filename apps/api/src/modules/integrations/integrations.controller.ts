import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { IntegrationsService, Webhook } from './integrations.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, IsUrl, IsIn } from 'class-validator';

class CreateWebhookDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(['upload', 'delete', 'bucket.create', 'bucket.delete', 'clone'], { each: true })
  events!: string[];
}

class UpdateNotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  onUpload?: boolean;

  @IsOptional()
  @IsBoolean()
  onDelete?: boolean;
}

@Controller('integrations')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get('webhooks')
  listWebhooks() {
    return this.integrations.listWebhooks();
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  createWebhook(@Body() dto: CreateWebhookDto, @CurrentUser() user: AuthUser): Webhook {
    return this.integrations.createWebhook(dto.url, dto.events, user);
  }

  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.OK)
  deleteWebhook(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.integrations.deleteWebhook(id, user);
  }

  @Post('webhooks/:id/test')
  @HttpCode(HttpStatus.OK)
  testWebhook(@Param('id') id: string) {
    return this.integrations.testWebhook(id);
  }

  @Get('notifications')
  getNotificationPrefs(@CurrentUser() user: AuthUser) {
    return this.integrations.getNotificationPrefs(user);
  }

  @Put('notifications')
  @HttpCode(HttpStatus.OK)
  updateNotificationPrefs(
    @Body() dto: UpdateNotificationPrefsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.integrations.updateNotificationPrefs(user, dto);
  }
}
