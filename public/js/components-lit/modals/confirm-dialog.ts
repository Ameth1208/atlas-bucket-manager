import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("confirm-dialog")
export class ConfirmDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) message = "";
  @property({ type: String }) title = "";
  @property({ type: String }) icon = "";
  @property({ type: String }) confirmText = "Confirm";
  @property({ type: String }) cancelText = "Cancel";
  @property({ type: Boolean }) danger = false;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private handleCancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("cancel", { bubbles: true, composed: true }));
  }

  private handleConfirm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("confirm", { bubbles: true, composed: true }));
  }

  render() {
    if (!this.open) return html``;

    const iconBg = this.danger
      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      : "bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400";

    const btnConfirm = this.danger
      ? "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-red-600 text-white hover:bg-red-700 active:scale-95"
      : "flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-rose-500 text-white hover:bg-rose-600 active:scale-95";

    const resolvedIcon = this.icon || (this.danger ? "ph:trash-bold" : "ph:question-bold");
    const resolvedTitle = this.title || (this.danger ? "Confirm deletion" : "Confirm action");

    return html`
      <div
        class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-slate-900/50 backdrop-blur"
        @click=${this.handleCancel}
      >
        <div
          class="relative bg-white dark:bg-dark-900 w-full max-w-sm rounded-xl border border-slate-200 dark:border-dark-800 p-8 shadow-2xl my-auto"
          @click=${(e: Event) => e.stopPropagation()}
        >
          <!-- Icon -->
          <div class="w-14 h-14 rounded-xl flex items-center justify-center ${iconBg} mb-6">
            <iconify-icon icon="${resolvedIcon}" width="28"></iconify-icon>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            ${resolvedTitle}
          </h3>

          <!-- Message -->
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            ${this.message}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700"
              @click=${this.handleCancel}
            >
              ${this.cancelText}
            </button>
            <button
              class="${btnConfirm}"
              @click=${this.handleConfirm}
            >
              ${this.confirmText}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "confirm-dialog": ConfirmDialog;
  }
}
