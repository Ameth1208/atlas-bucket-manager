import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

@customElement('file-placeholder')
export class FilePlaceholder extends LitElement {
  @property({ type: String }) icon = 'ph:file-dashed-duotone';
  @property({ type: String }) title = 'No Preview';
  @property({ type: String }) message = 'Preview not available for this file type';
  @property({ type: String }) iconColor = 'default'; // 'default' | 'android' | 'audio'

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private getIconContainerClass(): string {
    const colorMap: { [key: string]: string } = {
      'default': TW.previewModal.iconContainerDefault,
      'android': TW.previewModal.iconContainerAndroid,
      'audio': TW.previewModal.iconContainerAudio
    };
    return colorMap[this.iconColor] || TW.previewModal.iconContainerDefault;
  }

  render() {
    return html`
      <div class="${TW.previewModal.placeholder}">
        <div class="${this.getIconContainerClass()}">
          <iconify-icon icon="${this.icon}" width="64"></iconify-icon>
        </div>
        <div class="text-center">
          <h3 class="${TW.previewModal.placeholderTitle}">${this.title}</h3>
          <p class="${TW.previewModal.placeholderText} mt-2">${this.message}</p>
        </div>
      </div>
    `;
  }
}
