import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';
import { copyModalTranslations } from '../../i18n/translations/copy-modal.i18n';

export interface Provider {
  id: string;
  name: string;
}

export interface SourceBucket {
  name: string;
  providerId: string;
  providerName: string;
  count?: number;
  size?: number;
}

export interface Bucket {
  name: string;
  providerId: string;
}

@customElement('copy-bucket-modal')
export class CopyBucketModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) sourceBucket?: SourceBucket;
  @property({ type: Array }) providers: Provider[] = [];
  @property({ type: Array }) allBuckets: Bucket[] = [];
  @property({ type: String }) lang = 'en';

  @state() targetProviderId = '';
  @state() targetBucketName = '';
  @state() targetBucketSearch = '';
  @state() skipExisting = true;
  @state() overwrite = false;
  @state() availableBuckets: Bucket[] = [];

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set default target provider (different from source)
    if (this.providers.length > 0 && this.sourceBucket) {
      const differentProvider = this.providers.find(p => p.id !== this.sourceBucket?.providerId);
      if (differentProvider) {
        this.targetProviderId = differentProvider.id;
        this.updateAvailableBuckets();
      }
    }
  }

  private updateAvailableBuckets() {
    this.availableBuckets = this.allBuckets.filter(b => 
      b.providerId === this.targetProviderId && 
      b.name !== this.sourceBucket?.name
    );
  }

  private handleProviderChange(e: Event) {
    this.targetProviderId = (e.target as HTMLSelectElement).value;
    this.targetBucketName = '';
    this.targetBucketSearch = '';
    this.updateAvailableBuckets();
  }

  private handleBucketSearch(e: Event) {
    this.targetBucketSearch = (e.target as HTMLInputElement).value.toLowerCase();
    this.targetBucketName = this.targetBucketSearch;
  }

  private selectBucket(bucketName: string) {
    this.targetBucketName = bucketName;
    this.targetBucketSearch = bucketName;
  }

  private get filteredBuckets() {
    if (!this.targetBucketSearch) return this.availableBuckets.slice(0, 5);
    return this.availableBuckets
      .filter(b => b.name.toLowerCase().includes(this.targetBucketSearch))
      .slice(0, 5);
  }

  private bucketExists() {
    return this.availableBuckets.some(b => b.name.toLowerCase() === this.targetBucketSearch.toLowerCase());
  }

  private handleClose() {
    this.open = false;
    this.resetForm();
    this.dispatchEvent(new CustomEvent('close'));
  }

  private handleCopy() {
    if (!this.targetProviderId || !this.targetBucketName.trim()) {
      this.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: this.t('errorRequired'), type: 'error' },
        bubbles: true,
        composed: true
      }));
      return;
    }

    // Validate bucket name (S3 rules)
    const bucketNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!bucketNameRegex.test(this.targetBucketName)) {
      this.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: this.t('errorInvalidName'), type: 'error' },
        bubbles: true,
        composed: true
      }));
      return;
    }

    this.dispatchEvent(new CustomEvent('start-copy', {
      detail: {
        sourceProviderId: this.sourceBucket?.providerId,
        sourceBucket: this.sourceBucket?.name,
        targetProviderId: this.targetProviderId,
        targetBucket: this.targetBucketName,
        options: {
          skipExisting: this.skipExisting,
          overwrite: this.overwrite
        }
      },
      bubbles: true,
      composed: true
    }));

    this.handleClose();
  }

  private resetForm() {
    this.targetBucketName = '';
    this.targetBucketSearch = '';
    this.skipExisting = true;
    this.overwrite = false;
    this.availableBuckets = [];
  }

  private formatSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private t(key: string): string {
    return copyModalTranslations[this.lang]?.[key] || copyModalTranslations['en'][key] || key;
  }

  render() {
    if (!this.open || !this.sourceBucket) return html``;

    return html`
      <div class="${TW.copyModal.backdrop}" @click="${this.handleClose}">
        <div class="${TW.copyModal.content}" @click="${(e: Event) => e.stopPropagation()}">
          <!-- Header -->
          <div class="${TW.copyModal.iconContainer}">
            <iconify-icon icon="ph:copy-bold" width="24"></iconify-icon>
          </div>
          
          <h3 class="${TW.copyModal.title}">${this.t('copyTitle')}</h3>
          <p class="${TW.copyModal.description}">
            ${this.t('copyDescription')}
          </p>

          <!-- Source Bucket Info -->
          <div class="${TW.copyModal.sourceSection}">
            <div class="${TW.copyModal.sectionLabel}">${this.t('sourceLabel')}</div>
            <div class="${TW.copyModal.sourceBucket}">
              <div class="${TW.copyModal.bucketIcon}">
                <iconify-icon icon="ph:package-duotone" width="24"></iconify-icon>
              </div>
              <div class="${TW.copyModal.bucketInfo}">
                <div class="${TW.copyModal.bucketName}">${this.sourceBucket.name}</div>
                <div class="${TW.copyModal.bucketMeta}">
                  ${this.sourceBucket.providerName}
                  ${this.sourceBucket.count !== undefined ? ` • ${this.sourceBucket.count} ${this.t('filesCount')}` : ''}
                  ${this.sourceBucket.size !== undefined ? ` • ${this.formatSize(this.sourceBucket.size)}` : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Arrow Divider -->
          <div class="${TW.copyModal.arrowDivider}">
            <iconify-icon icon="ph:arrow-down-bold" width="24" class="${TW.copyModal.arrowIcon}"></iconify-icon>
          </div>

          <!-- Target Configuration -->
          <div class="${TW.copyModal.targetSection}">
            <div class="${TW.copyModal.sectionLabel}">${this.t('targetLabel')}</div>
            
            <div class="${TW.copyModal.formGroup}">
              <label class="${TW.copyModal.label}">${this.t('targetProviderLabel')}</label>
              <select 
                class="${TW.copyModal.select}"
                .value="${this.targetProviderId}"
                @change="${this.handleProviderChange}">
                <option value="" disabled>${this.t('selectProvider')}</option>
                ${this.providers.map(provider => html`
                  <option value="${provider.id}" ?selected="${provider.id === this.targetProviderId}">
                    ${provider.name}
                  </option>
                `)}
              </select>
            </div>

            <div class="${TW.copyModal.formGroup}">
              <label class="${TW.copyModal.label}">${this.t('targetBucketLabel')}</label>
              
              <!-- Input for search or create new bucket -->
              <input 
                type="text"
                class="${TW.copyModal.input}"
                placeholder="${this.t('bucketSearchPlaceholder')}"
                .value="${this.targetBucketName}"
                @input="${(e: Event) => this.targetBucketName = (e.target as HTMLInputElement).value}"
                @keypress="${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') this.handleCopy();
                }}">
              
              <!-- Show message if bucket will be created -->
              ${this.targetBucketName && !this.availableBuckets.some(b => b.name === this.targetBucketName) ? html`
                <p class="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                  <iconify-icon icon="ph:warning-circle-bold" width="14"></iconify-icon>
                  ${this.t('willCreateNew')}
                </p>
              ` : ''}

              <!-- List of existing buckets -->
              ${this.availableBuckets.length > 0 && this.targetBucketName ? html`
                <div class="mt-2 space-y-1">
                  ${this.availableBuckets
                    .filter(b => b.name.toLowerCase().includes(this.targetBucketName.toLowerCase()))
                    .slice(0, 5)
                    .map(bucket => html`
                      <button
                        type="button"
                        class="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"
                        @click="${() => this.targetBucketName = bucket.name}">
                        <iconify-icon icon="ph:package-duotone" width="16" class="text-slate-400"></iconify-icon>
                        ${bucket.name}
                      </button>
                    `)}
                </div>
              ` : ''}
              
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                ${this.t('bucketNameRules')}
              </p>
            </div>
          </div>

          <!-- Copy Options -->
          <div class="${TW.copyModal.optionsSection}">
            <div class="${TW.copyModal.sectionLabel}">${this.t('optionsLabel')}</div>
            
            <div class="${TW.copyModal.optionItem}">
              <div>
                <div class="${TW.copyModal.optionLabel}">${this.t('skipExistingLabel')}</div>
                <div class="${TW.copyModal.optionDescription}">
                  ${this.t('skipExistingDesc')}
                </div>
              </div>
              <input 
                type="checkbox"
                class="${TW.copyModal.checkbox}"
                ?checked="${this.skipExisting}"
                @change="${(e: Event) => this.skipExisting = (e.target as HTMLInputElement).checked}">
            </div>

            <div class="${TW.copyModal.optionItem}">
              <div>
                <div class="${TW.copyModal.optionLabel}">${this.t('overwriteLabel')}</div>
                <div class="${TW.copyModal.optionDescription}">
                  ${this.t('overwriteDesc')}
                </div>
              </div>
              <input 
                type="checkbox"
                class="${TW.copyModal.checkbox}"
                ?checked="${this.overwrite}"
                @change="${(e: Event) => this.overwrite = (e.target as HTMLInputElement).checked}"
                ?disabled="${!this.skipExisting}">
            </div>
          </div>

          <!-- Actions -->
          <div class="${TW.copyModal.actions}">
            <button class="${TW.copyModal.btnCancel}" @click="${this.handleClose}">
              ${this.t('cancelBtn')}
            </button>
            <button 
              class="${TW.copyModal.btnCopy}"
              @click="${this.handleCopy}"
              ?disabled="${!this.targetProviderId || !this.targetBucketName.trim()}">
              <iconify-icon icon="ph:copy-bold" width="18"></iconify-icon>
              ${this.t('startCopyBtn')}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'copy-bucket-modal': CopyBucketModal;
  }
}
