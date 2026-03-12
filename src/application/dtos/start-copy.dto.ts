export interface StartCopyDto {
  sourceProviderId: string;
  sourceBucket: string;
  targetProviderId: string;
  targetBucket: string;
  options: {
    overwrite: boolean;
    skipExisting: boolean;
    preserveMetadata: boolean;
  };
}
