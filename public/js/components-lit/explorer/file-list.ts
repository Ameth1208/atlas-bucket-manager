import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

export interface FileObject {
  name: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  etag?: string;
  prefix?: string;
}

type SortField = "name" | "size" | "date";
type SortDir = "asc" | "desc";

@customElement("file-list")
export class FileList extends LitElement {
  @property({ type: Array }) items: FileObject[] = [];
  @property({ type: Number }) pageSize = 100;
  @state() currentPage = 1;
  @state() selectedFiles = new Set<string>();
  @state() private sortField: SortField = "name";
  @state() private sortDir: SortDir = "asc";

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private get sortedItems(): FileObject[] {
    const folders = this.items.filter((i) => i.isFolder);
    const files = this.items.filter((i) => !i.isFolder);

    const compare = (a: FileObject, b: FileObject): number => {
      const dir = this.sortDir === "asc" ? 1 : -1;
      switch (this.sortField) {
        case "name":
          return this._getDisplayName(a).localeCompare(this._getDisplayName(b)) * dir;
        case "size":
          return (a.size - b.size) * dir;
        case "date":
          return (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()) * dir;
        default:
          return 0;
      }
    };

    folders.sort(compare);
    files.sort(compare);
    return [...folders, ...files];
  }

  get paginatedItems(): FileObject[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedItems.slice(start, start + this.pageSize);
  }

  get hasSelected(): boolean {
    return this.selectedFiles.size > 0;
  }

  private get selectableItems(): FileObject[] {
    return this.paginatedItems.filter((i) => !i.isFolder);
  }

  private get allSelected(): boolean {
    const selectable = this.selectableItems;
    return selectable.length > 0 && selectable.every((i) => this.selectedFiles.has(i.name));
  }

