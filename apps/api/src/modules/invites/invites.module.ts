import { Module } from '@nestjs/common';
import { INVITE_REPOSITORY } from '../../domain/repositories/invite.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { SqliteInviteRepository } from '../../infrastructure/database/repositories/sqlite-invite.repository';
import { InvitesController, InvitesPublicController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  controllers: [InvitesController, InvitesPublicController],
  providers: [
    InvitesService,
    { provide: INVITE_REPOSITORY, useClass: SqliteInviteRepository },
  ],
  exports: [InvitesService],
})
export class InvitesModule {}
