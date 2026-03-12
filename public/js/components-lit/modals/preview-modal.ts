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
  @state() downloadUrl = '';

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // ============================================
  // FILE TYPE DETECTION
  // ============================================

  private getFileExtension(): string {
    if (!this.file) return '';
    return this.file.file.split('.').pop()?.toLowerCase() || '';
  }

  private getPreviewUrl(): string {
    if (!this.file) return '';
    return `/api/view/${this.file.providerId}/${this.file.bucket}?file=${encodeURIComponent(this.file.file)}`;
  }

  private getFileName(): string {
    if (!this.file) return '';
    return this.file.file.split('/').pop() || this.file.file;
  }

  private isImage(): boolean {
    const ext = this.getFileExtension();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
  }

  private isVideo(): boolean {
    const ext = this.getFileExtension();
    return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext);
  }

  private isAudio(): boolean {
    const ext = this.getFileExtension();
    return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext);
  }

  private isPDF(): boolean {
    return this.getFileExtension() === 'pdf';
  }

  private isAPK(): boolean {
    return this.getFileExtension() === 'apk';
  }

  // ============================================
  // VIEWER RENDERING
  // ============================================

  private renderViewer() {
    if (this.loading) {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
        </div>
      `;
    }

    const ext = this.getFileExtension();
    const url = this.getPreviewUrl();
    const filename = this.getFileName();

    // Image Viewer
    if (this.isImage()) {
      return html`<image-viewer src="${url}" filename="${filename}"></image-viewer>`;
    }

    // Video Viewer
    if (this.isVideo()) {
      return html`<video-viewer src="${url}" type="${ext}"></video-viewer>`;
    }

    // Audio Viewer
    if (this.isAudio()) {
      return html`<audio-viewer src="${url}" type="${ext}" filename="${filename}"></audio-viewer>`;
    }

    // PDF Viewer
    if (this.isPDF()) {
      return html`<pdf-viewer src="${url}" filename="${filename}"></pdf-viewer>`;
    }

    // APK Placeholder
    if (this.isAPK()) {
      return html`
        <file-placeholder 
          icon="ph:android-logo-fill" 
          title="Android Package (APK)" 
          message="Preview not available for binaries."
          iconColor="android"
        ></file-placeholder>
      `;
    }

    // Default Placeholder
    return html`
      <file-placeholder 
        icon="ph:file-dashed-duotone" 
        title="No Preview Available" 
        message="This file type cannot be previewed."
        iconColor="default"
      ></file-placeholder>
    `;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  private handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  private handleDownload() {
    if (this.downloadUrl) {
      window.open(this.downloadUrl, '_blank');
    }
  }

  private handleBackdropClick(e: Event) {
    // Only close if clicking the backdrop itself, not children
    if (e.target === e.currentTarget) {
      this.handleClose();
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================

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

  // ============================================
  // RENDER
  // ============================================

  render() {
    if (!this.open) return html``;

    return html`
      <div class="${TW.previewModal.backdrop}" @click="${this.handleBackdropClick}">
        <div class="${TW.previewModal.content}" @click="${(e: Event) => e.stopPropagation()}">
          <!-- Header with Actions -->
          <div class="${TW.previewModal.header}">
            <!-- Spacer for layout (toolbar goes here for images) -->
            <div></div>
            
            <!-- Action Buttons -->
            <div class="${TW.previewModal.headerActions}">
              <button class="${TW.previewModal.btnDownload}" @click="${this.handleDownload}">
                <iconify-icon icon="ph:download-bold"></iconify-icon>
                Download
              </button>
              <button class="${TW.previewModal.btnClose}" @click="${this.handleClose}">
                <iconify-icon icon="ph:x-bold" width="20"></iconify-icon>
              </button>
            </div>
          </div>

          <!-- Viewer Container -->
          <div class="${TW.previewModal.previewContainer}">
            ${this.renderViewer()}
          </div>

          <!-- Filename -->
          ${this.file ? html`<p class="${TW.previewModal.fileName}">${this.file.file}</p>` : ''}
        </div>
      </div>
    `;
  }
}
