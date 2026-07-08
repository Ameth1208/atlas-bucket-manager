export interface ActivityEntry {
  id: number;
  userId?: string;
  actor: string;
  action: string;
  target?: string;
  bucket?: string;
  provider?: string;
  ip?: string;
  statusCode?: number;
  createdAt: number;
}
