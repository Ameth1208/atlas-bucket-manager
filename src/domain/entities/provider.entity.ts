export interface Provider {
  id: string;
  name: string;
  kind?: string;
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
}
