import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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

  static styles = css`
    :host {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 60;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-content {
      position: relative;
      width: 100%;
      max-width: 64rem;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .modal-header {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 700;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
    }

    .btn-download {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-download:hover {
      color: rgb(99, 102, 241);
    }

    .btn-close {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 0.75rem;
    }

    .btn-close:hover {
      color: rgb(244, 63, 94);
    }

    .preview-container {
      border-radius: 0.75rem;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .preview-image {
      max-width: 100%;
      max-height: 75vh;
      object-fit: contain;
      border-radius: 0.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .preview-video,
    .preview-audio {
      max-width: 100%;
      max-height: 75vh;
      border-radius: 0.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .preview-pdf {
      width: 100%;
      height: 75vh;
      border-radius: 0.5rem;
      border: none;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      background: white;
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .icon-container {
      padding: 1.5rem;
      border-radius: 9999px;
    }

    .icon-container.audio {
      background: rgba(6, 182, 212, 0.2);
      color: rgb(34, 211, 238);
    }

    .icon-container.android {
      background: rgba(34, 197, 94, 0.2);
      color: rgb(74, 222, 128);
    }

    .icon-container.default {
      background: rgba(148, 163, 184, 0.2);
      color: rgb(203, 213, 225);
    }

    .file-name {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin-top: 1rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .loading {
      color: rgba(255, 255, 255, 0.5);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `;

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
        <div class="preview-placeholder">
          <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="loading"></iconify-icon>
        </div>
      `;
    }

    const ext = this.getFileExtension();
    const url = this.getPreviewUrl();

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return html`<img src="${url}" class="preview-image animate-fade-in" @load="${() => this.loading = false}" />`;
    }

    // Videos
    if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
      return html`<video src="${url}" controls autoplay class="preview-video"></video>`;
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
      return html`
        <div class="preview-placeholder animate-fade-in">
          <div class="icon-container audio">
            <iconify-icon icon="ph:music-notes-fill" width="64"></iconify-icon>
          </div>
          <audio src="${url}" controls autoplay style="width: 100%; height: 48px;"></audio>
          <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; font-weight: 500;">Playing audio file</p>
        </div>
      `;
    }

    // PDF
    if (ext === 'pdf') {
      return html`<iframe src="${url}" class="preview-pdf"></iframe>`;
    }

    // APK
    if (ext === 'apk') {
      return html`
        <div class="preview-placeholder animate-fade-in">
          <div class="icon-container android">
            <iconify-icon icon="ph:android-logo-fill" width="64"></iconify-icon>
          </div>
          <div style="text-align: center;">
            <h3 style="color: white; font-size: 1.25rem; font-weight: 700;">Android Package (APK)</h3>
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.875rem; margin-top: 0.5rem;">Preview not available for binaries.</p>
          </div>
        </div>
      `;
    }

    // Default (no preview)
    return html`
      <div class="preview-placeholder">
        <div class="icon-container default">
          <iconify-icon icon="ph:file-dashed-duotone" width="64"></iconify-icon>
        </div>
        <p style="color: rgba(255, 255, 255, 0.5); margin-top: 1rem;">No preview available</p>
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
      <div class="modal-backdrop" @click="${this.handleClose}">
        <div class="modal-content" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <button class="btn btn-download" @click="${this.handleDownload}">
              <iconify-icon icon="ph:download-bold"></iconify-icon>
              Download
            </button>
            <button class="btn btn-close" @click="${this.handleClose}">
              <iconify-icon icon="ph:x-bold" width="20"></iconify-icon>
            </button>
          </div>
          <div class="preview-container">
            ${this.renderPreviewContent()}
          </div>
          ${this.file ? html`<p class="file-name">${this.file.file}</p>` : ''}
        </div>
      </div>
    `;
  }
}
