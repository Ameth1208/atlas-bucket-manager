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

@customElement('audio-viewer')
export class AudioViewer extends LitElement {
  @property({ type: String }) src = '';
  @property({ type: String }) type = 'mp3';
  @property({ type: String }) filename = '';
  
  @state() loading = true;

  private plyrInstance: any = null;
  private audioElementRef: Ref<HTMLAudioElement> = createRef();

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // ============================================
  // PLYR INITIALIZATION
  // ============================================

  private initPlyr() {
    // Wait for element to be available
    if (!this.audioElementRef.value) return;

    // Destroy previous instance if exists
    this.destroyPlyr();

    // Wait for Plyr to be available
    if (typeof window.Plyr === 'undefined') {
      console.warn('Plyr not loaded yet, retrying...');
      setTimeout(() => this.initPlyr(), 100);
      return;
    }

    // Initialize Plyr with custom options for audio
    this.plyrInstance = new window.Plyr(this.audioElementRef.value, {
      controls: [
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings'
      ],
      settings: ['speed'],
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
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'm4a': 'audio/mp4'
    };
    return typeMap[this.type.toLowerCase()] || 'audio/mpeg';
  }

  render() {
    return html`
      <div class="w-full flex items-center justify-center">
        <div class="${TW.previewModal.placeholder}">
          <div class="${TW.previewModal.iconContainerAudio}">
            <iconify-icon icon="ph:music-notes-fill" width="64"></iconify-icon>
          </div>
          
          ${this.loading ? html`
            <iconify-icon icon="line-md:loading-twotone-loop" width="48" class="${TW.previewModal.loading}"></iconify-icon>
          ` : ''}
          
          <audio 
            ${ref(this.audioElementRef)}
            class="${TW.previewModal.audio}"
            controls
          >
            <source src="${this.src}" type="${this.getMimeType()}" />
            Your browser does not support the audio element.
          </audio>
          
          <p class="${TW.previewModal.placeholderText}">Playing audio file</p>
        </div>
      </div>
    `;
  }
}
