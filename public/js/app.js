import { initTheme, toggleTheme, showToast } from '/js/utils.js';
import { initLanguage, setLanguage, renderLanguageSelector, t } from '/js/i18n.js';
import { api } from '/js/api.js';
import { store } from '/js/store.js';
import { renderBuckets } from '/js/components/BucketList.js';
import { openExplorer, closeExplorer, navigateExplorer, downloadFile, handleUpload, toggleSelect, bulkDelete } from '/js/components/Explorer.js';
import { renderSupportButton } from '/js/components/SupportButton.js';
import { initTooltips } from '/js/components/Tooltip.js';

// 1. Error Mapping
function translateError(errorMsg) {
    if (!errorMsg) return t('errGeneral');
    if (errorMsg.includes('bucket name is not available') || errorMsg.includes('BucketAlreadyExists')) return t('errBucketExists');
    if (errorMsg.includes('Invalid credentials') || errorMsg.includes('Invalid')) return t('errInvalidCredentials');
    return errorMsg;
}

// 2. Data Loading
async function loadData(spinner = true) {
    const list = document.getElementById('bucketList');
    const loader = document.getElementById('loader');
    const empty = document.getElementById('emptyState');
    if (!list) return;

    // Load providers FIRST to ensure UI is ready
    await loadProviders();

    if(spinner) { 
        loader.classList.remove('hidden'); 
        list.classList.add('hidden'); 
        empty.classList.add('hidden');
    }

    try { 
        const res = await api.list(); 
        
        if (res && res.error) {
            showToast(translateError(res.error), 'error');
            loader.classList.add('hidden');
            empty.classList.remove('hidden');
            return;
        }

        store.buckets = Array.isArray(res) ? res : [];
        renderBuckets(store.buckets); 
        renderFilters(store.buckets);
    } catch (e) { 
        console.error("Data load failed:", e);
        showToast("Connection failed", 'error');
        loader.classList.add('hidden');
        empty.classList.remove('hidden');
    }
}

