import { store } from '../store.js';
import { api } from '../api.js';
import { openPreview } from './Modals.js';
import { showToast } from '../utils.js';

export async function openExplorer(name) {
    store.currentBucket = name;
    store.currentPrefix = '';
    document.getElementById('explorerTitle').innerText = name;
    document.getElementById('explorerModal').classList.remove('hidden');
    await navigateExplorer('');
}

export function closeExplorer() {
    document.getElementById('explorerModal').classList.add('hidden');
}

export async function downloadFile(bucket, file) {
    try {
        const { url } = await api.getUrl(bucket, file);
        window.open(url, '_blank');
    } catch (err) {
        showToast("Download failed", 'error');
    }
}

export async function navigateExplorer(prefix) {
    store.currentPrefix = prefix;
    const list = document.getElementById('fileList');
    const bread = document.getElementById('breadcrumbs');
    
    // Breadcrumbs
    const parts = prefix.split('/').filter(p => p);
    let path = '';
    bread.innerHTML = parts.map(p => {
        path += p + '/';
        return ` <span class="text-slate-300">/</span> <span class="cursor-pointer hover:text-indigo-500 font-medium" onclick="window.app.navigateExplorer('${path}')">${p}</span>`;
    }).join('');

    list.innerHTML = '<div class="text-center py-12 text-slate-400"><iconify-icon icon="line-md:loading-twotone-loop" width="32"></iconify-icon></div>';
    
    try {
        const items = await api.listObjects(store.currentBucket, store.currentPrefix);
        list.innerHTML = '';
        document.getElementById('fileCount').innerText = `${items.length} items`;
        
        // Back Button
        if(store.currentPrefix !== '') {
            const parent = store.currentPrefix.split('/').slice(0, -2).join('/');
            const parentPath = parent ? parent + '/' : '';
            const back = document.createElement('div');
            back.className = "flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl cursor-pointer text-slate-500 mb-2 border border-transparent hover:border-slate-200 dark:hover:border-dark-700 transition-colors";
            back.innerHTML = `<div class="aspect-square w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-dark-800 rounded-xl"><iconify-icon icon="ph:arrow-u-up-left-bold" width="20"></iconify-icon></div> <span class="text-sm font-bold">..</span>`;
            back.onclick = () => navigateExplorer(parentPath);
            list.appendChild(back);
        }

        if(!items.length) { 
            list.innerHTML += '<div class="text-center py-16 flex flex-col items-center gap-3 text-slate-400"><iconify-icon icon="ph:folder-dashed-duotone" width="48" class="opacity-50"></iconify-icon><span class="text-sm font-medium">Empty folder</span></div>'; 
            return; 
        }

        // Folders
        items.filter(i => i.prefix).forEach(f => {
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-dark-700 mb-1";
            el.onclick = () => navigateExplorer(f.prefix);
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="aspect-square w-10 h-10 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-xl shadow-sm">
                        <iconify-icon icon="ph:folder-fill" width="20"></iconify-icon>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">${f.prefix.replace(store.currentPrefix, '').replace('/','')}</span>
                </div>
                <iconify-icon icon="ph:caret-right-bold" class="text-slate-300 group-hover:text-slate-500 transition-colors"></iconify-icon>
            `;
            list.appendChild(el);
        });

        // Files
        items.filter(i => !i.prefix).forEach(f => {
            const size = (f.size / 1024).toFixed(1) + ' KB';
            const name = f.name.replace(store.currentPrefix, '');
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-dark-700 mb-1";
            el.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="aspect-square w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-700 text-indigo-500 rounded-xl shadow-sm border border-slate-100 dark:border-dark-600">
                        <iconify-icon icon="ph:file-text-duotone" width="20"></iconify-icon>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate font-mono">${name}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${size}</span>
                    </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ">
                    <button onclick="window.app.previewFile('${store.currentBucket}', '${f.name}')" class="p-2 text-slate-400 hover:text-indigo-500 aspect-square bg-white dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600 shadow-sm hover:shadow transition-all" title="Preview">
                        <iconify-icon icon="ph:eye-bold" width="18"></iconify-icon>
                    </button>
                    <button onclick="window.app.downloadFile('${store.currentBucket}', '${f.name}')" class="p-2 text-slate-400 hover:text-green-500 aspect-square bg-white dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600 shadow-sm hover:shadow transition-all" title="Download">
                        <iconify-icon icon="ph:download-simple-bold" width="18"></iconify-icon>
                    </button>
                </div>
            `;
            list.appendChild(el);
        });

    } catch (err) { 
        console.error(err);
        list.innerHTML = '<div class="text-center py-12 text-rose-500 text-sm font-medium">Error loading content</div>'; 
    }
}
