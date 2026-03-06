import { store } from '/js/store.js';
import { api } from '/js/api.js';
import { showToast } from '/js/utils.js';
import { translations } from '/js/i18n.js';

/**
 * Renders bucket list using Lit <bucket-card> Web Components
 * 
 * REQUIRES: <bucket-card> component to be registered (from /js/main.ts)
 */
export function renderBuckets(buckets) {
    const lang = localStorage.getItem('lang') || 'en';
    const list = document.getElementById('bucketList');
    const loader = document.getElementById('loader');
    const empty = document.getElementById('emptyState');
    
    loader.classList.add('hidden');
    list.innerHTML = '';
    
    // Apply Filter
    let filteredBuckets = buckets;
    if (store.currentFilter !== 'all') {
        filteredBuckets = buckets.filter(b => b.providerId === store.currentFilter);
    }

    // Empty state
    if (!Array.isArray(filteredBuckets) || filteredBuckets.length === 0) { 
        empty.classList.remove('hidden'); 
        list.classList.add('hidden'); 
        return; 
    }

    empty.classList.add('hidden');
    list.classList.remove('hidden');

    // Render using Lit Web Components
    filteredBuckets.forEach(bucket => {
        const card = document.createElement('bucket-card');
        
        // Set properties
        card.bucket = bucket;
        card.lang = lang;
        
        // Listen to custom events
        card.addEventListener('explore', (e) => {
            window.app.openExplorer(e.detail.providerId, e.detail.name);
        });
        
        card.addEventListener('delete', (e) => {
            window.app.openDeleteModal(e.detail.providerId, e.detail.name);
        });
        
        card.addEventListener('refresh-stats', async (e) => {
            await window.app.refreshStats(e.detail.providerId, e.detail.name);
        });
        
        card.addEventListener('policy-change', async (e) => {
            const { providerId, name, isPublic } = e.detail;
            try {
                await api.updatePolicy(providerId, name, isPublic);
                showToast(translations[lang].toastUpdated);
                window.app.loadData(false);
            } catch (err) {
                showToast('Update failed', 'error');
                // Revert toggle state
                card.bucket = { ...card.bucket, isPublic: !isPublic };
            }
        });
        
        list.appendChild(card);
    });
}

