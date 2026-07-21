import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useURLStore } from './url';
import { useBrowserStore } from './browser';
import { usePreviewStore } from './preview';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

export const useActionsStore = create(() => ({
  handleDownload: async (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    try {
      const { url } = await api.objects.presignedUrl(bucketName, key, providerId);
      window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  handlePreview: async (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const objects = useBrowserStore.getState().objects;
    try {
      const { url } = await api.objects.presignedUrl(bucketName, key, providerId);
      const obj = objects.find(o => o.key === key);
      usePreviewStore.getState().set({
        url,
        name: key.split('/').pop() || key,
        type: obj?.isFolder ? 'folder' : 'file',
        size: obj?.size || 0,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  handleFiles: (files: FileList | null) => {
    const { bucketName, providerId } = useURLStore.getState();
    const { path } = useBrowserStore.getState();
    if (!files?.length) return;
    const prefix = path.join('/') + (path.length > 0 ? '/' : '');
    api.objects.upload(bucketName, providerId, Array.from(files), prefix)
      .then(() => {
        toast.success('Archivos subidos');
        useBrowserStore.getState().fetchObjects();
      })
      .catch((e: any) => toast.error(e.message));
  },

  handleDelete: async () => {
    const { bucketName, providerId } = useURLStore.getState();
    const { selected } = useBrowserStore.getState();
    if (!selected.size) return;
    try {
      const keys = [...selected];
      await api.objects.delete(bucketName, providerId, keys);
      toast.success(`${keys.length} archivo(s) eliminado(s)`);
      useBrowserStore.getState().setSelected(new Set());
      useBrowserStore.getState().fetchObjects();
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  handleDeleteOne: async (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    try {
      await api.objects.delete(bucketName, providerId, [key]);
      // Update the local store immediately for snappy UI
      useBrowserStore.getState().setObjects(
        useBrowserStore.getState().objects.filter(o => o.key !== key)
      );
      // Then re-fetch to be sure
      useBrowserStore.getState().fetchObjects();
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  loadThumbnail: async (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const browser = useBrowserStore.getState();
    if (browser.thumbnails[key] || !providerId) return;
    // If we've already flagged the provider as failing, don't keep retrying
    // for every object in the bucket. One banner is enough.
    if (browser.thumbnailError) return;
    const ext = key.split('/').pop()?.split('.').pop()?.toLowerCase() || '';
    if (!IMAGE_EXTS.includes(ext)) return;
    try {
      const { url } = await api.objects.presignedUrl(bucketName, key, providerId);
      useBrowserStore.getState().addThumbnail(key, url);
    } catch (e: any) {
      const msg = e?.message || 'No se pudo generar la URL de la miniatura';
      useBrowserStore.getState().setThumbnailError(msg);
      toast.error(msg, {
        id: 'thumbnail-presign-error',
        description: 'Las miniaturas no se pueden cargar. El bucket sigue siendo accesible.',
      });
    }
  },
}));
