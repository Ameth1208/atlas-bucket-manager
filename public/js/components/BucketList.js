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
            // bucket-card sends { bucket: {...} }
            const bucket = e.detail.bucket;
            window.app.openExplorer(bucket.providerId, bucket.name);
        });
        
        card.addEventListener('delete', (e) => {
            // bucket-card sends { bucket: {...} }
            const bucket = e.detail.bucket;
            window.app.openDeleteModal(bucket.providerId, bucket.name);
        });
        
        card.addEventListener('refresh-stats', async (e) => {
            // bucket-card sends { bucket: {...} }
            const bucket = e.detail.bucket;
            const stats = await window.app.refreshStats(bucket.providerId, bucket.name);
            
            // Update stats display in the card
            if (stats) {
                const statsEl = document.getElementById(`stats-${bucket.providerId}-${bucket.name}`);
                if (statsEl) {
                    const sizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
                    statsEl.textContent = `${sizeMB} MB · ${stats.objectCount} objects`;
                }
            }
        });
        
        card.addEventListener('policy-change', async (e) => {
            const { bucket, isPublic } = e.detail;
            try {
                await api.updatePolicy(bucket.providerId, bucket.name, isPublic);
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

