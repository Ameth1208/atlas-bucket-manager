import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import { TW } from '../styles/tailwind-classes';

// Declare Plyr global
declare global {
  interface Window {
    Plyr: any;
  }
}

@customElement('video-viewer')
export class VideoViewer extends LitElement {
  @property({ type: String }) src = '';
  @property({ type: String }) type = 'mp4';
  
  @state() loading = true;

  private plyrInstance: any = null;
  private videoElementRef: Ref<HTMLVideoElement> = createRef();

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // ============================================
  // PLYR INITIALIZATION
  // ============================================

  private initPlyr() {
    // Wait for element to be available
    if (!this.videoElementRef.value) return;

    // Destroy previous instance if exists
    this.destroyPlyr();

    // Wait for Plyr to be available
    if (typeof window.Plyr === 'undefined') {
      console.warn('Plyr not loaded yet, retrying...');
      setTimeout(() => this.initPlyr(), 100);
      return;
    }

    // Initialize Plyr with custom options
    this.plyrInstance = new window.Plyr(this.videoElementRef.value, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['speed', 'quality'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      autoplay: false
    });

    this.loading = false;
  }

  private destroyPlyr() {
    if (this.plyrInstance) {
      try {
        this.plyrInstance.destroy();
      } catch (e) {
        console.warn('Error destroying Plyr:', e);
      }
      this.plyrInstance = null;
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  firstUpdated() {
    // Initialize Plyr after first render
    requestAnimationFrame(() => {
      this.initPlyr();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroyPlyr();
  }

  // ============================================
  // RENDER
  // ============================================

  private getMimeType(): string {
    const typeMap: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/mp4',
      'mkv': 'video/webm'
    };
    return typeMap[this.type.toLowerCase()] || 'video/mp4';
  }

  render() {
    return html`
      <div class="w-full flex items-center justify-center" style="max-height: 75vh;">
        ${this.loading ? html`
          <div class="${TW.previewModal.placeholder}">
            <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
          </div>
        ` : ''}
        
        <video 
          ${ref(this.videoElementRef)}
          class="${TW.previewModal.video}"
          playsinline
          controls
        >
          <source src="${this.src}" type="${this.getMimeType()}" />
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  }
}
