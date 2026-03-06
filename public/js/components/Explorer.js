import { store } from '/js/store.js';
import { api } from '/js/api.js';
import { openPreview } from '/js/components/Modals.js';
import { showToast } from '/js/utils.js';
import { initTooltips } from '/js/components/Tooltip.js';

let selectedObjects = new Set();
let shareTarget = null;

export async function openExplorer(providerId, name, prefix = '') {
    try {
        
        
        if (!providerId || !name) {
            console.error('Invalid parameters:', { providerId, name });
            showToast('Invalid bucket selection', 'error');
            return;
        }

        store.currentProviderId = providerId.trim();
        store.currentBucket = name.trim();
        store.currentPrefix = prefix;
        
        // UI Clean up
        const searchResults = document.getElementById('searchResults');
        if (searchResults) searchResults.classList.add('hidden');
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.value = '';

        const titleEl = document.getElementById('explorerTitle');
        if (titleEl) titleEl.innerText = name;
        
        // Switch Views
        const listView = document.getElementById('bucketListView');
        const explorerView = document.getElementById('explorerView');
        
        if (listView && explorerView) {
            listView.classList.add('hidden');
            explorerView.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Update URL for SPA
        const newPath = `/manager/${providerId}/${name}/files/${prefix}`;
        if (window.location.pathname !== newPath) {
            window.history.pushState({ providerId, name, prefix, type: 'explorer' }, '', newPath);
        }

        await renderExplorerContent();
    } catch (err) {
        console.error('Failed to open explorer:', err);
        showToast('Failed to open explorer', 'error');
    }
}

export function closeExplorer() {
    const listView = document.getElementById('bucketListView');
    const explorerView = document.getElementById('explorerView');
    
    if (listView && explorerView) {
        listView.classList.remove('hidden');
        explorerView.classList.add('hidden');
        if (window.location.pathname !== '/manager') {
            window.history.pushState({ type: 'list' }, '', '/manager');
        }
    }
}

export async function navigateExplorer(prefix) {
    store.currentPrefix = prefix;
    const newPath = `/manager/${store.currentProviderId}/${store.currentBucket}/files/${prefix}`;
    window.history.pushState({ 
        providerId: store.currentProviderId, 
        name: store.currentBucket, 
        prefix 
    }, '', newPath);

    await renderExplorerContent();
}

async function renderExplorerContent() {
    console.log(`📂 Rendering Explorer: ${store.currentProviderId}/${store.currentBucket}, prefix: "${store.currentPrefix}"`);
    const prefix = store.currentPrefix;
    selectedObjects.clear();
    updateBulkDeleteUI();
    
    const list = document.getElementById('fileList');
    const bread = document.getElementById('breadcrumbs');
    
    if (!list || !bread) {
        console.error('Explorer elements not found');
        return;
    }

    // Render breadcrumbs
    const parts = prefix.split('/').filter(p => p);
    let path = '';
    bread.innerHTML = '';

    parts.forEach(p => {
        path += p + '/';
        const currentPath = path;
        const span = document.createElement('span');
        span.innerHTML = ` <span class="text-slate-300 dark:text-slate-600">/</span> <span class="cursor-pointer hover:text-rose-500 transition-colors">${p}</span>`;
        span.querySelector('.cursor-pointer').onclick = () => navigateExplorer(currentPath);
        bread.appendChild(span);
    });

    list.innerHTML = '<div class="text-center py-16 flex justify-center text-slate-400"><iconify-icon icon="line-md:loading-twotone-loop" width="40"></iconify-icon></div>';
    
    try {
        const items = await api.listObjects(store.currentProviderId, store.currentBucket, store.currentPrefix);
        
        if (items && items.error) {
            throw new Error(items.error);
        }

        if (!Array.isArray(items)) {
            throw new Error('Invalid response from server');
        }

        list.innerHTML = '';
        const fileCountEl = document.getElementById('fileCount');
        if (fileCountEl) fileCountEl.innerText = `${items.length} items`;

        // Render using Lit <file-list> component with PAGINATION
        await renderExplorerWithLit(items, list);

        initTooltips();

    } catch (err) { 
        console.error('Explorer error:', err);
        list.innerHTML = `<div class="text-center py-12 text-rose-500 text-sm font-medium">Error: ${err.message}</div>`; 
    }
}

/**
 * Render explorer using Lit <file-list> component with PAGINATION (100 items/page)
 * 
 * REQUIRES: <file-list> component to be registered (from /js/main.ts)
 */
async function renderExplorerWithLit(items, container) {
    const prefix = store.currentPrefix;

    // Add "Back" button if not at root
    if (prefix !== '') {
        const parentParts = prefix.split('/').filter(Boolean);
        parentParts.pop();
        const parentPath = parentParts.length > 0 ? parentParts.join('/') + '/' : '';
        
        const back = document.createElement('div');
        back.className = "flex items-center gap-4 p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer text-slate-500 mb-1 transition-all group";
        back.innerHTML = `
            <div class="aspect-square w-10 flex items-center justify-center bg-slate-200/50 dark:bg-dark-700/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                <iconify-icon icon="ph:arrow-u-up-left-bold" width="20"></iconify-icon>
            </div> 
            <span class="text-sm font-bold font-mono">..</span>
        `;
        back.onclick = () => navigateExplorer(parentPath);
        container.appendChild(back);
    }

    // Empty state
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-center py-20 flex flex-col items-center gap-4 text-slate-400 opacity-60"><iconify-icon icon="ph:folder-dashed-duotone" width="48"></iconify-icon><span class="text-sm font-medium tracking-tight">Empty folder</span></div>';
        return;
    }

    // Transform items to match FileList component format
    const fileObjects = items.map(item => ({
        name: item.prefix || item.name,
        size: item.size || 0,
        lastModified: item.lastModified || new Date().toISOString(),
        isFolder: !!item.prefix,
        etag: item.etag
    }));

    // Create and configure <file-list> component
    const fileListComponent = document.createElement('file-list');
    fileListComponent.items = fileObjects;
    fileListComponent.pageSize = 100; // 100 items per page

    // Event listeners
    fileListComponent.addEventListener('navigate', (e) => {
        navigateExplorer(e.detail.path);
    });

    fileListComponent.addEventListener('preview', (e) => {
        window.app.openPreview(store.currentProviderId, store.currentBucket, e.detail.name);
    });

    fileListComponent.addEventListener('share', (e) => {
        window.app.openUrlModal(e.detail.name);
    });

    fileListComponent.addEventListener('download', (e) => {
        window.app.downloadFile(store.currentProviderId, store.currentBucket, e.detail.name);
    });

    fileListComponent.addEventListener('delete', (e) => {
        // Handle single file delete
        if (confirm(`Delete ${e.detail.name}?`)) {
            api.deleteObjects(store.currentProviderId, store.currentBucket, [e.detail.name])
                .then(() => {
                    showToast('Item deleted', 'success');
                    renderExplorerContent();
                })
                .catch(err => showToast('Delete failed', 'error'));
        }
    });

    fileListComponent.addEventListener('selection-change', (e) => {
        // Update selected objects for bulk delete
        selectedObjects = new Set(e.detail.selected);
        updateBulkDeleteUI();
    });

    container.appendChild(fileListComponent);
}

