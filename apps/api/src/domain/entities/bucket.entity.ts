export interface Bucket {
  name: string;
  providerId: string;
  providerName: string;
  creationDate: Date;
  isPublic: boolean;
  limit?: number;
}

export interface BucketStats {
  totalSize: number;
  totalObjects: number;
  limit?: number;
  providerId: string;
}

export interface CreateBucketInput {
  providerId: string;
  name: string;
}
