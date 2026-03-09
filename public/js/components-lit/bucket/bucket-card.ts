import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "../styles/tailwind-classes";

export interface Bucket {
  name: string;
  providerId: string;
  providerName: string;
  creationDate: string;
  isPublic: boolean;
  count?: number;
  size?: number;
}

@customElement("bucket-card")
export class BucketCard extends LitElement {
  @property({ type: Object }) bucket!: Bucket;
  @property({ type: String }) lang = "en";

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  render() {
    return html`
      <div class="${TW.bucketCard.container} group">
        <div class="${TW.bucketCard.header}">
          <div class="${TW.bucketCard.iconWrapper}">
            <div class="${TW.bucketCard.icon}">
              <iconify-icon icon="ph:package-duotone" width="26"></iconify-icon>
            </div>
            <span class="${TW.bucketCard.providerBadge}"
              >${this.bucket.providerName}</span
            >
          </div>
          <div class="${TW.bucketCard.actions}">
            <button
              class="${TW.bucketCard.actionBtn}"
              @click=${this._handleExplore}
              title="Explore"
            >
              <iconify-icon
                icon="ph:folder-open-bold"
                width="20"
              ></iconify-icon>
            </button>
            <button
              class="${TW.bucketCard.actionBtn} ${TW.bucketCard
                .actionBtnDelete}"
              @click=${this._handleDelete}
              title="Delete"
            >
              <iconify-icon
                icon="ph:trash-simple-bold"
                width="20"
              ></iconify-icon>
            </button>
          </div>
        </div>

        <div class="${TW.bucketCard.content}">
          <h3 class="${TW.bucketCard.bucketName}">${this.bucket.name}</h3>
          <div class="${TW.bucketCard.metadata}">
            <p class="${TW.bucketCard.date}">
              ${this._formatDate(this.bucket.creationDate)}
            </p>
            <span
              id="stats-${this.bucket.providerId}-${this.bucket.name}"
              class="${TW.bucketCard.stats}"
            ></span>
            <button
              class="${TW.bucketCard.statsBtn}"
              @click=${this._handleRefreshStats}
              title="Load Stats"
            >
              <iconify-icon icon="ph:arrows-clockwise-bold"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="${TW.bucketCard.footer}">
          <span
            class="${this.bucket.isPublic
              ? TW.bucketCard.statusPublic
              : TW.bucketCard.statusPrivate}"
          >
            ${this.bucket.isPublic ? "Public" : "Private"}
          </span>
          <toggle-switch
            .checked=${this.bucket.isPublic}
            @toggle-change=${this._handleToggle}
          ></toggle-switch>
        </div>
      </div>
    `;
  }

  private _formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(this.lang);
  }

  private _handleExplore() {
    this.dispatchEvent(
      new CustomEvent("explore", {
        detail: { bucket: this.bucket },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleDelete() {
    this.dispatchEvent(
      new CustomEvent("delete", {
        detail: { bucket: this.bucket },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleRefreshStats() {
    this.dispatchEvent(
      new CustomEvent("refresh-stats", {
        detail: { bucket: this.bucket },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleToggle(e: CustomEvent) {
    const isPublic = e.detail.checked;
    this.dispatchEvent(
      new CustomEvent("policy-change", {
        detail: {
          bucket: this.bucket,
          isPublic: isPublic,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bucket-card": BucketCard;
  }
}