// 3. Filters
function renderFilters(buckets) {
    const container = document.getElementById('filterContainer');
    if(!container) return;
    
    // Use providers from store if available, otherwise from buckets
    const providers = (store.providers && store.providers.length > 0) 
        ? store.providers 
        : Array.from(new Set(buckets.map(b => b.providerId))).map(id => ({ id, name: id }));

    if(providers.length <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<button onclick="window.app.setFilter('all')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${store.currentFilter === 'all' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-dark-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-700'}">All Accounts</button>`;
    
    providers.forEach(p => {
        html += `<button onclick="window.app.setFilter('${p.id}')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all ${store.currentFilter === p.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-dark-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-700'}">${p.name}</button>`;
    });
    container.innerHTML = html;
}

function setFilter(filterId) {
    store.currentFilter = filterId;
    renderBuckets(store.buckets);
    renderFilters(store.buckets);
}

// 4. Providers & Creation
async function loadProviders() {
    const select = document.getElementById('createProviderId');
    if(!select) return;
    try {
        const providers = await api.listProviders();
        store.providers = Array.isArray(providers) ? providers : [];

        if(store.providers.length > 1) {
            select.classList.remove('hidden');
            select.innerHTML = store.providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        } else if (store.providers.length === 1) {
            const p = store.providers[0];
            select.innerHTML = `<option value="${p.id}" selected>${p.name}</option>`;
            select.value = p.id; // Force value
            select.classList.add('hidden');
        } else {
            select.innerHTML = '<option value="">No Providers</option>';
            select.classList.add('hidden');
        }
    } catch (err) {
        console.error("Failed to load providers:", err);
    }
}

async function createBucket(e) {
    e.preventDefault();
    console.log("Submit event triggered on createBucketForm");

    const input = document.getElementById('newBucketName');
    const providerSelect = document.getElementById('createProviderId');
    const name = input.value.trim();
    
    // Get providerId from select
    let providerId = providerSelect ? providerSelect.value : null;
    
    console.log("Form values -> Name:", name, "ProviderId (from select):", providerId);

    if(!name) {
        showToast("Please enter a bucket name", "error");
        return;
    }

    if(!providerId) {
        console.warn("ProviderId missing from select, checking store...");
        if (store.providers && store.providers.length > 0) {
            providerId = store.providers[0].id;
            console.log("Using first provider from store:", providerId);
        }
    }

    if(!providerId) {
        showToast("No provider available", 'error');
        return;
    }

    try {
        console.log(`Final attempt: Creating bucket "${name}" on "${providerId}"`);
        showToast(t('create') + "...", 'info');
        const res = await api.create(providerId, name);
        console.log("API Create response:", res);

        if (res && res.error) {
            showToast(translateError(res.error), 'error');
        } else { 
            input.value = ''; 
            showToast(t('toastCreated'), 'success'); 
            await loadData(false); 
        }
    } catch (err) {
        console.error("Create bucket unexpected error:", err);
        showToast("Failed to create bucket", 'error');
    }
}

// 5. Deletion & Stats
async function confirmDelete(detail) {
    if (!detail) return;
    const { providerId, name } = detail;
    const res = await api.delete(providerId, name);
    if (res.error) showToast(translateError(res.error), 'error'); 
    else { showToast(t('toastDeleted'), 'success'); loadData(); } 
    closeDeleteModal();
}

// 7. Modals Bridge (Lit Integration)
function openDeleteModal(providerId, name) {
    const modal = document.getElementById('deleteModalComponent');
    if (modal) {
        modal.target = { providerId, name, type: 'bucket' };
        modal.open = true;
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModalComponent');
    if (modal) modal.open = false;
}

function openPreview(providerId, bucket, file) {
    const modal = document.getElementById('previewModalComponent');
    if (modal) {
        modal.file = { providerId, bucket, file };
        modal.open = true;
    }
}

function closePreview() {
    const modal = document.getElementById('previewModalComponent');
    if (modal) modal.open = false;
}

function openUrlModal(fileName) {
    const modal = document.getElementById('shareModalComponent');
    if (modal) {
        modal.fileName = fileName;
        modal.open = true;
    }
}

function closeUrlModal() {
    const modal = document.getElementById('shareModalComponent');
    if (modal) modal.open = false;
}

async function generateShareLink(detail) {
    const modal = document.getElementById('shareModalComponent');
    if (!modal) return;
    try {
        const { url } = await api.getUrl(store.currentProviderId, store.currentBucket, detail.fileName, detail.expiry);
        modal.setUrl(url);
    } catch (err) {
        showToast('Link generation failed', 'error');
    }
}

function createFolder() {
    const modal = document.getElementById('folderModalComponent');
    if (modal) modal.open = true;
}

async function submitFolder(detail) {
    showToast('Creating folder...', 'info');
    const modal = document.getElementById('folderModalComponent');
    try {
        const res = await api.createFolder(store.currentProviderId, store.currentBucket, detail.name, store.currentPrefix);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Folder created', 'success');
            if (modal) modal.open = false;
            // Re-render to show new folder
            if (window.app.openExplorer) window.app.openExplorer(store.currentProviderId, store.currentBucket, store.currentPrefix);
        }
    } catch (err) {
        showToast('Failed to create folder', 'error');
    }
}

// 6. Stats Refresh
async function refreshStats(providerId, bucket) {
    try {
        const stats = await api.getStats(providerId, bucket);
        return stats;
    } catch (err) {
        console.error('Failed to refresh stats:', err);
        return null;
    }
}

// 7. Search
function initSearch() {
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;
    
    let timeout = null;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const q = e.target.value.trim();
        if (!q) {
            results.classList.add('hidden');
            return;
        }
        timeout = setTimeout(() => performSearch(q), 300);
    });
}

async function performSearch(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;
    
    try {
        const items = await api.search(query);
        if (items && items.length > 0) {
            results.innerHTML = items.map(item => `
                <div class="p-3 hover:bg-slate-50 dark:hover:bg-dark-700 cursor-pointer border-b border-slate-100 dark:border-dark-700"
                     onclick="window.app.openExplorer('${item.providerId}', '${item.bucket}', '')">
                    <div class="font-medium text-slate-800 dark:text-slate-200">${item.object}</div>
                    <div class="text-xs text-slate-500">${item.bucket} • ${item.providerId}</div>
                </div>
            `).join('');
            results.classList.remove('hidden');
        } else {
            results.innerHTML = '<div class="p-3 text-center text-slate-500">No results found</div>';
            results.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Search failed:', err);
    }
}

// 9. Login Handler (Lit Component)
async function handleLogin(detail) {
    const { username, password } = detail;
    const loginComponent = document.getElementById('loginFormComponent');
    
    try {
        const res = await api.login(username, password);
        if (res.success) {
            window.location.href = '/manager';
        } else {
            throw new Error(res.error || 'Invalid credentials');
        }
    } catch (err) {
        if (loginComponent) {
            loginComponent.setError(err.message || 'Invalid credentials');
        }
    }
}

// 8. Routing
function handleRouting() {
    const path = window.location.pathname;
    const parts = path.split('/');
    if (parts[1] === 'manager' && parts.length >= 5 && parts[4] === 'files') {
        const providerId = parts[2];
        const bucket = parts[3];
        const prefix = parts.slice(5).join('/');
        window.app.openExplorer(providerId, bucket, prefix);
    } else if (path === '/manager') {
        const listView = document.getElementById('bucketListView');
        const explorerView = document.getElementById('explorerView');
        if (listView && explorerView) {
            listView.classList.remove('hidden');
            explorerView.classList.add('hidden');
        }
    }
}

window.addEventListener('popstate', handleRouting);

// 9. Expose Global API
window.app = {
    loadData, openExplorer, closeExplorer, navigateExplorer, downloadFile, handleUpload, 
    createFolder, submitFolder,
    toggleSelect, bulkDelete, openUrlModal, closeUrlModal, generateShareLink,
    openDeleteModal, closeDeleteModal, confirmDelete, openPreview, closePreview,
    setLanguage, toggleTheme, refreshStats, translateError, setFilter, api, showToast,
    initTooltips, handleLogin
};

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for Lit Components
    document.getElementById('loginFormComponent')?.addEventListener('login', (e) => handleLogin(e.detail));
    document.getElementById('deleteModalComponent')?.addEventListener('confirm', (e) => confirmDelete(e.detail));
    document.getElementById('shareModalComponent')?.addEventListener('generate', (e) => generateShareLink(e.detail));
    document.getElementById('shareModalComponent')?.addEventListener('toast', (e) => showToast(e.detail));
    document.getElementById('folderModalComponent')?.addEventListener('confirm', (e) => submitFolder(e.detail));

    try {
        initTheme();
        initLanguage();
        
        const langContainer = document.getElementById('langSelectorContainer');
        if (langContainer) renderLanguageSelector('langSelectorContainer');
        
        const supportContainer = document.getElementById('supportButtonContainer');
        if (supportContainer) renderSupportButton();
        
        initTooltips();
    } catch (err) {
        console.error('Error during global init:', err);
    }
    
    // Check if we're on login or manager page
    const isLoginPage = document.getElementById('loginFormComponent') !== null;
    
    if (!isLoginPage) {
        // Manager page
        initSearch();
        loadData();
        handleRouting();
    }
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logoutBtn')?.addEventListener('click', api.logout);
    document.getElementById('createBucketForm')?.addEventListener('submit', createBucket);
    
    window.addEventListener('languageChanged', () => {
        if(store.buckets && store.buckets.length > 0) renderBuckets(store.buckets);
    });
    
    console.log('✅ App initialized');
});
