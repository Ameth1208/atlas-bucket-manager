import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('share-modal')
export class ShareModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) fileName = '';
  @state() expiry = '3600';
  @state() generatedUrl = '';

  static styles = css`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 70;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: white;
      width: 100%;
      max-width: 24rem;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    :host-context(html.dark) .modal-content {
      background: rgb(15, 23, 42);
      border: 1px solid rgb(30, 41, 59);
    }
    h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
    :host-context(html.dark) h3 { color: white; }
    p { margin: 0 0 1rem 0; font-size: 0.75rem; color: #64748b; }
    label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; }
    select, input {
      width: 100%;
      background: #f1f5f9;
      border: none;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      outline: none;
      font-size: 0.875rem;
    }
    :host-context(html.dark) select, :host-context(html.dark) input {
      background: #1e293b;
      color: white;
    }
    .actions { display: flex; gap: 0.75rem; }
    button {
      flex: 1;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
    }
    .btn-cancel { background: #f1f5f9; color: #475569; }
    .btn-generate { background: #f43f5e; color: white; }
    .url-container {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }
    :host-context(html.dark) .url-container { border-top-color: #1e293b; }
    .copy-box { display: flex; gap: 0.5rem; }
    .btn-copy { flex: none; width: 2.5rem; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; }
  `;

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
      <div class="modal-backdrop" @click="${this.handleClose}">
        <div class="modal-content" @click="${(e: any) => e.stopPropagation()}">
          <h3>Share File</h3>
          <p>Generate a temporary download link for ${this.fileName}</p>
          
          <label>Expiration Time</label>
          <select .value="${this.expiry}" @change="${(e: any) => this.expiry = e.target.value}">
            <option value="60">1 Minute</option>
            <option value="3600">1 Hour</option>
            <option value="86400">24 Hours</option>
            <option value="604800">7 Days</option>
          </select>

          <div class="actions">
            <button class="btn-cancel" @click="${this.handleClose}">Cancel</button>
            <button class="btn-generate" @click="${this.handleGenerate}">Generate</button>
          </div>

          ${this.generatedUrl ? html`
            <div class="url-container">
              <label>Generated Link</label>
              <div class="copy-box">
                <input type="text" readonly .value="${this.generatedUrl}">
                <button class="btn-copy" @click="${() => {
                  navigator.clipboard.writeText(this.generatedUrl);
                  this.dispatchEvent(new CustomEvent('toast', { detail: 'Copied!' }));
                }}">
                  <iconify-icon icon="ph:copy-bold"></iconify-icon>
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}
