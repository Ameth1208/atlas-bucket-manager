import { store } from '../store.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

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
        content.innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop" width="48" class="text-white/50"></iconify-icon>'; // Loading state
        
        document.getElementById('previewModal').classList.remove('hidden');

        // Preload image to avoid layout shift
        if(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            const img = new Image();
            img.onload = () => {
                content.innerHTML = `<img src="${url}" class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-fade-in">`;
            };
            img.src = url;
        } else if (['mp4', 'webm'].includes(ext)) {
            content.innerHTML = `<video src="${url}" controls autoplay class="max-w-full max-h-[75vh] rounded-lg shadow-2xl focus:outline-none"></video>`;
        } else if (ext === 'pdf') {
            content.innerHTML = `<iframe src="${url}" class="w-full h-[75vh] rounded-lg border-0 shadow-2xl bg-white"></iframe>`;
        } else {
            content.innerHTML = `
                <div class="flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl animate-fade-in text-center">
                    <div class="p-4 bg-white/10 rounded-full">
                        <iconify-icon icon="ph:file-dashed-duotone" width="64" class="text-white/70"></iconify-icon>
                    </div>
                    <div>
                        <h3 class="text-white text-lg font-bold">No preview available</h3>
                        <p class="text-white/50 text-sm mt-1">Please download the file to view it.</p>
                    </div>
                </div>`;
        }
        
    } catch(e) { 
        showToast('Preview failed', 'error'); 
        closePreview();
    }
}

export function closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('previewContent').innerHTML = '';
    }, 200);
}