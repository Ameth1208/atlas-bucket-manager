import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

/**
 * PDF Viewer - Fallback version using iframe
 * This version uses iframe which works better with CORS restrictions
 * but may have issues with some protected PDFs
 */
@customElement('pdf-viewer-fallback')
export class PdfViewerFallback extends LitElement {
  @property({ type: String }) src = '';
  @property({ type: String }) filename = '';
  
  @state() loading = true;
  @state() error = false;

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private handleIframeLoad() {
    this.loading = false;
  }

  private handleIframeError() {
    this.error = true;
    this.loading = false;
  }

  render() {
    if (this.error) {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <div class="${TW.previewModal.iconContainerDefault}">
            <iconify-icon icon="ph:file-x-duotone" width="64"></iconify-icon>
          </div>
          <div class="text-center">
            <h3 class="${TW.previewModal.placeholderTitle}">Error Loading PDF</h3>
            <p class="${TW.previewModal.placeholderText} mt-2">Unable to load this PDF file.</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="w-full h-full flex items-center justify-center relative">
        ${this.loading ? html`
          <div class="absolute inset-0 flex items-center justify-center ${TW.previewModal.placeholder}">
            <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
            <p class="${TW.previewModal.placeholderText} ml-3">Loading PDF...</p>
          </div>
        ` : ''}
        
        <iframe 
          src="${this.src}" 
          class="${TW.previewModal.pdf}"
          @load="${this.handleIframeLoad}"
          @error="${this.handleIframeError}"
          title="${this.filename}"
          style="${this.loading ? 'opacity: 0;' : 'opacity: 1;'}"
        ></iframe>
      </div>
    `;
  }
}
