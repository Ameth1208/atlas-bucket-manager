import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";
import { folderModalTranslations } from "../../i18n/translations/folder-modal.i18n";

@customElement("folder-modal")
export class FolderModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() folderName = "";
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
    return folderModalTranslations[this.currentLang]?.[key] || folderModalTranslations['en']?.[key] || key;
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
          <h3 class="${TW.folderModal.title}">${this.t('folderTitle')}</h3>
          <p class="${TW.folderModal.description}">${this.t('folderDescription')}</p>
          <div class="${TW.folderModal.inputWrapper}">
            <input
              type="text"
              class="${TW.input.base} font-mono"
              placeholder="${this.t('folderPlaceholder')}"
              .value="${this.folderName}"
              @input="${(e: any) => (this.folderName = e.target.value)}"
              @keyup="${(e: any) => e.key === "Enter" && this.handleSubmit()}"
              autofocus
            />
          </div>
          <div class="${TW.folderModal.actions}">
            <button class="${TW.folderModal.btnCancel}" @click="${this.handleClose}">
              ${this.t('cancelBtn')}
            </button>
            <button class="${TW.folderModal.btnCreate}" @click="${this.handleSubmit}">
              ${this.t('createBtn')}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
