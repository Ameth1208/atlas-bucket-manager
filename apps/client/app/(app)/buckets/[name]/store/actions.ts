import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useURLStore } from './url';
import { useBrowserStore } from './browser';
import { usePreviewStore } from './preview';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];

export const useActionsStore = create(() => ({
  handleDownload: (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const url = `/api/buckets/${providerId}/${encodeURIComponent(bucketName)}/objects/${encodeURIComponent(key)}/stream?download=1`;
    const a = document.createElement('a');
    a.href = url;
    a.download = key.split('/').pop() || key;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  handleDownloadFolder: (folderKey: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const folderName = folderKey.replace(/\/+$/, '').split('/').filter(Boolean).pop() || bucketName;
    toast.info(`Generando archivo ZIP de "${folderName}"...`);
    const url = `/api/buckets/${providerId}/${encodeURIComponent(bucketName)}/zip?prefix=${encodeURIComponent(folderKey)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  handleShare: async (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const shareUrl = `${window.location.origin}/api/public/share/${providerId}/${encodeURIComponent(bucketName)}/${encodeURIComponent(key)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Enlace público copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  },

  handlePreview: (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const objects = useBrowserStore.getState().objects;
    const streamUrl = `/api/buckets/${providerId}/${encodeURIComponent(bucketName)}/objects/${encodeURIComponent(key)}/stream`;
    const shareUrl = `${window.location.origin}/api/public/share/${providerId}/${encodeURIComponent(bucketName)}/${encodeURIComponent(key)}`;
    const obj = objects.find(o => o.key === key);
    usePreviewStore.getState().set({
      url: streamUrl,
      shareUrl,
      key,
      name: key.split('/').pop() || key,
      type: obj?.isFolder ? 'folder' : 'file',
      size: obj?.size || 0,
    });
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
      useBrowserStore.getState().setObjects(
        useBrowserStore.getState().objects.filter(o => o.key !== key)
      );
      useBrowserStore.getState().fetchObjects();
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  loadThumbnail: (key: string) => {
    const { bucketName, providerId } = useURLStore.getState();
    const browser = useBrowserStore.getState();
    if (browser.thumbnails[key] || !providerId) return;
    const ext = key.split('/').pop()?.split('.').pop()?.toLowerCase() || '';
    if (!IMAGE_EXTS.includes(ext)) return;
    const streamUrl = `/api/buckets/${providerId}/${encodeURIComponent(bucketName)}/objects/${encodeURIComponent(key)}/stream`;
    useBrowserStore.getState().addThumbnail(key, streamUrl);
  },
}));