  private _toggleSort(field: SortField) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDir = "asc";
    }
  }

  private _toggleSelectAll() {
    const selectable = this.selectableItems;
    if (this.allSelected) {
      selectable.forEach((i) => this.selectedFiles.delete(i.name));
    } else {
      selectable.forEach((i) => this.selectedFiles.add(i.name));
    }
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: { selected: Array.from(this.selectedFiles) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _sortArrow(field: SortField): string {
    if (this.sortField !== field) return "";
    return this.sortDir === "asc" ? "ph:caret-up-bold" : "ph:caret-down-bold";
  }

  render() {
    return html`
      <div class="${TW.fileList.container}">
        <div class="${TW.fileList.listWrapper}">
          ${this.items.length > 0 ? this._renderHeader() : ""}
          <div class="${TW.fileList.list}">
            ${this.items.length === 0
              ? this._renderEmpty()
              : this.paginatedItems.map((item) => this._renderItem(item))}
          </div>
        </div>
      </div>
    `;
  }

  private _renderHeader() {
    const hasSelectable = this.selectableItems.length > 0;
    return html`
      <div class="${TW.fileList.listHeader}">
        ${hasSelectable
          ? html`
              <input
                type="checkbox"
                class="${TW.fileList.checkbox}"
                .checked=${this.allSelected}
                @change=${() => this._toggleSelectAll()}
              />
            `
          : html`<div class="w-4"></div>`}

        <div class="w-9"></div>

        <div class="flex-1 min-w-0 flex items-center gap-4">
          <span
            class="${TW.fileList.listHeaderCol} flex-1 ${this.sortField === "name" ? TW.fileList.listHeaderColActive : ""}"
            @click=${() => this._toggleSort("name")}
          >
            Name
            ${this._sortArrow("name")
              ? html`<iconify-icon icon="${this._sortArrow("name")}" class="${TW.fileList.sortIcon}"></iconify-icon>`
              : ""}
          </span>
          <span
            class="${TW.fileList.listHeaderCol} w-20 justify-end ${this.sortField === "size" ? TW.fileList.listHeaderColActive : ""}"
            @click=${() => this._toggleSort("size")}
          >
            Size
            ${this._sortArrow("size")
              ? html`<iconify-icon icon="${this._sortArrow("size")}" class="${TW.fileList.sortIcon}"></iconify-icon>`
              : ""}
          </span>
          <span
            class="${TW.fileList.listHeaderCol} w-24 justify-end ${this.sortField === "date" ? TW.fileList.listHeaderColActive : ""}"
            @click=${() => this._toggleSort("date")}
          >
            Modified
            ${this._sortArrow("date")
              ? html`<iconify-icon icon="${this._sortArrow("date")}" class="${TW.fileList.sortIcon}"></iconify-icon>`
              : ""}
          </span>
        </div>

        <div class="w-[120px]"></div>
      </div>
    `;
  }

  private _renderEmpty() {
    return html`
      <div class="${TW.fileList.empty}">
        <iconify-icon
          icon="ph:folder-open-duotone"
          class="${TW.fileList.emptyIcon}"
        ></iconify-icon>
        <div class="${TW.fileList.emptyTitle}">No files</div>
        <div class="${TW.fileList.emptyDescription}">
          This folder is empty
        </div>
      </div>
    `;
  }

  private _renderItem(item: FileObject) {
    const icon = this._getIcon(item);
    const isSelected = this.selectedFiles.has(item.name);

    return html`
      <div
        class="${TW.fileList.item} ${isSelected ? TW.fileList.itemSelected : ""}"
        @click=${() => this._handleItemClick(item)}
        @contextmenu=${(e: MouseEvent) => this._handleContextMenu(e, item)}
      >
        ${!item.isFolder
          ? html`
              <input
                type="checkbox"
                class="${TW.fileList.checkbox}"
                .checked=${isSelected}
                @click=${(e: Event) => e.stopPropagation()}
                @change=${(e: Event) =>
                  this._handleSelect(
                    item,
                    (e.target as HTMLInputElement).checked,
                  )}
              />
            `
          : html`<div class="w-4"></div>`}

        <div class="${TW.fileList.fileIcon} ${this._getIconClass(item)}">
          <iconify-icon icon="${icon}" width="18"></iconify-icon>
        </div>

        <div class="flex-1 min-w-0 flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <div class="${TW.fileList.fileName}">
              ${this._getDisplayName(item)}
            </div>
          </div>
          <div class="w-20 text-right text-[11px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
            ${!item.isFolder ? this._formatSize(item.size) : ""}
          </div>
          <div class="w-24 text-right text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            ${!item.isFolder ? this._formatDate(item.lastModified) : ""}
          </div>
        </div>

        ${item.isFolder
          ? html`
              <div class="${TW.fileList.fileActions}">
                <button
                  class="${TW.fileList.fileActionBtn}"
                  @click=${(e: Event) => this._handleFolderCopy(e, item)}
                  title="Copy folder"
                >
                  <iconify-icon icon="ph:copy-duotone" width="16"></iconify-icon>
                </button>
              </div>
            `
          : html`
              <div class="${TW.fileList.fileActions}">
                <button
                  class="${TW.fileList.fileActionBtn}"
                  @click=${(e: Event) => this._handleAction(e, "preview", item)}
                  title="Preview"
                >
                  <iconify-icon icon="ph:eye-duotone" width="16"></iconify-icon>
                </button>
                <button
                  class="${TW.fileList.fileActionBtn}"
                  @click=${(e: Event) => this._handleAction(e, "share", item)}
                  title="Share"
                >
                  <iconify-icon
                    icon="ph:link-duotone"
                    width="16"
                  ></iconify-icon>
                </button>
                <button
                  class="${TW.fileList.fileActionBtn}"
                  @click=${(e: Event) =>
                    this._handleAction(e, "download", item)}
                  title="Download"
                >
                  <iconify-icon
                    icon="ph:download-simple-duotone"
                    width="16"
                  ></iconify-icon>
                </button>
                <button
                  class="${TW.fileList.fileActionBtn}"
                  @click=${(e: Event) => this._handleAction(e, "delete", item)}
                  title="Delete"
                >
                  <iconify-icon icon="ph:trash-duotone" width="16"></iconify-icon>
                </button>
              </div>
            `}
      </div>
    `;
  }

  private _getIcon(item: FileObject): string {
    if (item.isFolder) return "ph:folder-duotone";

    const ext = item.name.split(".").pop()?.toLowerCase() || "";
    const iconMap: { [key: string]: string } = {
      jpg: "ph:image-duotone", jpeg: "ph:image-duotone", png: "ph:image-duotone",
      gif: "ph:image-duotone", webp: "ph:image-duotone", svg: "ph:image-duotone",
      mp4: "ph:video-duotone", webm: "ph:video-duotone", mov: "ph:video-duotone",
      mp3: "ph:music-notes-duotone", wav: "ph:music-notes-duotone",
      ogg: "ph:music-notes-duotone", oga: "ph:music-notes-duotone",
      pdf: "ph:file-pdf-duotone", doc: "ph:file-doc-duotone", docx: "ph:file-doc-duotone",
      js: "ph:file-js-duotone", ts: "ph:file-ts-duotone",
      json: "ph:brackets-curly-duotone", html: "ph:file-html-duotone", css: "ph:file-css-duotone",
      zip: "ph:file-zip-duotone", rar: "ph:file-zip-duotone", tar: "ph:file-zip-duotone",
    };
    return iconMap[ext] || "ph:file-bold";
  }

  private _getIconClass(item: FileObject): string {
    if (item.isFolder) return TW.fileList.fileIconFolder;

    const ext = item.name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400";
    if (["mp4", "webm", "mov"].includes(ext))
      return "bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400";
    if (["mp3", "wav", "ogg", "oga"].includes(ext))
      return "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400";
    if (["js", "ts", "json", "html", "css"].includes(ext))
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    if (["zip", "rar", "tar", "gz"].includes(ext))
      return "bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400";
    if (["pdf"].includes(ext))
      return "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400";
    return "";
  }

  private _getDisplayName(item: FileObject): string {
    const cleanName = item.name.replace(/\/+$/, "");
    const segments = cleanName.split("/");
    return segments[segments.length - 1] || cleanName;
  }

  private _formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private _formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  private _handleItemClick(item: FileObject) {
    if (item.isFolder) {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { folder: item },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("preview", {
          detail: { file: item },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _handleSelect(item: FileObject, selected: boolean) {
    if (selected) {
      this.selectedFiles.add(item.name);
    } else {
      this.selectedFiles.delete(item.name);
    }
    this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: { selected: Array.from(this.selectedFiles) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleAction(e: Event, action: string, item: FileObject) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(action, {
        detail: { file: item },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleFolderCopy(e: Event, item: FileObject) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("copy-folder", {
        detail: { folder: item },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleContextMenu(e: MouseEvent, item: FileObject) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("context-menu", {
        detail: { item, x: e.clientX, y: e.clientY },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handlePageChange(e: CustomEvent) {
    this.currentPage = e.detail.page;
    this.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Public API
  public clearSelection() {
    this.selectedFiles.clear();
    this.requestUpdate();
  }

  public getSelected(): string[] {
    return Array.from(this.selectedFiles);
  }

  public selectAll() {
    this.selectableItems.forEach((i) => this.selectedFiles.add(i.name));
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: { selected: Array.from(this.selectedFiles) },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "file-list": FileList;
  }
}
