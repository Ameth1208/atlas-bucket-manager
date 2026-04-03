import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface ContextMenuItem {
  label: string;
  icon: string;
  action: string;
  danger?: boolean;
  divider?: boolean;
  shortcut?: string;
}

@customElement("context-menu")
export class ContextMenu extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Number }) x = 0;
  @property({ type: Number }) y = 0;
  @property({ type: Array }) menuItems: ContextMenuItem[] = [];
  @property({ type: Object }) target: any = null;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onClickOutside = this._onClickOutside.bind(this);
    document.addEventListener("click", this._onClickOutside);
    document.addEventListener("contextmenu", this._onClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onClickOutside);
    document.removeEventListener("contextmenu", this._onClickOutside);
  }

  private _onClickOutside() {
    if (this.open) this.close();
  }

  public show(x: number, y: number, target: any, isFolder: boolean) {
    this.target = target;
    this.menuItems = isFolder ? this._folderMenu() : this._fileMenu();

    // Position: keep inside viewport
    const menuW = 200;
    const menuH = this.menuItems.length * 40 + 16;
    this.x = x + menuW > window.innerWidth ? x - menuW : x;
    this.y = y + menuH > window.innerHeight ? y - menuH : y;

    this.open = true;
  }

  public close() {
    this.open = false;
  }

  private _folderMenu(): ContextMenuItem[] {
    return [
      { label: "Open", icon: "ph:folder-open-duotone", action: "navigate", shortcut: "↵" },
      { label: "Copy folder", icon: "ph:copy-duotone", action: "copy-folder", divider: true },
      { label: "Delete", icon: "ph:trash-duotone", action: "delete", danger: true, shortcut: "⌫" },
    ];
  }

  private _fileMenu(): ContextMenuItem[] {
    return [
      { label: "Preview", icon: "ph:eye-duotone", action: "preview", shortcut: "↵" },
      { label: "Download", icon: "ph:download-simple-duotone", action: "download", shortcut: "⌘D" },
      { label: "Share link", icon: "ph:link-duotone", action: "share", shortcut: "⌘S", divider: true },
      { label: "Delete", icon: "ph:trash-duotone", action: "delete", danger: true, shortcut: "⌫" },
    ];
  }

  private _handleAction(action: string) {
    this.close();
    this.dispatchEvent(
      new CustomEvent("menu-action", {
        detail: { action, item: this.target },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div
        class="fixed z-[70] min-w-[220px] py-1.5 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl rounded-xl border border-slate-200/80 dark:border-dark-700 shadow-2xl"
        style="left: ${this.x}px; top: ${this.y}px"
        @click=${(e: Event) => e.stopPropagation()}
      >
        ${this.menuItems.map(
          (item) => html`
            ${item.divider
              ? html`<div class="my-1 mx-3 border-t border-slate-100 dark:border-dark-800"></div>`
              : ""}
            <button
              class="w-full flex items-center gap-3 px-3 py-1.5 mx-1 rounded-lg text-sm transition-colors cursor-pointer border-0 bg-transparent
                ${item.danger
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500"}"
              style="width: calc(100% - 8px)"
              @click=${() => this._handleAction(item.action)}
            >
              <iconify-icon icon="${item.icon}" width="18"></iconify-icon>
              <span class="font-medium flex-1 text-left">${item.label}</span>
              ${item.shortcut
                ? html`<kbd class="h-[18px] px-1 flex items-center justify-center rounded-md bg-slate-100 dark:bg-dark-800 text-[10px] font-medium text-slate-400 dark:text-slate-500">${item.shortcut}</kbd>`
                : ""}
            </button>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "context-menu": ContextMenu;
  }
}
