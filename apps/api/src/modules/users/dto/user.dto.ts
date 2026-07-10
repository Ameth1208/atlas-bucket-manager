import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'editor', 'viewer'])
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'editor', 'viewer'])
  role?: 'owner' | 'admin' | 'editor' | 'viewer';

  @IsOptional()
  @IsString()
  avatarSeed?: string;
}
