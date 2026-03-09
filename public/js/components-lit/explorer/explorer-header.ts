import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

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

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
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
      input.value = ""; // Reset input
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
                >root</span
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
            data-tooltip="New Folder"
          >
            <iconify-icon icon="ph:folder-plus-bold" width="20"></iconify-icon>
          </button>
          <label class="${TW.explorer.toolbar.btnUpload}">
            <iconify-icon icon="ph:upload-simple-bold" width="18"></iconify-icon>
            <span>Upload</span>
            <input
              type="file"
              multiple
              class="${TW.explorer.toolbar.fileInput}"
              @change=${this.handleUpload}
            />
          </label>
          ${this.showBulkDelete
            ? html`
                <button
                  class="${TW.explorer.toolbar.btnBulkDelete}"
                  @click=${this.handleBulkDelete}
                >
                  Delete (${this.selectedCount})
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
