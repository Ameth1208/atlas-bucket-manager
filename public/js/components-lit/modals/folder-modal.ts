import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

@customElement("folder-modal")
export class FolderModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() folderName = "";

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private handleClose() {
    this.open = false;
    this.folderName = "";
    this.dispatchEvent(new CustomEvent("close"));
  }

  private handleSubmit() {
    if (!this.folderName.trim()) return;
    this.dispatchEvent(
      new CustomEvent("confirm", {
        detail: { name: this.folderName.trim() },
      }),
    );
    this.handleClose();
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="${TW.folderModal.backdrop}" @click="${this.handleClose}">
        <div class="${TW.folderModal.content}" @click="${(e: any) => e.stopPropagation()}">
          <div class="${TW.folderModal.iconContainer}">
            <iconify-icon icon="ph:folder-plus-bold" width="28"></iconify-icon>
          </div>
          <h3 class="${TW.folderModal.title}">New Folder</h3>
          <p class="${TW.folderModal.description}">Enter a name for the new folder.</p>
          <div class="${TW.folderModal.inputWrapper}">
            <input
              type="text"
              class="${TW.input.base} font-mono"
              placeholder="folder-name"
              .value="${this.folderName}"
              @input="${(e: any) => (this.folderName = e.target.value)}"
              @keyup="${(e: any) => e.key === "Enter" && this.handleSubmit()}"
              autofocus
            />
          </div>
          <div class="${TW.folderModal.actions}">
            <button class="${TW.folderModal.btnCancel}" @click="${this.handleClose}">
              Cancel
            </button>
            <button class="${TW.folderModal.btnCreate}" @click="${this.handleSubmit}">
              Create
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
