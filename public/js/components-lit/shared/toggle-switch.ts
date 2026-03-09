import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

@customElement('toggle-switch')
export class ToggleSwitch extends LitElement {
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) label = '';

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  private _handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    
    this.dispatchEvent(
      new CustomEvent('toggle-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <label class="${TW.bucketCard.toggleContainer}">
        <input
          type="checkbox"
          class="${TW.bucketCard.toggleInput}"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this._handleChange}
        />
        <span
          class="${TW.bucketCard.toggleSwitch} ${this.checked
            ? TW.bucketCard.toggleSwitchChecked
            : ''}"
        >
          <span
            class="${TW.bucketCard.toggleKnob} ${this.checked
              ? TW.bucketCard.toggleKnobChecked
              : ''}"
          ></span>
        </span>
        ${this.label ? html`<span class="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">${this.label}</span>` : ''}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-switch': ToggleSwitch;
  }
}
