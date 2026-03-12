import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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
    // For buckets, require typing "DELETE"
    if (this.target?.type === "bucket" && this.confirmText !== "DELETE") {
      this.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: this.t("deleteErrorConfirm"), type: "error" },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    this.dispatchEvent(
      new CustomEvent("confirm", {
        detail: this.target,
      }),
    );
    this.confirmText = "";
  }

  private t(key: string): string {
    const translations: Record<string, Record<string, string>> = {
      en: {
        deleteTitle: "Delete",
        deleteBucketTitle: "Delete Bucket",
        deleteItemTitle: "Delete Item",
        deleteBucketDesc:
          "This action is irreversible. Type DELETE to confirm.",
        deleteItemDesc: "Confirm deletion? This action cannot be undone.",
        deleteConfirmLabel: "Type DELETE to confirm:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "Please type DELETE to confirm",
        cancelBtn: "Cancel",
        deleteBtn: "Delete",
        bucketName: "Bucket",
      },
      es: {
        deleteTitle: "Eliminar",
        deleteBucketTitle: "Eliminar Bucket",
        deleteItemTitle: "Eliminar Elemento",
        deleteBucketDesc:
          "Esta acción es irreversible. Escribe DELETE para confirmar.",
        deleteItemDesc:
          "¿Confirmar eliminación? Esta acción no se puede deshacer.",
        deleteConfirmLabel: "Escribe DELETE para confirmar:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "Por favor escribe DELETE para confirmar",
        cancelBtn: "Cancelar",
        deleteBtn: "Eliminar",
        bucketName: "Bucket",
      },
      pt: {
        deleteTitle: "Excluir",
        deleteBucketTitle: "Excluir Bucket",
        deleteItemTitle: "Excluir Item",
        deleteBucketDesc:
          "Esta ação é irreversível. Digite DELETE para confirmar.",
        deleteItemDesc: "Confirmar exclusão? Esta ação não pode ser desfeita.",
        deleteConfirmLabel: "Digite DELETE para confirmar:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "Por favor digite DELETE para confirmar",
        cancelBtn: "Cancelar",
        deleteBtn: "Excluir",
        bucketName: "Bucket",
      },
      fr: {
        deleteTitle: "Supprimer",
        deleteBucketTitle: "Supprimer le Bucket",
        deleteItemTitle: "Supprimer l'élément",
        deleteBucketDesc:
          "Cette action est irréversible. Tapez DELETE pour confirmer.",
        deleteItemDesc:
          "Confirmer la suppression? Cette action ne peut pas être annulée.",
        deleteConfirmLabel: "Tapez DELETE pour confirmer:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "Veuillez taper DELETE pour confirmer",
        cancelBtn: "Annuler",
        deleteBtn: "Supprimer",
        bucketName: "Bucket",
      },
      ja: {
        deleteTitle: "削除",
        deleteBucketTitle: "バケットを削除",
        deleteItemTitle: "アイテムを削除",
        deleteBucketDesc:
          "この操作は元に戻せません。DELETEと入力して確認してください。",
        deleteItemDesc: "削除を確認しますか？この操作は元に戻せません。",
        deleteConfirmLabel: "DELETEと入力して確認:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "確認のためDELETEと入力してください",
        cancelBtn: "キャンセル",
        deleteBtn: "削除",
        bucketName: "バケット",
      },
      zh: {
        deleteTitle: "删除",
        deleteBucketTitle: "删除存储桶",
        deleteItemTitle: "删除项目",
        deleteBucketDesc: "此操作不可逆。输入DELETE确认。",
        deleteItemDesc: "确认删除？此操作无法撤消。",
        deleteConfirmLabel: "输入DELETE确认:",
        deleteConfirmPlaceholder: "DELETE",
        deleteErrorConfirm: "请输入DELETE确认",
        cancelBtn: "取消",
        deleteBtn: "删除",
        bucketName: "存储桶",
      },
    };

    return translations[this.lang]?.[key] || translations["en"][key] || key;
  }

  render() {
    if (!this.open) return html``;

    const isBucket = this.target?.type === "bucket";
    const canDelete = !isBucket || this.confirmText === "DELETE";

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
                    placeholder="${this.t("deleteConfirmPlaceholder")}"
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
