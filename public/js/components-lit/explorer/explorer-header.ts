import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";
import { explorerTranslations } from "../../i18n/translations/explorer.i18n";

export interface BreadcrumbPart {
  name: string;
  path: string;
}

@customElement("explorer-header")
export class ExplorerHeader extends LitElement {
  @property({ type: String }) bucketName = "";
  @property({ type: Array }) breadcrumbs: BreadcrumbPart[] = [];
  @property({ type: Boolean }) showBulkDelete = false;
  @property({ type: Number }) selectedCount = 0;
  @state() currentLang = 'en';

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback() {
    super.connectedCallback();
    this.currentLang = localStorage.getItem('lang') || 'en';
    window.addEventListener('languageChanged', this.handleLanguageChange as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('languageChanged', this.handleLanguageChange as EventListener);
  }

  private handleLanguageChange = (e: Event) => {
    this.currentLang = (e as CustomEvent).detail;
  };

  private t(key: string): string {
    return explorerTranslations[this.currentLang]?.[key] || explorerTranslations['en']?.[key] || key;
  }

  private handleBack() {
    this.dispatchEvent(
      new CustomEvent("back", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleNavigate(path: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { path },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleCreateFolder() {
    this.dispatchEvent(
      new CustomEvent("create-folder", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.dispatchEvent(
        new CustomEvent("upload", {
          detail: { files: Array.from(input.files) },
          bubbles: true,
          composed: true,
        }),
      );
      input.value = "";
    }
  }

  private async handleUploadFolderPicker() {
    if ("showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: "read" });
        const { files, paths } = await this._readDirRecursive(dirHandle, "");
        if (files.length > 0) {
          (window as any).app?.handleFolderUpload(files, paths);
        }
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.warn("showDirectoryPicker failed, using fallback:", err);
      }
    }

    // Fallback: webkitdirectory input (Firefox / non-secure contexts)
    this.querySelector<HTMLInputElement>(".folder-fallback-input")?.click();
  }

  private async _readDirRecursive(
    dirHandle: any,
    basePath: string,
  ): Promise<{ files: File[]; paths: string[] }> {
    const files: File[] = [];
    const paths: string[] = [];
    for await (const [name, handle] of dirHandle.entries()) {
      const entryPath = basePath ? `${basePath}/${name}` : name;
      if (handle.kind === "file") {
        files.push(await handle.getFile());
        paths.push(entryPath);
      } else if (handle.kind === "directory") {
        const sub = await this._readDirRecursive(handle, entryPath);
        files.push(...sub.files);
        paths.push(...sub.paths);
      }
    }
    return { files, paths };
  }

  private handleUploadFolderFallback(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const paths = files.map((f) => (f as any).webkitRelativePath || f.name);
      // Browser already showed its own confirm dialog, skip ours
      (window as any).app?.handleFolderUploadDirect(files, paths);
      input.value = "";
    }
  }

  private handleBulkDelete() {
    this.dispatchEvent(
      new CustomEvent("bulk-delete", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="${TW.explorer.header.container}">
        <!-- Left Section: Back button + Bucket name + Breadcrumbs -->
        <div class="${TW.explorer.header.leftSection}">
          <button
            class="${TW.explorer.header.backButton}"
            @click=${this.handleBack}
          >
            <iconify-icon icon="ph:arrow-left-bold" width="20"></iconify-icon>
          </button>
          <div class="${TW.explorer.header.icon}">
            <iconify-icon icon="ph:folder-open-bold" width="22"></iconify-icon>
          </div>
          <div class="${TW.explorer.header.titleWrapper}">
            <h3 class="${TW.explorer.header.title}">${this.bucketName}</h3>
            <div class="${TW.explorer.header.breadcrumbWrapper}">
              <span
                class="${TW.explorer.header.breadcrumbRoot}"
                @click=${() => this.handleNavigate("")}
                >${this.t('rootLabel')}</span
              >
              ${this.breadcrumbs.map(
                (part) => html`
                  <span class="${TW.explorer.header.breadcrumbSeparator}"
                    >/</span
                  >
                  <span
                    class="${TW.explorer.header.breadcrumbItem}"
                    @click=${() => this.handleNavigate(part.path)}
                  >
                    ${part.name}
                  </span>
                `,
              )}
            </div>
          </div>
        </div>

        <!-- Right Section: Folder + Upload buttons -->
        <div class="${TW.explorer.toolbar.container}">
          <button
            class="${TW.explorer.toolbar.btnFolder}"
            @click=${this.handleCreateFolder}
            data-tooltip="${this.t('newFolderTooltip')}"
          >
            <iconify-icon icon="ph:folder-plus-bold" width="20"></iconify-icon>
          </button>
          <label class="${TW.explorer.toolbar.btnUpload}">
            <iconify-icon icon="ph:upload-simple-bold" width="18"></iconify-icon>
            <span>${this.t('uploadBtn')}</span>
            <input
              type="file"
              multiple
              class="${TW.explorer.toolbar.fileInput}"
              @change=${this.handleUpload}
            />
          </label>
          <button
            class="${TW.explorer.toolbar.btnUpload}"
            @click=${this.handleUploadFolderPicker}
          >
            <iconify-icon icon="ph:folder-arrow-up-bold" width="18"></iconify-icon>
            <span>Folder</span>
          </button>
          <input
            type="file"
            webkitdirectory
            class="folder-fallback-input hidden"
            @change=${this.handleUploadFolderFallback}
          />
          ${this.showBulkDelete
            ? html`
                <button
                  class="${TW.explorer.toolbar.btnBulkDelete}"
                  @click=${this.handleBulkDelete}
                >
                  ${this.t('deleteSelectedBtn')} (${this.selectedCount})
                </button>
              `
            : ""}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "explorer-header": ExplorerHeader;
  }
}
