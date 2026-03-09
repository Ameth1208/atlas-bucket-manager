import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

@customElement('share-modal')
export class ShareModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) fileName = '';
  @state() expiry = '3600';
  @state() generatedUrl = '';

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
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

  render() {
    if (!this.open) return html``;
    return html`
      <div class="${TW.shareModal.backdrop}" @click="${this.handleClose}">
        <div class="${TW.shareModal.content}" @click="${(e: any) => e.stopPropagation()}">
          <div class="${TW.shareModal.iconContainer}">
            <iconify-icon icon="ph:share-network-bold" width="24"></iconify-icon>
          </div>
          
          <h3 class="${TW.shareModal.title}">Share File</h3>
          <p class="${TW.shareModal.description}">Generate a temporary download link for ${this.fileName}</p>
          
          <div class="${TW.shareModal.expiryWrapper}">
            <label class="${TW.shareModal.expiryLabel}">EXPIRATION TIME</label>
            <select 
              class="${TW.formControl}"
              .value="${this.expiry}" 
              @change="${(e: any) => this.expiry = e.target.value}">
              <option value="60">1 Minute</option>
              <option value="3600">1 Hour</option>
              <option value="86400">24 Hours</option>
              <option value="604800">7 Days</option>
            </select>
          </div>

          ${this.generatedUrl ? html`
            <div class="${TW.shareModal.urlWrapper}">
              <label class="${TW.shareModal.urlLabel}">GENERATED LINK</label>
              <input 
                type="text" 
                readonly 
                class="${TW.shareModal.urlInput}"
                .value="${this.generatedUrl}">
            </div>
          ` : ''}

          <div class="${TW.shareModal.actions}">
            <button class="${TW.shareModal.btnClose}" @click="${this.handleClose}">
              Cancel
            </button>
            ${!this.generatedUrl ? html`
              <button class="${TW.shareModal.btnCopy}" @click="${this.handleGenerate}">
                <iconify-icon icon="ph:link-bold" width="18"></iconify-icon>
                Generate Link
              </button>
            ` : html`
              <button class="${TW.shareModal.btnCopy}" @click="${() => {
                navigator.clipboard.writeText(this.generatedUrl);
                this.dispatchEvent(new CustomEvent('toast', { detail: 'Copied!' }));
              }}">
                <iconify-icon icon="ph:copy-bold" width="18"></iconify-icon>
                Copy Link
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }
}
