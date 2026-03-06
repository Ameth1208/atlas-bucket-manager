import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      text-align: center;
      color: var(--text-muted, #94a3b8);
    }

    .empty iconify-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .empty-subtitle {
      font-size: 0.875rem;
      opacity: 0.7;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: background 0.2s;
      cursor: pointer;
    }

    .item:hover {
      background: var(--bg-hover, #f8fafc);
    }

    .checkbox {
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 0.25rem;
      border: 2px solid var(--border-color, #cbd5e1);
      cursor: pointer;
      transition: all 0.2s;
    }

    .checkbox:checked {
      background: var(--color-rose-500, #f43f5e);
      border-color: var(--color-rose-500, #f43f5e);
    }

    .icon {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-center;
      border-radius: 0.5rem;
      background: var(--icon-bg, #f1f5f9);
      color: var(--icon-color, #64748b);
    }

    .icon.folder {
      background: var(--color-indigo-100, #e0e7ff);
      color: var(--color-indigo-600, #4f46e5);
    }

    .icon.image {
      background: var(--color-rose-100, #ffe4e6);
      color: var(--color-rose-600, #e11d48);
    }

    .icon.video {
      background: var(--color-purple-100, #f3e8ff);
      color: var(--color-purple-600, #9333ea);
    }

    .icon.code {
      background: var(--color-green-100, #dcfce7);
      color: var(--color-green-600, #16a34a);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.125rem;
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .item:hover .actions {
      opacity: 1;
    }

    .action-btn {
      padding: 0.5rem;
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: var(--bg-secondary, #f1f5f9);
      color: var(--color-rose-500, #f43f5e);
    }

    .footer {
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding: 0.75rem 1rem;
      background: var(--bg-card, white);
    }

    @media (max-width: 640px) {
      .meta {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `;

  get paginatedItems(): FileObject[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  get hasSelected(): boolean {
    return this.selectedFiles.size > 0;
  }

  render() {
    return html`
      <div class="container">
        <div class="list">
          ${this.items.length === 0 
            ? this._renderEmpty() 
            : this.paginatedItems.map(item => this._renderItem(item))}
        </div>
        
        ${this.items.length > this.pageSize ? html`
          <div class="footer">
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
      <div class="empty">
        <iconify-icon icon="ph:folder-open-thin"></iconify-icon>
        <div class="empty-title">No files</div>
        <div class="empty-subtitle">This folder is empty</div>
      </div>
    `;
  }

  private _renderItem(item: FileObject) {
    const icon = this._getIcon(item);
    const isSelected = this.selectedFiles.has(item.name);

    return html`
      <div class="item" @click=${() => this._handleItemClick(item)}>
        ${!item.isFolder ? html`
          <input 
            type="checkbox"
            class="checkbox"
            .checked=${isSelected}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${(e: Event) => this._handleSelect(item, (e.target as HTMLInputElement).checked)}>
        ` : ''}

        <div class="icon ${this._getIconClass(item)}">
          <iconify-icon icon="${icon}" width="20"></iconify-icon>
        </div>

        <div class="info">
          <div class="name">${item.name}</div>
          <div class="meta">
            ${!item.isFolder ? html`
              <span>${this._formatSize(item.size)}</span>
              <span>${this._formatDate(item.lastModified)}</span>
            ` : ''}
          </div>
        </div>

        ${!item.isFolder ? html`
          <div class="actions">
            <button class="action-btn" 
                    @click=${(e: Event) => this._handleAction(e, 'preview', item)}
                    title="Preview">
              <iconify-icon icon="ph:eye-bold" width="18"></iconify-icon>
            </button>
            <button class="action-btn" 
                    @click=${(e: Event) => this._handleAction(e, 'share', item)}
                    title="Share">
              <iconify-icon icon="ph:share-network-bold" width="18"></iconify-icon>
            </button>
            <button class="action-btn" 
                    @click=${(e: Event) => this._handleAction(e, 'download', item)}
                    title="Download">
              <iconify-icon icon="ph:download-bold" width="18"></iconify-icon>
            </button>
            <button class="action-btn" 
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
    if (item.isFolder) return 'folder';
    
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (['js', 'ts', 'json', 'html', 'css'].includes(ext)) return 'code';
    
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
