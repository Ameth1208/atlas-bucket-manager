import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService, FavoriteKey } from './favorites.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { IsString, MinLength } from 'class-validator';

class AddFavoriteDto {
  @IsString()
  @MinLength(1)
  providerId!: string;

  @IsString()
  @MinLength(1)
  bucketName!: string;
}

@Controller('favorites')
@UseGuards(RolesGuard)
@Roles('owner', 'admin', 'editor', 'viewer')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favorites.list(user);
  }

  @Post()
  add(@Body() dto: AddFavoriteDto, @CurrentUser() user: AuthUser) {
    return this.favorites.add(user, { providerId: dto.providerId, bucketName: dto.bucketName });
  }

  @Delete(':providerId/:bucketName')
  remove(
    @Param('providerId') providerId: string,
    @Param('bucketName') bucketName: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.favorites.remove(user, { providerId, bucketName });
  }
}
