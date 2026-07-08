import { create } from 'zustand';

interface ThumbnailStore {
  thumbnails: Record<string, string>;
  set: (thumbnails: Record<string, string>) => void;
  add: (key: string, url: string) => void;
  remove: (key: string) => void;
}

export const useThumbnailStore = create<ThumbnailStore>((set) => ({
  thumbnails: {},
  set: (thumbnails) => set({ thumbnails }),
  add: (key, url) => set(state => ({ thumbnails: { ...state.thumbnails, [key]: url } })),
  remove: (key) => set(state => {
    const n = { ...state.thumbnails };
    delete n[key];
    return { thumbnails: n };
  }),
}));
