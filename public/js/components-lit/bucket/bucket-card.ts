import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface Bucket {
  name: string;
  providerId: string;
  providerName: string;
  creationDate: string;
  isPublic: boolean;
}

@customElement('bucket-card')
export class BucketCard extends LitElement {
  @property({ type: Object }) bucket!: Bucket;
  @property({ type: String }) lang = 'en';

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--bg-card, white);
      border-radius: 0.75rem;
      padding: 1.25rem;
      border: 1px solid var(--border-color, #e2e8f0);
      transition: all 0.2s;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .card:hover {
      border-color: var(--color-rose-500, #f43f5e);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .icon-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .icon {
      aspect-ratio: 1;
      width: 3rem;
      display: flex;
      align-items: center;
      justify-center;
      background: var(--icon-bg, #f8fafc);
      border-radius: 0.75rem;
      color: var(--color-rose-500, #f43f5e);
      transition: all 0.3s;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .card:hover .icon {
      background: var(--color-rose-500, #f43f5e);
      color: white;
    }

    .provider-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: -0.025em;
      margin-top: 0.25rem;
    }

    .actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .card:hover .actions {
      opacity: 1;
    }

    .action-btn {
      padding: 0.5rem;
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      transition: color 0.2s;
    }

    .action-btn:hover {
      color: var(--color-rose-500, #f43f5e);
    }

    .action-btn.delete:hover {
      color: var(--color-rose-600, #e11d48);
    }

    .content {
      margin-bottom: 1.25rem;
    }

    .bucket-name {
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      letter-spacing: -0.025em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metadata {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .date {
      font-size: 0.625rem;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0.05em;
      opacity: 0.6;
    }

    .stats {
      font-size: 0.625rem;
      color: var(--color-indigo-500, #6366f1);
      font-weight: 700;
      display: none;
    }

    .stats.visible {
      display: block;
    }

    .stats-btn {
      font-size: 0.625rem;
      color: var(--text-muted, #94a3b8);
      background: none;
      border: none;
      cursor: pointer;
      transition: color 0.2s;
    }

    .stats-btn:hover {
      color: var(--color-rose-500, #f43f5e);
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-light, #f1f5f9);
    }

    .status {
      font-size: 0.625rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.025em;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      background: var(--status-bg, #f8fafc);
    }

    .status.public {
      color: var(--color-green-500, #22c55e);
    }

    .status.private {
      color: var(--color-amber-500, #f59e0b);
    }

    /* Toggle Switch */
    .toggle-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }

    .toggle-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .toggle-switch {
      width: 2.25rem;
      height: 1.25rem;
      background: #cbd5e1;
      border-radius: 9999px;
      position: relative;
      transition: background 0.2s;
    }

    .toggle-input:checked + .toggle-switch {
      background: var(--color-rose-500, #f43f5e);
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1rem;
      height: 1rem;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .toggle-input:checked + .toggle-switch::after {
      transform: translateX(1rem);
    }
  `;

  render() {
    return html`
      <div class="card">
        <div class="header">
          <div class="icon-wrapper">
            <div class="icon">
              <iconify-icon icon="ph:package-duotone" width="26"></iconify-icon>
            </div>
            <span class="provider-badge">${this.bucket.providerName}</span>
          </div>
          <div class="actions">
            <button 
              class="action-btn"
              @click=${this._handleExplore}
              title="Explore">
              <iconify-icon icon="ph:folder-open-bold" width="20"></iconify-icon>
            </button>
            <button 
              class="action-btn delete"
              @click=${this._handleDelete}
              title="Delete">
              <iconify-icon icon="ph:trash-simple-bold" width="20"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="content">
          <h3 class="bucket-name">${this.bucket.name}</h3>
          <div class="metadata">
            <p class="date">${this._formatDate(this.bucket.creationDate)}</p>
            <span id="stats-${this.bucket.providerId}-${this.bucket.name}" class="stats"></span>
            <button class="stats-btn" @click=${this._handleRefreshStats} title="Refresh Stats">
              <iconify-icon icon="ph:arrows-clockwise-bold"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="footer">
          <span class="status ${this.bucket.isPublic ? 'public' : 'private'}">
            ${this.bucket.isPublic ? 'Public' : 'Private'}
          </span>
          <label class="toggle-container">
            <input 
              type="checkbox" 
              class="toggle-input"
              .checked=${this.bucket.isPublic}
              @change=${this._handleToggle}>
            <span class="toggle-switch"></span>
          </label>
        </div>
      </div>
    `;
  }

  private _formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(this.lang);
  }

  private _handleExplore() {
    this.dispatchEvent(new CustomEvent('explore', {
      detail: { bucket: this.bucket },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete', {
      detail: { bucket: this.bucket },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRefreshStats() {
    this.dispatchEvent(new CustomEvent('refresh-stats', {
      detail: { bucket: this.bucket },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleToggle(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dispatchEvent(new CustomEvent('policy-change', {
      detail: { 
        bucket: this.bucket, 
        isPublic: input.checked 
      },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bucket-card': BucketCard;
  }
}
