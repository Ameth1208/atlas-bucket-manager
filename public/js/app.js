// Atlas Manager - Based on Pencil Design
// Implements exact colors, spacing, and layout from atlas-premium.pen

const store = {
    buckets: [],
    currentFilter: 'all',
    isLoading: false,
    deleteTarget: null,
};

const api = {
    async request(endpoint, options = {}) {
        const res = await fetch(`/api${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers },
        });
        if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
        return res.json();
    },
    
    getBuckets: () => api.request('/buckets'),
    createBucket: (providerId, name) => api.request('/buckets', { method: 'POST', body: JSON.stringify({ providerId, name }) }),
    deleteBucket: (providerId, name) => api.request(`/buckets/${providerId}/${encodeURIComponent(name)}`, { method: 'DELETE' }),
    updateBucketPolicy: (providerId, name, isPublic) => api.request(`/buckets/${providerId}/${encodeURIComponent(name)}/policy`, { method: 'PUT', body: JSON.stringify({ isPublic }) }),
    logout: () => api.request('/logout', { method: 'POST' }),
};

const UI = {
    // Create bucket card EXACTLY as designed in Pencil
    createBucketCard(bucket) {
        const card = document.createElement('div');
        card.className = 'bg-[#1e293b] rounded-[16px] border border-[#334155] p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in';
        
        const providerColors = {
            minio: 'bg-[#f43f5e26] text-[#f43f5e]',
            aws: 'bg-[#3b82f626] text-[#3b82f6]',
            r2: 'bg-[#10b98126] text-[#10b981]',
        };
        
        const providerNames = { minio: 'MinIO', aws: 'AWS S3', r2: 'R2' };
        const providerColor = providerColors[bucket.provider?.toLowerCase()] || providerColors.minio;
        const providerName = providerNames[bucket.provider?.toLowerCase()] || bucket.provider;
        
        // From Pencil: card w:432, h:180
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <h3 class="text-[16px] font-semibold text-[#f8fafc] font-mono">${this.escapeHtml(bucket.name)}</h3>
                <span class="inline-flex items-center px-3 py-1 ${providerColor} text-[11px] font-semibold rounded-[12px]">${providerName}</span>
            </div>
            
            <div class="flex items-center gap-6 mb-6">
                <div class="flex items-center gap-2 text-[13px] text-[#64748b]">
                    <iconify-icon icon="ph:database" class="text-lg"></iconify-icon>
                    <span>${this.formatSize(bucket.size || 0)}</span>
                </div>
                <div class="flex items-center gap-2 text-[13px] text-[#64748b]">
                    <iconify-icon icon="ph:files" class="text-lg"></iconify-icon>
                    <span>${this.formatNumber(bucket.objectCount || 0)} objects</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#475569]">${this.formatDate(bucket.creationDate)}</span>
                
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer policy-toggle" 
                           data-provider="${bucket.provider}" data-name="${this.escapeHtml(bucket.name)}" ${bucket.isPublic ? 'checked' : ''}>
                    <div class="w-10 h-6 bg-[#334155] rounded-[12px] peer peer-checked:bg-[#f43f5e] transition-colors relative">
                        <div class="absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 
                                    ${bucket.isPublic ? 'translate-x-5' : 'translate-x-0.5'} top-0.5"></div>
                    </div>
                </label>
            </div>
        `;
        
        return card;
    },
    
    formatSize: (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    
    formatNumber: (num) => num.toLocaleString(),
    
    formatDate: (dateString) => {
        const date = new Date(dateString), now = new Date(), diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    },
    
    escapeHtml: (text) => { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; },
    
    showToast: (message, type = 'success') => {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        document.getElementById('toastIcon').setAttribute('icon', type === 'success' ? 'ph:check-circle' : 'ph:warning-circle');
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
    },
};

const app = {
    async init() {
        this.bindEvents();
        await this.loadBuckets();
    },
    
    bindEvents() {
        document.getElementById('createBucketBtn')?.addEventListener('click', () => this.openModal('createModal'));
        document.getElementById('cancelCreate')?.addEventListener('click', () => this.closeModal('createModal'));
        document.getElementById('createBucketForm')?.addEventListener('submit', async (e) => { e.preventDefault(); await this.handleCreateBucket(); });
        document.getElementById('cancelDelete')?.addEventListener('click', () => this.closeModal('deleteModal'));
        document.getElementById('deleteConfirm')?.addEventListener('input', (e) => {
            document.getElementById('confirmDelete').disabled = e.target.value !== store.deleteTarget?.name;
        });
        document.getElementById('confirmDelete')?.addEventListener('click', () => this.handleDeleteBucket());
        document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', (e) => this.handleFilter(e.currentTarget)));
        document.getElementById('bucketList')?.addEventListener('change', async (e) => {
            if (e.target.classList.contains('policy-toggle')) await this.handlePolicyChange(e.target);
        });
        document.getElementById('logoutBtn')?.addEventListener('click', async () => { await api.logout(); window.location.href = '/login'; });
        document.getElementById('globalSearch')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    },
    
    async loadBuckets() {
        store.isLoading = true;
        this.updateLoader();
        try {
            store.buckets = await api.getBuckets();
            this.renderBuckets();
        } catch (error) {
            UI.showToast('Failed to load buckets', 'error');
        } finally {
            store.isLoading = false;
            this.updateLoader();
        }
    },
    
    renderBuckets() {
        const container = document.getElementById('bucketList');
        const emptyState = document.getElementById('emptyState');
        if (!container) return;
        
        let filtered = store.currentFilter === 'all' ? store.buckets : store.buckets.filter(b => b.provider?.toLowerCase() === store.currentFilter);
        
        if (filtered.length === 0) {
            container.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            return;
        }
        
        emptyState?.classList.add('hidden');
        container.classList.remove('hidden');
        container.innerHTML = '';
        filtered.forEach(bucket => container.appendChild(UI.createBucketCard(bucket)));
    },
    
    updateLoader() {
        const loader = document.getElementById('loader');
        loader?.classList.toggle('hidden', !store.isLoading);
    },
    
    handleFilter(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'bg-[#f43f5e]', 'text-white');
            b.classList.add('bg-[#ffffff0f]', 'text-[#cbd5e1]');
        });
        btn.classList.remove('bg-[#ffffff0f]', 'text-[#cbd5e1]');
        btn.classList.add('active', 'bg-[#f43f5e]', 'text-white');
        store.currentFilter = btn.dataset.provider;
        this.renderBuckets();
    },
    
    async handleCreateBucket() {
        const provider = document.getElementById('createProvider').value;
        const name = document.getElementById('createName').value.trim();
        if (!name) return;
        try {
            await api.createBucket(provider, name);
            this.closeModal('createModal');
            UI.showToast('Bucket created');
            document.getElementById('createName').value = '';
            await this.loadBuckets();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },
    
    async handleDeleteBucket() {
        if (!store.deleteTarget) return;
        try {
            await api.deleteBucket(store.deleteTarget.provider, store.deleteTarget.name);
            this.closeModal('deleteModal');
            UI.showToast('Bucket deleted');
            await this.loadBuckets();
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            store.deleteTarget = null;
        }
    },
    
    confirmDelete(provider, name) {
        store.deleteTarget = { provider, name };
        document.getElementById('deleteConfirm').value = '';
        document.getElementById('confirmDelete').disabled = true;
        this.openModal('deleteModal');
    },
    
    async handlePolicyChange(toggle) {
        const { provider, name } = toggle.dataset;
        const isPublic = toggle.checked;
        try {
            await api.updateBucketPolicy(provider, name, isPublic);
            UI.showToast(isPublic ? 'Bucket made public' : 'Bucket made private');
        } catch (error) {
            toggle.checked = !isPublic;
            UI.showToast(error.message, 'error');
        }
    },
    
    handleSearch(query) {
        const container = document.getElementById('bucketList');
        if (!query.trim()) { this.renderBuckets(); return; }
        const filtered = store.buckets.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
        container.innerHTML = '';
        filtered.forEach(bucket => container.appendChild(UI.createBucketCard(bucket)));
    },
    
    openModal(id) { document.getElementById(id).classList.remove('hidden'); },
    closeModal(id) { document.getElementById(id).classList.add('hidden'); },
};

document.addEventListener('DOMContentLoaded', () => app.init());
window.app = app; window.UI = UI; window.api = api; window.store = store;
