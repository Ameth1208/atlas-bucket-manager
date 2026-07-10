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
  UseGuards,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/provider.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('providers')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get()
  list() {
    return this.providers.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.providers.get(id);
  }

  @Post()
  async create(@Body() dto: CreateProviderDto, @CurrentUser() user: AuthUser) {
    return this.providers.create(dto, user?.email);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateProviderDto, @CurrentUser() user: AuthUser) {
    return this.providers.update(id, dto, user?.email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.providers.remove(id, user?.email);
  }
}
