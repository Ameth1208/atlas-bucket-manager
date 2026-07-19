import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AcceptPasswordResetDto } from './dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(RolesGuard)
@Roles('owner', 'admin')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.users.create(dto, user?.email);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.users.update(id, dto, user?.email);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.users.resetPassword(id, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.users.remove(id, user?.email);
  }

  @Delete('me')
  deleteSelf(@CurrentUser() user: AuthUser) {
    return this.users.deleteSelf(user);
  }
}

@Public()
@Controller('users/public')
export class UsersPublicController {
  constructor(private readonly users: UsersService) {}

  @Post('reset-password/accept')
  acceptReset(@Body() dto: AcceptPasswordResetDto) {
    return this.users.acceptPasswordReset(dto.token, dto.password);
  }
}
