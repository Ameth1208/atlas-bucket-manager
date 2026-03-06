import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("folder-modal")
export class FolderModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() folderName = "";

  static styles = css`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: white;
      width: 100%;
      max-width: 24rem;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    :host-context(html.dark) .modal-content {
      background: rgb(15, 23, 42);
      border: 1px solid rgb(30, 41, 59);
    }
    .icon-container {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(238, 242, 255);
      color: rgb(79, 70, 229);
      margin-bottom: 1.5rem;
    }
    h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }
    :host-context(html.dark) h3 {
      color: white;
    }
    p {
      margin: 0 0 1.5rem 0;
      font-size: 0.875rem;
      color: #64748b;
    }
    input {
      width: 100%;
      background: #f1f5f9;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      box-sizing: border-box;
      outline: none;
      font-family: monospace;
    }
    :host-context(html.dark) input {
      background: #1e293b;
      color: white;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
    }
    button {
      flex: 1;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }
    .btn-create {
      background: #4f46e5;
      color: white;
    }
    .btn-create:hover {
      background: #4338ca;
    }
  `;

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
      <div class="modal-backdrop" @click="${this.handleClose}">
        <div class="modal-content" @click="${(e: any) => e.stopPropagation()}">
          <div class="icon-container">
            <iconify-icon icon="ph:folder-plus-bold" width="28"></iconify-icon>
          </div>
          <h3>New Folder</h3>
          <p>Enter a name for the new folder.</p>
          <input
            type="text"
            placeholder="folder-name"
            .value="${this.folderName}"
            @input="${(e: any) => (this.folderName = e.target.value)}"
            @keyup="${(e: any) => e.key === "Enter" && this.handleSubmit()}"
            autofocus
          />
          <div class="actions">
            <button class="btn-cancel" @click="${this.handleClose}">
              Cancel
            </button>
            <button class="btn-create" @click="${this.handleSubmit}">
              Create
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
