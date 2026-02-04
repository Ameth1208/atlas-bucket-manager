import { store } from '../store.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

// --- Delete Modal ---
export function openDeleteModal(name) {
    store.bucketToDelete = name;
    document.getElementById('modalBucketName').innerText = name;
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modalBackdrop').classList.replace('opacity-0', 'opacity-100');
        document.getElementById('modalPanel').classList.replace('opacity-0', 'opacity-100');
        document.getElementById('modalPanel').classList.replace('scale-95', 'scale-100');
    }, 10);
}

export function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    document.getElementById('modalBackdrop').classList.replace('opacity-100', 'opacity-0');
    document.getElementById('modalPanel').classList.replace('opacity-100', 'opacity-0');
    document.getElementById('modalPanel').classList.replace('scale-100', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        store.bucketToDelete = null;
    }, 300);
}

// --- Preview Modal ---
export async function openPreview(bucket, file) {
    try {
        const { url } = await api.getUrl(bucket, file);
        const ext = file.split('.').pop().toLowerCase();
        const content = document.getElementById('previewContent');
        const name = document.getElementById('previewName');
        const btn = document.getElementById('previewDownloadBtn');
        
        name.innerText = file;
        btn.href = url;
        
        if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            content.innerHTML = `<img src="${url}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">`;
        } else if (['mp4', 'webm'].includes(ext)) {
            content.innerHTML = `<video src="${url}" controls class="max-w-full max-h-full rounded-lg shadow-2xl"></video>`;
        } else if (ext === 'pdf') {
            content.innerHTML = `<iframe src="${url}" class="w-full h-[70vh] rounded-lg border-0 shadow-2xl"></iframe>`;
        } else {
            content.innerHTML = `
                <div class="flex flex-col items-center gap-4 p-12 bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-2xl">
                    <iconify-icon icon="ph:file-dashed-duotone" width="80" class="text-slate-300"></iconify-icon>
                    <p class="text-slate-500 font-medium">No preview available for this file type.</p>
                </div>`;
        }
        
        document.getElementById('previewModal').classList.remove('hidden');
    } catch(e) { 
        showToast('Preview failed', 'error'); 
    }
}

export function closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
    document.getElementById('previewContent').innerHTML = '';
}
