import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBucketDto {
  @IsString()
  providerId!: string;

  @IsString()
  name!: string;
}

export class UpdateBucketPolicyDto {
  @IsBoolean()
  isPublic!: boolean;

  @IsOptional()
  public?: boolean;
}

export class SetBucketLimitDto {
  @IsInt()
  @Min(0)
  limit!: number;
}

export class CreateFolderBodyDto {
  @IsString()
  folderName!: string;

  @IsOptional()
  @IsString()
  prefix?: string;
}

export class DeleteObjectsDto {
  @IsArray()
  @IsString({ each: true })
  keys!: string[];
}
