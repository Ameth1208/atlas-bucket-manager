import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(['minio', 'aws', 'r2', 'spaces', 'wasabi', 's3'])
  kind!: 'minio' | 'aws' | 'r2' | 'spaces' | 'wasabi' | 's3';

  @IsString()
  endPoint!: string;

  @IsInt()
  @Min(1)
  port!: number;

  @IsOptional()
  useSSL?: boolean;

  @IsString()
  accessKey!: string;

  @IsString()
  secretKey!: string;

  @IsOptional()
  @IsString()
  region?: string;
}
