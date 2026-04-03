export interface StartCopyDto {
  sourceProviderId: string;
  sourceBucket: string;
  sourcePrefix?: string;
  targetProviderId: string;
  targetBucket: string;
  options: {
    overwrite: boolean;
    skipExisting: boolean;
    preserveMetadata: boolean;
  };
}
