export interface StorageObject {
  name: string;
  size: number;
  lastModified: Date;
  isFolder: boolean;
  etag?: string | undefined;
}

export interface SearchResult {
  bucket: string;
  object: string;
  providerId: string;
  size: number;
  lastModified: Date;
}
