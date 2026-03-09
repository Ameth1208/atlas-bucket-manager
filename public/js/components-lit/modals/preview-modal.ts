import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

export interface FilePreview {
  providerId: string;
  bucket: string;
  file: string;
}

@customElement('preview-modal')
export class PreviewModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) file: FilePreview | null = null;
  @state() loading = false;
  @state() previewContent = '';
  @state() downloadUrl = '';

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private getFileExtension(): string {
    if (!this.file) return '';
    return this.file.file.split('.').pop()?.toLowerCase() || '';
  }

  private getPreviewUrl(): string {
    if (!this.file) return '';
    return `/api/view/${this.file.providerId}/${this.file.bucket}?file=${encodeURIComponent(this.file.file)}`;
  }

  private renderPreviewContent() {
    if (this.loading) {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
        </div>
      `;
    }

    const ext = this.getFileExtension();
    const url = this.getPreviewUrl();

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return html`<img src="${url}" class="${TW.previewModal.image}" @load="${() => this.loading = false}" />`;
    }

    // Videos
    if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
      return html`<video src="${url}" controls autoplay class="${TW.previewModal.video}"></video>`;
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <div class="${TW.previewModal.iconContainerAudio}">
            <iconify-icon icon="ph:music-notes-fill" width="64"></iconify-icon>
          </div>
          <audio src="${url}" controls autoplay class="${TW.previewModal.audio}"></audio>
          <p class="${TW.previewModal.placeholderText}">Playing audio file</p>
        </div>
      `;
    }

    // PDF
    if (ext === 'pdf') {
      return html`<iframe src="${url}" class="${TW.previewModal.pdf}"></iframe>`;
    }

    // APK
    if (ext === 'apk') {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <div class="${TW.previewModal.iconContainerAndroid}">
            <iconify-icon icon="ph:android-logo-fill" width="64"></iconify-icon>
          </div>
          <div class="text-center">
            <h3 class="${TW.previewModal.placeholderTitle}">Android Package (APK)</h3>
            <p class="${TW.previewModal.placeholderText} mt-2">Preview not available for binaries.</p>
          </div>
        </div>
      `;
    }

    // Default (no preview)
    return html`
      <div class="${TW.previewModal.placeholder}">
        <div class="${TW.previewModal.iconContainerDefault}">
          <iconify-icon icon="ph:file-dashed-duotone" width="64"></iconify-icon>
        </div>
        <p class="${TW.previewModal.placeholderText}">No preview available</p>
      </div>
    `;
  }

  private handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  private handleDownload() {
    if (this.downloadUrl) {
      window.open(this.downloadUrl, '_blank');
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('file') && this.file) {
      this.loading = true;
      // Fetch download URL when file changes
      fetch(`/api/buckets/${this.file.providerId}/${this.file.bucket}/objects/${encodeURIComponent(this.file.file)}/url`)
        .then(res => res.json())
        .then(data => {
          this.downloadUrl = data.url;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    }
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="${TW.previewModal.backdrop}" @click="${this.handleClose}">
        <div class="${TW.previewModal.content}" @click="${(e: Event) => e.stopPropagation()}">
          <div class="${TW.previewModal.header}">
            <button class="${TW.previewModal.btnDownload}" @click="${this.handleDownload}">
              <iconify-icon icon="ph:download-bold"></iconify-icon>
              Download
            </button>
            <button class="${TW.previewModal.btnClose}" @click="${this.handleClose}">
              <iconify-icon icon="ph:x-bold" width="20"></iconify-icon>
            </button>
          </div>
          <div class="${TW.previewModal.previewContainer}">
            ${this.renderPreviewContent()}
          </div>
          ${this.file ? html`<p class="${TW.previewModal.fileName}">${this.file.file}</p>` : ''}
        </div>
      </div>
    `;
  }
}
