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
import { CopyService } from './copy.service';
import { StartCopyDto } from './dto/copy.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ScopesGuard, RequireScope } from '../../common/guards/scopes.guard';

@Controller('copy')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class CopyController {
  constructor(private readonly copy: CopyService) {}

  @Get('jobs')
  list() {
    return this.copy.list();
  }

  @Get('jobs/:id')
  get(@Param('id') id: string) {
    return this.copy.get(id);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ScopesGuard)
  @RequireScope('write')
  start(@Body() dto: StartCopyDto, @CurrentUser() user: AuthUser) {
    return this.copy.start(dto, user?.email);
  }

  @Post('jobs/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ScopesGuard)
  @RequireScope('write')
  async cancel(@Param('id') id: string) {
    return this.copy.cancel(id);
  }

  @Delete('jobs/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ScopesGuard)
  @RequireScope('write')
  async remove(@Param('id') id: string) {
    return this.copy.delete(id);
  }
}
