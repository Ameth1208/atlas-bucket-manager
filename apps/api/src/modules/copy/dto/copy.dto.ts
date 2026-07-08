import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class StartCopyDto {
  @IsString()
  sourceProviderId!: string;

  @IsString()
  sourceBucket!: string;

  @IsString()
  destProviderId!: string;

  @IsString()
  destBucket!: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}
