export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarSeed?: string;
  createdAt: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarSeed?: string;
  createdAt: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarSeed?: string;
}
