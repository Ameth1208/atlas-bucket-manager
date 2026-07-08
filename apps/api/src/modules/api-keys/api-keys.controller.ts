import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyBodyDto } from './dto/api-key.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api-keys')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class ApiKeysController {
  constructor(private readonly keys: ApiKeysService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.keys.list(user);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateApiKeyBodyDto,
  ) {
    return this.keys.create(user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  revoke(@Param('id') id: string) {
    return this.keys.revoke(id);
  }
}
