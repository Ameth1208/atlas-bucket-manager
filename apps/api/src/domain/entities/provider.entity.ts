export interface ProviderInfo {
  id: string;
  name: string;
  kind: 'minio' | 'aws' | 'r2' | 'spaces' | 'wasabi' | 's3';
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
  createdAt?: number;
}

export interface CreateProviderInput {
  name: string;
  kind: ProviderInfo['kind'];
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
}

export interface ProviderCredentials {
  accessKey: string;
  secretKey: string;
}
