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

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        'png': 'ph:image-duotone', 'jpg': 'ph:image-duotone', 'jpeg': 'ph:image-duotone', 'webp': 'ph:image-duotone', 'svg': 'ph:file-svg-duotone',
        'mp4': 'ph:video-duotone', 'webm': 'ph:video-duotone', 'mov': 'ph:video-duotone',
        'pdf': 'ph:file-pdf-duotone',
        'zip': 'ph:file-archive-duotone', 'rar': 'ph:file-archive-duotone', '7z': 'ph:file-archive-duotone', 'gz': 'ph:file-archive-duotone',
        'js': 'ph:file-js-duotone', 'ts': 'ph:file-ts-duotone', 'html': 'ph:file-html-duotone', 'css': 'ph:file-css-duotone',
        'json': 'ph:file-code-duotone',
        'mp3': 'ph:music-notes-duotone', 'wav': 'ph:music-notes-duotone',
        'txt': 'ph:file-text-duotone', 'md': 'ph:file-text-duotone',
        'doc': 'ph:file-doc-duotone', 'docx': 'ph:file-doc-duotone',
        'xls': 'ph:file-xls-duotone', 'xlsx': 'ph:file-xls-duotone'
    };
    return map[ext] || 'ph:file-duotone';
}

function getIconStyles(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) return 'bg-purple-500/10 text-purple-500';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'bg-rose-500/10 text-rose-500';
    if (ext === 'pdf') return 'bg-red-500/10 text-red-500';
    if (['zip', 'rar', '7z'].includes(ext)) return 'bg-amber-500/10 text-amber-500';
    if (['js', 'ts', 'html', 'json'].includes(ext)) return 'bg-indigo-500/10 text-indigo-500';
    return 'bg-slate-500/10 text-slate-500';
}

export async function navigateExplorer(prefix) {
    store.currentPrefix = prefix;
    const list = document.getElementById('fileList');
    const bread = document.getElementById('breadcrumbs');
    
    const parts = prefix.split('/').filter(p => p);
    let path = '';
    bread.innerHTML = parts.map(p => {
        path += p + '/';
        return ` <span class="text-slate-300 dark:text-slate-600">/</span> <span class="cursor-pointer hover:text-rose-500 transition-colors" onclick="window.app.navigateExplorer('${path}')">${p}</span>`;
    }).join('');

    list.innerHTML = '<div class="text-center py-16 flex justify-center text-slate-400"><iconify-icon icon="line-md:loading-twotone-loop" width="40"></iconify-icon></div>';
    
    try {
        const items = await api.listObjects(store.currentBucket, store.currentPrefix);
        list.innerHTML = '';
        document.getElementById('fileCount').innerText = `${items.length} items`;
        
        if(store.currentPrefix !== '') {
            const parent = store.currentPrefix.split('/').slice(0, -2).join('/');
            const parentPath = parent ? parent + '/' : '';
            const back = document.createElement('div');
            back.className = "flex items-center gap-4 p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer text-slate-500 mb-1 transition-all group";
            back.innerHTML = `
                <div class="aspect-square w-10 flex items-center justify-center bg-slate-200/50 dark:bg-dark-700/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <iconify-icon icon="ph:arrow-u-up-left-bold" width="20"></iconify-icon>
                </div> 
                <span class="text-sm font-bold font-mono">..</span>
            `;
            back.onclick = () => navigateExplorer(parentPath);
            list.appendChild(back);
        }

        if(!items.length) { 
            list.innerHTML += '<div class="text-center py-20 flex flex-col items-center gap-4 text-slate-400 opacity-60"><iconify-icon icon="ph:folder-dashed-duotone" width="48"></iconify-icon><span class="text-sm font-medium tracking-tight">Empty folder</span></div>'; 
            return; 
        }

        items.filter(i => i.prefix).forEach(f => {
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl cursor-pointer group transition-all mb-1";
            el.onclick = () => navigateExplorer(f.prefix);
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="aspect-square w-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-xl">
                        <iconify-icon icon="ph:folder-duotone" width="22"></iconify-icon>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">${f.prefix.replace(store.currentPrefix, '').replace('/','')}</span>
                </div>
                <iconify-icon icon="ph:caret-right-bold" class="text-slate-300 group-hover:text-slate-500 transition-colors" width="16"></iconify-icon>
            `;
            list.appendChild(el);
        });

        items.filter(i => !i.prefix).forEach(f => {
            const size = (f.size / 1024).toFixed(1) + ' KB';
            const name = f.name.replace(store.currentPrefix, '');
            const icon = getFileIcon(name);
            const styles = getIconStyles(name);
            const el = document.createElement('div');
            el.className = "flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl group transition-all mb-1";
            el.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="aspect-square w-10 flex items-center justify-center ${styles} rounded-xl transition-all group-hover:scale-105">
                        <iconify-icon icon="${icon}" width="22"></iconify-icon>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate font-mono tracking-tight">${name}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${size}</span>
                    </div>
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.app.openPreview('${store.currentBucket}', '${f.name}')" class="aspect-square w-9 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Preview">
                        <iconify-icon icon="ph:eye-bold" width="18"></iconify-icon>
                    </button>
                    <button onclick="window.app.downloadFile('${store.currentBucket}', '${f.name}')" class="aspect-square w-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="Download">
                        <iconify-icon icon="ph:download-simple-bold" width="18"></iconify-icon>
                    </button>
                </div>
            `;
            list.appendChild(el);
        });

    } catch (err) { 
        list.innerHTML = '<div class="text-center py-12 text-rose-500 text-sm font-medium">Failed to access content</div>'; 
    }
}