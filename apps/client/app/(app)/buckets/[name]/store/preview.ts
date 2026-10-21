import { create } from 'zustand';

export interface PreviewFile {
  url: string;
  name: string;
  type: string;
  size: number;
  shareUrl?: string;
  key?: string;
}

interface PreviewStore {
  file: PreviewFile | null;
  set: (f: PreviewFile | null) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  file: null,
  set: (file) => set({ file }),
}));
