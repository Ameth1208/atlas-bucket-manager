import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';
import { shareModalTranslations } from '../../i18n/translations/share-modal.i18n';

@customElement('share-modal')
export class ShareModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) fileName = '';
  @state() expiry = '3600';
  @state() generatedUrl = '';
  @state() currentLang = 'en';

  // Disable Shadow DOM to use Tailwind directly
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
    return shareModalTranslations[this.currentLang]?.[key] || shareModalTranslations['en']?.[key] || key;
  }

  private handleClose() {
    this.open = false;
    this.generatedUrl = '';
    this.dispatchEvent(new CustomEvent('close'));
  }

  private async handleGenerate() {
    this.dispatchEvent(new CustomEvent('generate', {
      detail: { expiry: this.expiry, fileName: this.fileName }
    }));
  }

  // API pública para que app.js le pase la URL generada
  public setUrl(url: string) {
    this.generatedUrl = url;
  }

  // Extract just the filename from the full path
  private getDisplayName(): string {
    if (!this.fileName) return '';
    const parts = this.fileName.split('/');
    return parts[parts.length - 1];
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="${TW.shareModal.backdrop}" @click="${this.handleClose}">
        <div class="${TW.shareModal.content}" @click="${(e: any) => e.stopPropagation()}">
          <div class="${TW.shareModal.iconContainer}">
            <iconify-icon icon="ph:share-network-bold" width="24"></iconify-icon>
          </div>
          
          <h3 class="${TW.shareModal.title}">${this.t('shareTitle')}</h3>
          <p class="${TW.shareModal.description}">${this.t('shareDescription')} ${this.getDisplayName()}</p>
          
          <div class="${TW.shareModal.expiryWrapper}">
            <label class="${TW.shareModal.expiryLabel}">${this.t('expiryLabel')}</label>
            <select 
              class="${TW.formControl}"
              .value="${this.expiry}" 
              @change="${(e: any) => this.expiry = e.target.value}">
              <option value="60">${this.t('expiry1min')}</option>
              <option value="3600">${this.t('expiry1hour')}</option>
              <option value="86400">${this.t('expiry24hours')}</option>
              <option value="604800">${this.t('expiry7days')}</option>
            </select>
          </div>

          ${this.generatedUrl ? html`
            <div class="${TW.shareModal.urlWrapper}">
              <label class="${TW.shareModal.urlLabel}">${this.t('urlLabel')}</label>
              <input 
                type="text" 
                readonly 
                class="${TW.shareModal.urlInput}"
                .value="${this.generatedUrl}">
            </div>
          ` : ''}

          <div class="${TW.shareModal.actions}">
            <button class="${TW.shareModal.btnClose}" @click="${this.handleClose}">
              ${this.t('cancelBtn')}
            </button>
            ${!this.generatedUrl ? html`
              <button class="${TW.shareModal.btnCopy}" @click="${this.handleGenerate}">
                <iconify-icon icon="ph:link-bold" width="18"></iconify-icon>
                ${this.t('generateBtn')}
              </button>
            ` : html`
              <button class="${TW.shareModal.btnCopy}" @click="${() => {
                navigator.clipboard.writeText(this.generatedUrl);
                this.dispatchEvent(new CustomEvent('toast', { detail: this.t('toastCopied') }));
              }}">
                <iconify-icon icon="ph:copy-bold" width="18"></iconify-icon>
                ${this.t('copyBtn')}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }
}
