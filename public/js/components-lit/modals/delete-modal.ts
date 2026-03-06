import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

export interface DeleteTarget {
  providerId: string;
  name: string;
  type: "bucket" | "object";
}

@customElement("delete-modal")
export class DeleteModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) target: DeleteTarget | null = null;

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private handleCancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  private handleConfirm() {
    this.dispatchEvent(
      new CustomEvent("confirm", {
        detail: this.target,
      }),
    );
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="${TW.deleteModal.backdrop}" @click="${this.handleCancel}">
        <div
          class="${TW.deleteModal.content}"
          @click="${(e: Event) => e.stopPropagation()}"
        >
          <div class="${TW.deleteModal.iconContainer}">
            <iconify-icon icon="ph:trash-bold" width="28"></iconify-icon>
          </div>
          <h3 class="${TW.deleteModal.title}">
            Delete ${this.target?.type === "bucket" ? "Bucket" : "Item"}
          </h3>
          <p class="${TW.deleteModal.description}">
            ${this.target?.type === "bucket"
              ? "Are you sure you want to delete this bucket? This action cannot be undone."
              : "Confirm deletion? This action cannot be undone."}
          </p>
          <div class="${TW.deleteModal.actions}">
            <button class="${TW.deleteModal.btnCancel}" @click="${this.handleCancel}">
              Cancel
            </button>
            <button class="${TW.deleteModal.btnDelete}" @click="${this.handleConfirm}">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