// --- Helper Functions ---
function updateBulkDeleteUI() {
    const btn = document.getElementById('bulkDeleteBtn');
    if (btn) {
        if (selectedObjects.size > 0) {
            btn.classList.remove('hidden');
            btn.innerText = `Delete (${selectedObjects.size})`;
        } else {
            btn.classList.add('hidden');
        }
    }
}

// --- Exported Functions ---
export function toggleSelect(name, e) {
    if (e.target.checked) selectedObjects.add(name);
    else selectedObjects.delete(name);
    updateBulkDeleteUI();
}

export async function bulkDelete() {
    if (selectedObjects.size === 0) return;
    if (!confirm(`Delete ${selectedObjects.size} objects?`)) return;
    
    showToast(`Deleting ${selectedObjects.size} items...`, 'info');
    const res = await api.deleteObjects(store.currentProviderId, store.currentBucket, Array.from(selectedObjects));
    
    if (res.error) showToast(res.error, 'error');
    else {
        showToast('Items deleted', 'success');
        selectedObjects.clear();
        await renderExplorerContent();
    }
}

export async function downloadFile(providerId, bucket, name) {
    try {
        const { url } = await api.getUrl(providerId, bucket, name);
        window.open(url, '_blank');
    } catch (err) {
        showToast('Download failed', 'error');
    }
}

export async function handleUpload(files) {
    if (!files.length) return;
    showToast(`Uploading ${files.length} files...`, 'info');
    try {
        const res = await api.upload(store.currentProviderId, store.currentBucket, files, store.currentPrefix);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Upload complete', 'success');
            await renderExplorerContent();
        }
    } catch (err) {
        showToast('Upload failed', 'error');
    }
}

export async function createFolder() {
    document.getElementById('folderModal').classList.remove('hidden');
    const input = document.getElementById('newFolderName');
    if (input) {
        input.value = '';
        input.focus();
    }
}

export function closeFolderModal() {
    document.getElementById('folderModal').classList.add('hidden');
}

export async function submitFolder() {
    const input = document.getElementById('newFolderName');
    const name = input.value.trim();
    if (!name) return;
    
    showToast('Creating folder...', 'info');
    try {
        const res = await api.createFolder(store.currentProviderId, store.currentBucket, name, store.currentPrefix);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Folder created', 'success');
            closeFolderModal();
            await renderExplorerContent();
        }
    } catch (err) {
        showToast('Failed to create folder', 'error');
    }
}

export function openUrlModal(name) {
    shareTarget = name;
    document.getElementById('urlModal').classList.remove('hidden');
}

export function closeUrlModal() {
    document.getElementById('urlModal').classList.add('hidden');
    document.getElementById('generatedUrlContainer').classList.add('hidden');
    shareTarget = null;
}

export async function generateShareLink() {
    if (!shareTarget) return;
    const expiry = document.getElementById('urlExpiry').value;
    try {
        const { url } = await api.getUrl(store.currentProviderId, store.currentBucket, shareTarget, expiry);
        const input = document.getElementById('generatedUrl');
        const container = document.getElementById('generatedUrlContainer');
        input.value = url;
        container.classList.remove('hidden');
    } catch (err) {
        showToast('Link generation failed', 'error');
    }
}