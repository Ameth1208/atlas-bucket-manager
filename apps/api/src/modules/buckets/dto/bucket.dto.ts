import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBucketDto {
  @IsString()
  providerId!: string;

  @IsString()
  name!: string;

  // Stored as bytes server-side. Accepts either a raw byte count (when unit='B')
  // or a value in the declared unit (default 'MB' to match the UI presets).
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1024 * 1024 * 1024 * 1024) // 1 TB cap
  @Transform(({ obj, value }) => {
    if (value === undefined || value === null) return undefined;
    const unit = (obj.limitUnit as string) || 'MB';
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return value;
    switch (unit) {
      case 'B': return Math.round(n);
      case 'KB': return Math.round(n * 1024);
      case 'MB': return Math.round(n * 1024 * 1024);
      case 'GB': return Math.round(n * 1024 * 1024 * 1024);
      case 'TB': return Math.round(n * 1024 * 1024 * 1024 * 1024);
      default: return Math.round(n);
    }
  })
  limit?: number;

  @IsOptional()
  @IsIn(['B', 'KB', 'MB', 'GB', 'TB'])
  limitUnit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB';
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
  @Max(1024 * 1024 * 1024 * 1024)
  @Transform(({ obj, value }) => {
    if (value === undefined || value === null) return value;
    const unit = (obj.unit as string) || 'B';
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return value;
    switch (unit) {
      case 'B': return Math.round(n);
      case 'KB': return Math.round(n * 1024);
      case 'MB': return Math.round(n * 1024 * 1024);
      case 'GB': return Math.round(n * 1024 * 1024 * 1024);
      case 'TB': return Math.round(n * 1024 * 1024 * 1024 * 1024);
      default: return Math.round(n);
    }
  })
  limit!: number;

  @IsOptional()
  @IsIn(['B', 'KB', 'MB', 'GB', 'TB'])
  unit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB';
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
