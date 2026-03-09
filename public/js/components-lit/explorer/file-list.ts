import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

export interface FileObject {
  name: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  etag?: string;
  prefix?: string;
}

@customElement('file-list')
export class FileList extends LitElement {
  @property({ type: Array }) items: FileObject[] = [];
  @property({ type: Number }) pageSize = 100;
  @state() currentPage = 1;
  @state() selectedFiles = new Set<string>();

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  get paginatedItems(): FileObject[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  get hasSelected(): boolean {
    return this.selectedFiles.size > 0;
  }

  render() {
    return html`
      <div class="${TW.fileList.container}">
        <div class="${TW.fileList.listWrapper}">
          <div class="${TW.fileList.list}">
            ${this.items.length === 0 
              ? this._renderEmpty() 
              : this.paginatedItems.map(item => this._renderItem(item))}
          </div>
        </div>
        
        ${this.items.length > this.pageSize ? html`
          <div class="border-t border-slate-100 dark:border-dark-800 py-3">
            <pagination-controls
              .total=${this.items.length}
              .page=${this.currentPage}
              .pageSize=${this.pageSize}
              @page-change=${this._handlePageChange}>
            </pagination-controls>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderEmpty() {
    return html`
      <div class="${TW.fileList.empty}">
        <iconify-icon icon="ph:folder-open-thin" class="${TW.fileList.emptyIcon}"></iconify-icon>
        <div class="${TW.fileList.emptyTitle}">No files</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">This folder is empty</div>
      </div>
    `;
  }

  private _renderItem(item: FileObject) {
    const icon = this._getIcon(item);
    const isSelected = this.selectedFiles.has(item.name);

    return html`
      <div class="${TW.fileList.item}" @click=${() => this._handleItemClick(item)}>
        ${!item.isFolder ? html`
          <input 
            type="checkbox"
            class="${TW.fileList.checkbox}"
            .checked=${isSelected}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${(e: Event) => this._handleSelect(item, (e.target as HTMLInputElement).checked)}>
        ` : ''}

        <div class="${TW.fileList.fileIcon} ${this._getIconClass(item)}">
          <iconify-icon icon="${icon}" width="20"></iconify-icon>
        </div>

        <div class="${TW.fileList.fileInfo}">
          <div class="${TW.fileList.fileName}">${item.name}</div>
          <div class="${TW.fileList.fileMeta}">
            ${!item.isFolder ? html`
              <span>${this._formatSize(item.size)}</span>
              <span>${this._formatDate(item.lastModified)}</span>
            ` : ''}
          </div>
        </div>

        ${!item.isFolder ? html`
          <div class="${TW.fileList.fileActions}">
            <button class="${TW.fileList.fileActionBtn}" 
                    @click=${(e: Event) => this._handleAction(e, 'preview', item)}
                    title="Preview">
              <iconify-icon icon="ph:eye-bold" width="18"></iconify-icon>
            </button>
            <button class="${TW.fileList.fileActionBtn}" 
                    @click=${(e: Event) => this._handleAction(e, 'share', item)}
                    title="Share">
              <iconify-icon icon="ph:share-network-bold" width="18"></iconify-icon>
            </button>
            <button class="${TW.fileList.fileActionBtn}" 
                    @click=${(e: Event) => this._handleAction(e, 'download', item)}
                    title="Download">
              <iconify-icon icon="ph:download-bold" width="18"></iconify-icon>
            </button>
            <button class="${TW.fileList.fileActionBtn}" 
                    @click=${(e: Event) => this._handleAction(e, 'delete', item)}
                    title="Delete">
              <iconify-icon icon="ph:trash-bold" width="18"></iconify-icon>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _getIcon(item: FileObject): string {
    if (item.isFolder) return 'ph:folder-bold';
    
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      // Images
      jpg: 'ph:image-bold', jpeg: 'ph:image-bold', png: 'ph:image-bold',
      gif: 'ph:image-bold', webp: 'ph:image-bold', svg: 'ph:image-bold',
      // Videos
      mp4: 'ph:video-bold', webm: 'ph:video-bold', mov: 'ph:video-bold',
      // Audio
      mp3: 'ph:music-notes-bold', wav: 'ph:music-notes-bold', ogg: 'ph:music-notes-bold',
      // Documents
      pdf: 'ph:file-pdf-bold', doc: 'ph:file-doc-bold', docx: 'ph:file-doc-bold',
      // Code
      js: 'ph:file-js-bold', ts: 'ph:file-ts-bold', json: 'ph:brackets-curly-bold',
      html: 'ph:file-html-bold', css: 'ph:file-css-bold',
      // Archives
      zip: 'ph:file-zip-bold', rar: 'ph:file-zip-bold', tar: 'ph:file-zip-bold',
    };
    
    return iconMap[ext] || 'ph:file-bold';
  }

  private _getIconClass(item: FileObject): string {
    if (item.isFolder) return TW.fileList.fileIconFolder;
    
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-500';
    if (['js', 'ts', 'json', 'html', 'css'].includes(ext)) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500';
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500';
    
    return '';
  }

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private _formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  private _handleItemClick(item: FileObject) {
    if (item.isFolder) {
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { folder: item },
        bubbles: true,
        composed: true,
      }));
    } else {
      this.dispatchEvent(new CustomEvent('preview', {
        detail: { file: item },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private _handleSelect(item: FileObject, selected: boolean) {
    if (selected) {
      this.selectedFiles.add(item.name);
    } else {
      this.selectedFiles.delete(item.name);
    }
    this.requestUpdate();
    
    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: { selected: Array.from(this.selectedFiles) },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleAction(e: Event, action: string, item: FileObject) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent(action, {
      detail: { file: item },
      bubbles: true,
      composed: true,
    }));
  }

  private _handlePageChange(e: CustomEvent) {
    this.currentPage = e.detail.page;
    this.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Public API
  public clearSelection() {
    this.selectedFiles.clear();
    this.requestUpdate();
  }

  public getSelected(): string[] {
    return Array.from(this.selectedFiles);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'file-list': FileList;
  }
}
