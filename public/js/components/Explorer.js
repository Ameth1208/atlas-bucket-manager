import { store } from '/js/store.js';
import { api } from '/js/api.js';
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
    console.log(prefix);
    
    const newPath = `/manager/${store.currentProviderId}/${store.currentBucket}/files/${prefix}`;
    window.history.pushState({ 
        providerId: store.currentProviderId, 
        name: store.currentBucket, 
        prefix 
    }, '', newPath);

    await renderExplorerContent();
}

function setupDragDrop(element) {
    // Avoid attaching duplicate listeners
    if (element._dragDropSetup) return;
    element._dragDropSetup = true;

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('ring-2', 'ring-rose-400', 'ring-inset');
    });

    element.addEventListener('dragleave', (e) => {
        if (!element.contains(e.relatedTarget)) {
            element.classList.remove('ring-2', 'ring-rose-400', 'ring-inset');
        }
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('ring-2', 'ring-rose-400', 'ring-inset');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleUpload(files);
        }
    });
}

async function renderExplorerContent() {
    console.log(`📂 Rendering Explorer: ${store.currentProviderId}/${store.currentBucket}, prefix: "${store.currentPrefix}"`);
    const prefix = store.currentPrefix;
    selectedObjects.clear();
    updateBulkDeleteUI();
    
    const list = document.getElementById('fileList');
    const headerContainer = document.getElementById('explorerHeaderContainer');
    
    if (!list) {
        console.error('Explorer fileList element not found');
        return;
    }

    // Update header with Lit component (includes toolbar)
    if (headerContainer) {
        updateExplorerHeader(headerContainer, store.currentBucket, prefix);
    }

    // Drag & drop on the file list container
    setupDragDrop(list);

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

// Update Explorer Header using Lit component (includes toolbar as slot)
function updateExplorerHeader(container, bucketName, prefix) {
    container.innerHTML = '';
    
    const header = document.createElement('explorer-header');
    header.bucketName = bucketName;
    
    // Build breadcrumbs
    const parts = prefix.split('/').filter(p => p);
    let path = '';
    const breadcrumbs = [];
    
    parts.forEach(p => {
        path += p + '/';
        breadcrumbs.push({ name: p, path });
    });
    
    header.breadcrumbs = breadcrumbs;
    
    // Event listeners for header
    header.addEventListener('back', () => {
        closeExplorer();
    });
    
    header.addEventListener('navigate', (e) => {
        navigateExplorer(e.detail.path);
    });
    
    // Set toolbar props directly on header
    header.showBulkDelete = selectedObjects.size > 0;
    header.selectedCount = selectedObjects.size;
    
    // Event listeners for toolbar actions (now in header)
    header.addEventListener('create-folder', () => {
        window.app.createFolder();
    });
    
    header.addEventListener('upload', (e) => {
        window.app.handleUpload(e.detail.files);
    });

    header.addEventListener('upload-folder', (e) => {
        handleFolderUpload(e.detail.files, e.detail.paths);
    });

    header.addEventListener('bulk-delete', () => {
        window.app.bulkDelete();
    });
    
    container.appendChild(header);
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
        // file-list sends { folder: item }, extract the name
        const folderName = e.detail.folder?.name || e.detail.folder?.prefix;
        navigateExplorer(folderName);
    });

    fileListComponent.addEventListener('preview', (e) => {
        // file-list sends { file: item }, extract the name
        const fileName = e.detail.file?.name;
        window.app.openPreview(store.currentProviderId, store.currentBucket, fileName);
    });

    fileListComponent.addEventListener('share', (e) => {
        // file-list sends { file: item }, extract the name
        const fileName = e.detail.file?.name;
        window.app.openUrlModal(fileName);
    });

    fileListComponent.addEventListener('download', (e) => {
        // file-list sends { file: item }, extract the name
        const fileName = e.detail.file?.name;
        window.app.downloadFile(store.currentProviderId, store.currentBucket, fileName);
    });

    fileListComponent.addEventListener('delete', async (e) => {
        // file-list sends { file: item }, extract the name
        const fileName = e.detail.file?.name;
        const ok = await window.app.showConfirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`, { title: 'Delete item', icon: 'ph:trash-bold', danger: true, confirmText: 'Delete' });
        if (ok) {
            api.deleteObjects(store.currentProviderId, store.currentBucket, [fileName])
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

    fileListComponent.addEventListener('copy-folder', (e) => {
        const folderName = e.detail.folder?.name;
        if (window.app.openFolderCopyModal) {
            window.app.openFolderCopyModal(store.currentProviderId, store.currentBucket, folderName);
        }
    });

    // Context menu (right-click)
    fileListComponent.addEventListener('context-menu', (e) => {
        const { item, x, y } = e.detail;
        const menu = document.getElementById('contextMenu');
        if (menu) menu.show(x, y, item, item.isFolder);
    });

    // Render pagination in footer
    renderPaginationInFooter(fileListComponent);

    container.appendChild(fileListComponent);
}

// Render pagination controls in the explorer footer
function renderPaginationInFooter(fileListComponent) {
    const footer = document.getElementById('explorerFooter');
    if (!footer) return;

    // Clear footer first
    footer.innerHTML = '';

    const totalItems = fileListComponent.items.length;
    const pageSize = fileListComponent.pageSize;

    if (totalItems > pageSize) {
        // Create pagination component
        const pagination = document.createElement('pagination-controls');
        pagination.total = totalItems;
        pagination.page = fileListComponent.currentPage || 1;
        pagination.pageSize = pageSize;

        // Listen for page changes
        pagination.addEventListener('page-change', (e) => {
            fileListComponent.currentPage = e.detail.page;
            // Scroll to top of file list
            const fileListContainer = document.getElementById('fileList');
            if (fileListContainer) {
                fileListContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        footer.appendChild(pagination);
    } else {
        // Show item count only if no pagination
        footer.innerHTML = `
            <div class="p-3 flex justify-between items-center">
                <span class="text-xs text-slate-400">${totalItems} ${totalItems === 1 ? 'item' : 'items'}</span>
            </div>
        `;
    }
}

// --- Helper Functions ---
function updateBulkDeleteUI() {
    // Update header component directly (toolbar is now inside header)
    const headerContainer = document.getElementById('explorerHeaderContainer');
    if (headerContainer) {
        const header = headerContainer.querySelector('explorer-header');
        if (header) {
            header.showBulkDelete = selectedObjects.size > 0;
            header.selectedCount = selectedObjects.size;
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
    const ok = await window.app.showConfirm(`Are you sure you want to delete ${selectedObjects.size} item${selectedObjects.size !== 1 ? 's' : ''}? This action cannot be undone.`, { title: 'Delete items', icon: 'ph:trash-bold', danger: true, confirmText: 'Delete' });
    if (!ok) return;
    
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

async function doFolderUpload(files, paths) {
    const uploadId = crypto.randomUUID();
    if (window._socket && window._socket.connected) {
        window._socket.emit('upload:subscribe', uploadId);
    }
    try {
        await api.upload(store.currentProviderId, store.currentBucket, files, store.currentPrefix, uploadId, paths);
        await renderExplorerContent();
    } catch (err) {
        showToast('Folder upload failed', 'error');
    } finally {
        if (window._socket) {
            window._socket.emit('upload:unsubscribe', uploadId);
        }
    }
}

// Called from showDirectoryPicker path — shows our confirm dialog
export async function handleFolderUpload(files, paths) {
    if (!files.length) return;
    const ok = await window.app.showConfirm(
        `${files.length} file${files.length !== 1 ? 's' : ''} will be uploaded to "${store.currentBucket}".`,
        { title: 'Upload folder', icon: 'ph:folder-arrow-up-bold', confirmText: 'Upload' }
    );
    if (!ok) return;
    await doFolderUpload(files, paths);
}

// Called from webkitdirectory fallback — browser already showed its dialog, skip ours
export async function handleFolderUploadDirect(files, paths) {
    if (!files.length) return;
    await doFolderUpload(files, paths);
}

export async function handleUpload(files) {
    if (!files.length) return;

    const ok = await window.app.showConfirm(
        `${files.length} file${files.length !== 1 ? 's' : ''} will be uploaded to "${store.currentBucket}".`,
        { title: 'Upload files', icon: 'ph:upload-simple-bold', confirmText: 'Upload' }
    );
    if (!ok) return;

    const uploadId = crypto.randomUUID();

    // Subscribe to socket before sending the request so we don't miss events
    if (window._socket && window._socket.connected) {
        window._socket.emit('upload:subscribe', uploadId);
    }

    try {
        await api.upload(store.currentProviderId, store.currentBucket, files, store.currentPrefix, uploadId);
        await renderExplorerContent();
    } catch (err) {
        showToast('Upload failed', 'error');
    } finally {
        if (window._socket) {
            window._socket.emit('upload:unsubscribe', uploadId);
        }
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

// --- Keyboard Shortcuts ---
function isExplorerVisible() {
    const view = document.getElementById('explorerView');
    return view && !view.classList.contains('hidden');
}

function getFileListComponent() {
    return document.querySelector('#fileList file-list');
}

document.addEventListener('keydown', async (e) => {
    // Ctrl+K / Cmd+K → open spotlight search (works globally)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.app && window.app.openSpotlight) {
            window.app.openSpotlight();
        }
        return;
    }

    // Ignore shortcuts when typing in an input/textarea
    const tag = (e.target && e.target.tagName) || '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    if (!isExplorerVisible()) return;

    const fileList = getFileListComponent();

    // Delete → delete selected files
    if (e.key === 'Delete' && selectedObjects.size > 0) {
        e.preventDefault();
        await bulkDelete();
    }

    // Ctrl+A / Cmd+A → select all files
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (fileList && fileList.selectAll) {
            fileList.selectAll();
            selectedObjects = new Set(fileList.getSelected());
            updateBulkDeleteUI();
        }
    }

    // Escape → go back one level or close explorer
    if (e.key === 'Escape') {
        e.preventDefault();
        if (store.currentPrefix) {
            const parts = store.currentPrefix.split('/').filter(Boolean);
            parts.pop();
            const parentPath = parts.length > 0 ? parts.join('/') + '/' : '';
            navigateExplorer(parentPath);
        } else {
            closeExplorer();
        }
    }

    // Backspace → navigate to parent folder
    if (e.key === 'Backspace' && store.currentPrefix) {
        e.preventDefault();
        const parts = store.currentPrefix.split('/').filter(Boolean);
        parts.pop();
        const parentPath = parts.length > 0 ? parts.join('/') + '/' : '';
        navigateExplorer(parentPath);
    }
});