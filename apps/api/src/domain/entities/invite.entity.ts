export interface Invite {
  id: string;
  token: string;
  email?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  createdBy: string;
  usedAt?: number;
  expiresAt?: number;
  createdAt: number;
}
