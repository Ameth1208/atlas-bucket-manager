import { create } from 'zustand';

interface BucketUIStore {
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  newFolderOpen: boolean;
  setNewFolderOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  deleteConfirmKey: string | null;
  setDeleteConfirmKey: (key: string | null) => void;
}

export const useBucketUIStore = create<BucketUIStore>((set) => ({
  uploadOpen: false,
  setUploadOpen: (open) => set({ uploadOpen: open }),
  newFolderOpen: false,
  setNewFolderOpen: (open) => set({ newFolderOpen: open }),
  newFolderName: '',
  setNewFolderName: (name) => set({ newFolderName: name }),
  deleteConfirmKey: null,
  setDeleteConfirmKey: (key) => set({ deleteConfirmKey: key }),
}));
