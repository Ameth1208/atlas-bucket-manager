export interface Bucket {
  name: string;
  providerId: string;
  providerName: string;
  creationDate: Date;
  isPublic: boolean;
}

export interface BucketStats {
  size: number;
  count: number;
}
