import { create } from 'zustand';

interface PreviewFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface PreviewStore {
  file: PreviewFile | null;
  set: (f: PreviewFile | null) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  file: null,
  set: (file) => set({ file }),
}));
