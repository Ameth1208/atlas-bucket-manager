import { create } from 'zustand';
import { api, StorageObject } from '@/lib/api';
import { useURLStore } from './url';

type Layout = 'grid' | 'list';
type Filter = 'all' | 'image' | 'video' | 'audio' | 'code';

interface BrowserStore {
  objects: StorageObject[];
  isLoading: boolean;
  path: string[];
  layout: Layout;
  filter: Filter;
  search: string;
  selected: Set<string>;
  thumbnails: Record<string, string>;
  setObjects: (objects: StorageObject[]) => void;
  setLoading: (loading: boolean) => void;
  navigate: (folder: string) => void;
  back: (idx: number) => void;
  setLayout: (l: Layout) => void;
  setFilter: (f: Filter) => void;
  setSearch: (s: string) => void;
  setSelected: (s: Set<string>) => void;
  toggleSelect: (key: string) => void;
  fetchObjects: () => Promise<void>;
  setThumbnails: (t: Record<string, string>) => void;
  addThumbnail: (key: string, url: string) => void;
  clearThumbnail: (key: string) => void;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  objects: [],
  isLoading: false,
  path: [],
  layout: 'grid',
  filter: 'all',
  search: '',
  selected: new Set(),
  thumbnails: {},
  setObjects: (objects) => set({ objects }),
  setLoading: (isLoading) => set({ isLoading }),
  navigate: (folder) => {
    set(state => ({
      path: [...state.path, folder],
      selected: new Set(),
    }));
    get().fetchObjects();
  },
  back: (idx) => {
    set(state => ({
      path: state.path.slice(0, idx),
      selected: new Set(),
    }));
    get().fetchObjects();
  },
  setLayout: (layout) => set({ layout }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setSelected: (selected) => set({ selected }),
  toggleSelect: (key) => set(state => {
    const n = new Set(state.selected);
    n.has(key) ? n.delete(key) : n.add(key);
    return { selected: n };
  }),
  setThumbnails: (thumbnails) => set({ thumbnails }),
  addThumbnail: (key, url) => set(state => ({
    thumbnails: { ...state.thumbnails, [key]: url },
  })),
  clearThumbnail: (key) => set(state => {
    const n = { ...state.thumbnails };
    delete n[key];
    return { thumbnails: n };
  }),
  fetchObjects: async () => {
    const { bucketName, providerId } = useURLStore.getState();
    const { path } = get();
    if (!providerId) return;
    const prefix = path.join('/') + (path.length > 0 ? '/' : '');
    set({ isLoading: true });
    try {
      const data = await api.objects.list(bucketName, providerId, prefix);
      set({ objects: data ?? [] });
    } catch {
      set({ objects: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
