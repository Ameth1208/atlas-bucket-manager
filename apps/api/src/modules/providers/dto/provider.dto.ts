import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  scopes!: string;

  @IsOptional()
  @IsString()
  bucketFilter?: string;
}

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

export class CreateBucketDto {
  @IsString()
  providerId!: string;

  @IsString()
  @MinLength(3)
  name!: string;
}

export class UpdateBucketPolicyDto {
  isPublic!: boolean;
}

export class SetBucketLimitDto {
  @IsInt()
  @Min(0)
  limit!: number;
}

export class CreateFolderDto {
  @IsString()
  folderName!: string;

  @IsString()
  @IsOptional()
  prefix?: string;
}
