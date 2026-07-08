import {
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateApiKeyBodyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  scopes!: string;

  @IsOptional()
  @IsString()
  bucketFilter?: string;
}
