export interface StorageObject {
  key: string;
  size: number;
  lastModified?: string;
  etag?: string;
  isFolder?: boolean;
}

export interface SearchResult extends StorageObject {
  bucket: string;
  providerId: string;
  providerName: string;
}
