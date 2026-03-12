import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

interface ImageTransform {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

@customElement('image-viewer')
export class ImageViewer extends LitElement {
  @property({ type: String }) src = '';
  @property({ type: String }) filename = '';

  @state() imageTransform: ImageTransform = {
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0
  };
  @state() isDragging = false;
  @state() dragStart = { x: 0, y: 0 };
  @state() loading = true;

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // ============================================
  // IMAGE CONTROLS
  // ============================================

  private handleZoomIn() {
    this.imageTransform = {
      ...this.imageTransform,
      scale: Math.min(this.imageTransform.scale + 0.25, 5)
    };
  }

  private handleZoomOut() {
    this.imageTransform = {
      ...this.imageTransform,
      scale: Math.max(this.imageTransform.scale - 0.25, 0.5)
    };
  }

  private handleRotateLeft() {
    this.imageTransform = {
      ...this.imageTransform,
      rotation: this.imageTransform.rotation - 90
    };
  }

  private handleRotateRight() {
    this.imageTransform = {
      ...this.imageTransform,
      rotation: this.imageTransform.rotation + 90
    };
  }

  private handleReset() {
    this.imageTransform = {
      scale: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0
    };
  }

  private handleImageWheel(e: WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.handleZoomIn();
    } else {
      this.handleZoomOut();
    }
  }

  private handleImageMouseDown(e: MouseEvent) {
    if (this.imageTransform.scale <= 1) return;
    this.isDragging = true;
    this.dragStart = {
      x: e.clientX - this.imageTransform.translateX,
      y: e.clientY - this.imageTransform.translateY
    };
  }

  private handleImageMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.imageTransform = {
      ...this.imageTransform,
      translateX: e.clientX - this.dragStart.x,
      translateY: e.clientY - this.dragStart.y
    };
  }

  private handleImageMouseUp() {
    this.isDragging = false;
  }

  private getImageTransformStyle(): string {
    const { scale, rotation, translateX, translateY } = this.imageTransform;
    return `transform: scale(${scale}) rotate(${rotation}deg) translate(${translateX}px, ${translateY}px); transition: ${this.isDragging ? 'none' : 'transform 0.2s ease'};`;
  }

  private handleImageLoad() {
    this.loading = false;
  }

  // ============================================
  // RENDER
  // ============================================

  private renderToolbar() {
    return html`
      <div class="${TW.previewModal.imageToolbar}">
        <button class="${TW.previewModal.btnControl}" @click="${this.handleReset}" title="Reset">
          <iconify-icon icon="ph:arrows-clockwise-bold" width="18"></iconify-icon>
        </button>
        <button class="${TW.previewModal.btnControl}" @click="${this.handleRotateLeft}" title="Rotate Left">
          <iconify-icon icon="ph:arrow-counter-clockwise-bold" width="18"></iconify-icon>
        </button>
        <button class="${TW.previewModal.btnControl}" @click="${this.handleRotateRight}" title="Rotate Right">
          <iconify-icon icon="ph:arrow-clockwise-bold" width="18"></iconify-icon>
        </button>
        <button class="${TW.previewModal.btnControl}" @click="${this.handleZoomOut}" title="Zoom Out">
          <iconify-icon icon="ph:minus-bold" width="18"></iconify-icon>
        </button>
        <span class="${TW.previewModal.zoomLevel}">${Math.round(this.imageTransform.scale * 100)}%</span>
        <button class="${TW.previewModal.btnControl}" @click="${this.handleZoomIn}" title="Zoom In">
          <iconify-icon icon="ph:plus-bold" width="18"></iconify-icon>
        </button>
      </div>
    `;
  }

  render() {
    return html`
      <div class="flex flex-col w-full" style="max-height: 75vh;">
        <!-- Fixed Toolbar at Top -->
        <div class="flex-shrink-0 mb-4">
          ${this.renderToolbar()}
        </div>
        
        <!-- Scrollable Image Container -->
        <div 
          class="${TW.previewModal.imageContainer}"
          style="max-height: calc(75vh - 60px);"
          @wheel="${this.handleImageWheel}"
          @mousedown="${this.handleImageMouseDown}"
          @mousemove="${this.handleImageMouseMove}"
          @mouseup="${this.handleImageMouseUp}"
          @mouseleave="${this.handleImageMouseUp}"
        >
          ${this.loading ? html`
            <div class="${TW.previewModal.placeholder}">
              <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
            </div>
          ` : ''}
          
          <img 
            src="${this.src}" 
            class="${TW.previewModal.image}" 
            style="${this.getImageTransformStyle()}"
            @load="${this.handleImageLoad}"
            draggable="false"
            alt="${this.filename}"
          />
        </div>
      </div>
    `;
  }

  // Reset on disconnect
  disconnectedCallback() {
    super.disconnectedCallback();
    this.handleReset();
  }
}
