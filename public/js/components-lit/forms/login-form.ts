import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

// Helper para obtener traducciones (accede al i18n global)
function t(key: string): string {
  const lang = localStorage.getItem("lang") || "en";
  const translations = (window as any).translations || {};
  return translations[lang]?.[key] || key;
}

@customElement("login-form")
export class LoginForm extends LitElement {
  @state() username = "";
  @state() password = "";
  @state() showPassword = false;
  @state() loading = false;
  @state() error = "";
  @state() lang = "en";

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback() {
    super.connectedCallback();
    // Escuchar cambios de idioma
    window.addEventListener("languageChanged", this.handleLanguageChange);
    this.lang = localStorage.getItem("lang") || "en";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("languageChanged", this.handleLanguageChange);
  }

  private handleLanguageChange = () => {
    this.lang = localStorage.getItem("lang") || "en";
    this.requestUpdate();
  };

  private async handleSubmit(e: Event) {
    e.preventDefault();
    if (this.loading) return;

    this.loading = true;
    this.error = "";

    try {
      this.dispatchEvent(
        new CustomEvent("login", {
          detail: { username: this.username, password: this.password },
        }),
      );
    } catch (err: any) {
      this.error = err.message || "Login failed";
      this.loading = false;
    }
  }

  // API pública para que el orquestador maneje el error
  public setError(msg: string) {
    this.error = msg;
    this.loading = false;
  }

  render() {
    return html`
      <div class="${TW.login.container}">
        <div class="${TW.login.header}">
          <div class="${TW.login.logo}">
            <iconify-icon icon="simple-icons:minio" width="32"></iconify-icon>
          </div>
          <h1 class="${TW.login.title}">${t("loginTitle")}</h1>
          <p class="${TW.login.subtitle}">${t("loginSubtitle")}</p>
        </div>

        <!-- Formulario -->
        <form @submit="${this.handleSubmit}" class="${TW.card.base}">
          <div class="${TW.spacing.stack5}">
            <!-- Username -->
            <div>
              <label class="${TW.label.base}">${t("username")}</label>
              <input
                type="text"
                class="${TW.input.base}"
                placeholder="admin"
                required
                .value="${this.username}"
                @input="${(e: any) => (this.username = e.target.value)}"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="${TW.label.base}">${t("password")}</label>
              <div class="${TW.login.inputWrapper}">
                <input
                  type="${this.showPassword ? "text" : "password"}"
                  class="${TW.input.base} pr-12"
                  placeholder="••••••••"
                  required
                  .value="${this.password}"
                  @input="${(e: any) => (this.password = e.target.value)}"
                />
                <button
                  type="button"
                  class="${TW.login.togglePassword}"
                  @click="${() => (this.showPassword = !this.showPassword)}"
                >
                  <iconify-icon
                    icon="${this.showPassword
                      ? "solar:eye-bold"
                      : "solar:eye-closed-bold"}"
                    width="20"
                  ></iconify-icon>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            ${this.error
              ? html`
                  <div class="${TW.alert.error}">
                    <iconify-icon
                      icon="solar:danger-bold"
                      width="18"
                    ></iconify-icon>
                    <span>${this.error}</span>
                  </div>
                `
              : ""}

            <!-- Submit Button -->
            <button
              type="submit"
              class="${TW.button.primary} ${this.loading
                ? TW.button.disabled
                : ""}"
              ?disabled="${this.loading}"
            >
              ${this.loading
                ? html`<iconify-icon
                    icon="line-md:loading-twotone-loop"
                    width="24"
                  ></iconify-icon>`
                : t("loginBtn")}
            </button>
          </div>
        </form>

        <!-- Footer -->
        <p class="${TW.login.footer}">
          &copy; 2026 Ameth Galarcio. All rights reserved.
        </p>
      </div>
    `;
  }
}
