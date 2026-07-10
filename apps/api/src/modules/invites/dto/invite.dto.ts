import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInviteDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'editor', 'viewer'])
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export class AcceptInviteDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
