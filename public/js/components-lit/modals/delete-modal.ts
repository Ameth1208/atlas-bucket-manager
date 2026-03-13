import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";
import { deleteModalTranslations } from "../../i18n/translations/delete-modal.i18n";

export interface DeleteTarget {
  providerId: string;
  name: string;
  type: "bucket" | "object";
}

@customElement("delete-modal")
export class DeleteModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) target: DeleteTarget | null = null;
  @property({ type: String }) lang = "en";

  @state() confirmText = "";

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private handleCancel() {
    this.open = false;
    this.confirmText = "";
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  private handleConfirm() {
    // For buckets, require typing the bucket name
    if (this.target?.type === "bucket") {
      if (!this.confirmText.trim()) {
        this.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: this.t("deleteErrorEmpty"), type: "error" },
            bubbles: true,
            composed: true,
          }),
        );
        return;
      }
      
      if (this.confirmText !== this.target.name) {
        this.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: this.t("deleteErrorConfirm"), type: "error" },
            bubbles: true,
            composed: true,
          }),
        );
        return;
      }
    }

    this.dispatchEvent(
      new CustomEvent("confirm", {
        detail: this.target,
      }),
    );
    this.confirmText = "";
  }

  private t(key: string): string {
    return deleteModalTranslations[this.lang]?.[key] || deleteModalTranslations["en"][key] || key;
  }

  render() {
    if (!this.open) return html``;

    const isBucket = this.target?.type === "bucket";
    const canDelete = !isBucket || this.confirmText === this.target?.name;

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
            ${isBucket
              ? this.t("deleteBucketTitle")
              : this.t("deleteItemTitle")}
          </h3>

          <p class="${TW.deleteModal.description}">
            ${isBucket ? this.t("deleteBucketDesc") : this.t("deleteItemDesc")}
          </p>

          ${isBucket
            ? html`
                <div
                  class="p-3 bg-slate-100 dark:bg-dark-800 rounded-lg border border-slate-200 dark:border-dark-700"
                >
                  <div class="flex items-center gap-2">
                    <iconify-icon
                      icon="ph:package-duotone"
                      width="18"
                      class="text-slate-500"
                    ></iconify-icon>
                    <span
                      class="text-sm font-bold text-slate-700 dark:text-slate-300"
                    >
                      ${this.target?.name}
                    </span>
                  </div>
                </div>

                <div class="my-6">
                  <label
                    class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2"
                  >
                    ${this.t("deleteConfirmLabel")}
                  </label>
                  <input
                    type="text"
                    class="w-full px-3 py-2.5 bg-white dark:bg-dark-800 border border-slate-300 dark:border-dark-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="${this.target?.name}"
                    .value="${this.confirmText}"
                    @input="${(e: Event) =>
                      (this.confirmText = (
                        e.target as HTMLInputElement
                      ).value)}"
                    @keypress="${(e: KeyboardEvent) => {
                      if (e.key === "Enter" && canDelete) this.handleConfirm();
                    }}"
                    autocomplete="off"
                  />
                </div>
              `
            : ""}

          <div class="${TW.deleteModal.actions}">
            <button
              class="${TW.deleteModal.btnCancel}"
              @click="${this.handleCancel}"
            >
              ${this.t("cancelBtn")}
            </button>
            <button
              class="${TW.deleteModal.btnDelete} ${!canDelete
                ? "opacity-50 cursor-not-allowed"
                : ""}"
              @click="${this.handleConfirm}"
              ?disabled="${!canDelete}"
            >
              ${this.t("deleteBtn")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
