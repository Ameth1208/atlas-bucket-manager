import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * App Version Badge Component
 * Displays app version in bottom-left corner with tooltip
 * - Reactive to language changes
 * - Shows translated tooltip with app info
 * - Version passed via prop from HTML (injected by server)
 */
@customElement("app-version")
export class AppVersion extends LitElement {
  @property({ type: String }) version = "1.0.0";
  @state() private currentLang = "en";

  // Disable Shadow DOM to use global Tailwind CSS
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.currentLang = localStorage.getItem("lang") || "en";
    window.addEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(
      "languageChanged",
      this.handleLanguageChange as EventListener,
    );
  }

  private handleLanguageChange = (e: Event): void => {
    this.currentLang = (e as CustomEvent).detail;
  };

  private t(key: string): string {
    const translations = window.translations || {};
    return (
      translations[this.currentLang]?.[key] || translations["en"]?.[key] || key
    );
  }

  render() {
    return html`
      <div class="fixed bottom-4 left-4 z-30 group">
        <!-- Badge -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-dark-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-help"
        >
          <iconify-icon
            icon="ph:info"
            class="text-slate-400 dark:text-slate-500"
            width="14"
            aria-hidden="true"
          ></iconify-icon>
          <span class="text-xs font-mono text-slate-600 dark:text-slate-400"
            >v${this.version}</span
          >
        </div>

        <!-- Tooltip (appears on hover) -->
        <div
          class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-dark-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
        >
          <div class="font-semibold">${this.t("appName")}</div>
          <div class="text-slate-300">
            ${this.t("versionLabel")} ${this.version}
          </div>
          <div class="text-slate-400 text-[10px] mt-1">
            ${this.t("authorLabel")} Ameth Galarcio
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-version": AppVersion;
  }
}
