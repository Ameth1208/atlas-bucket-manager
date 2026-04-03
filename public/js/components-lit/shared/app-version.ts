import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("app-version")
export class AppVersion extends LitElement {
  @property({ type: String }) version = "1.0.0";
  @state() private currentLang = "en";
  @state() private tFn: ((key: string) => string) | null = null;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.currentLang = localStorage.getItem("lang") || "en";
    
    window.addEventListener("languageChanged", this.handleLanguageChange as EventListener);
    
    const checkT = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).t) {
        this.tFn = (window as any).t;
        clearInterval(checkT);
        this.requestUpdate();
      }
    }, 100);
    
    setTimeout(() => clearInterval(checkT), 5000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("languageChanged", this.handleLanguageChange as EventListener);
  }

  private handleLanguageChange = (e: Event): void => {
    this.currentLang = (e as CustomEvent).detail;
  };

  private t(key: string): string {
    if (this.tFn) {
      return this.tFn(key);
    }
    const fallback: Record<string, Record<string, string>> = {
      en: { appName: "Atlas Bucket Manager", versionLabel: "Version", authorLabel: "by" },
      es: { appName: "Atlas Bucket Manager", versionLabel: "Versión", authorLabel: "por" },
      pt: { appName: "Atlas Bucket Manager", versionLabel: "Versão", authorLabel: "por" },
      fr: { appName: "Atlas Bucket Manager", versionLabel: "Version", authorLabel: "par" },
      ja: { appName: "Atlas Bucket Manager", versionLabel: "バージョン", authorLabel: "作者" },
      zh: { appName: "Atlas Bucket Manager", versionLabel: "版本", authorLabel: "作者" },
    };
    return fallback[this.currentLang]?.[key] || fallback.en[key] || key;
  }

  render() {
    return html`
      <div class="fixed bottom-4 left-4 z-30 group">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 cursor-help">
          <iconify-icon icon="ph:info" class="text-slate-400 dark:text-slate-500" width="14" aria-hidden="true"></iconify-icon>
          <span class="text-xs font-mono text-slate-600 dark:text-slate-400">v${this.version}</span>
        </div>

        <div class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#1c1c1e] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div class="font-semibold">${this.t("appName")}</div>
          <div class="text-slate-300">${this.t("versionLabel")} ${this.version}</div>
          <div class="text-slate-400 text-[10px] mt-1">${this.t("authorLabel")} Ameth Galarcio</div>
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
