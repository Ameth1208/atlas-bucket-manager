import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
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
  constructor(private readonly invites: InvitesService) {}

  @Post(':token/validate')
  validate(@Param('token') token: string) {
    return this.invites.validate(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invites.accept(token, dto.name, dto.password, dto.email);
  }
}
