import { create } from 'zustand';

interface URLStore {
  bucketName: string;
  providerId: string;
  init: (bucketName: string, providerId: string) => void;
}

export const useURLStore = create<URLStore>((set) => ({
  bucketName: '',
  providerId: '',
  init: (bucketName, providerId) => set({ bucketName, providerId }),
}));
