import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InvitesService } from './invites.service';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateInviteDto, AcceptInviteDto } from './dto/invite.dto';

@Controller('invites')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post()
  create(@Body() dto: CreateInviteDto, @CurrentUser() user: AuthUser) {
    const invite = this.invites.create(dto.role, dto.email, user?.userId);
    const url = `/invite?token=${invite.token}`;
    return { invite, url };
  }

  @Get()
  list() {
    return this.invites.list();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invites.remove(id);
  }
}

@Public()
@Controller('invites/public')
export class InvitesPublicController {
  constructor(
    private readonly invites: InvitesService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post(':token/validate')
  validate(@Param('token') token: string) {
    return this.invites.validate(token);
  }

  @Post(':token/accept')
  @HttpCode(HttpStatus.OK)
  async accept(
    @Param('token') token: string,
    @Body() dto: AcceptInviteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = this.invites.accept(token, dto.name, dto.password, dto.email);
    const result = await this.auth.buildResult(user);
    const isProd = this.config.get<string>('nodeEnv') === 'production';
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return user;
  }
}
