import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

@customElement('pagination-controls')
export class PaginationControls extends LitElement {
  @property({ type: Number }) total = 0;
  @property({ type: Number }) page = 1;
  @property({ type: Number }) pageSize = 100;

  // Desactivar Shadow DOM para usar Tailwind directamente
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get hasNext(): boolean {
    return this.page < this.totalPages;
  }

  get hasPrev(): boolean {
    return this.page > 1;
  }

  get start(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  get end(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  render() {
    if (this.total === 0) {
      return html`<div class="${TW.pagination.container}"><span class="${TW.pagination.info}">No items</span></div>`;
    }

    return html`
      <div class="${TW.pagination.container}">
        <span class="${TW.pagination.info}">
          Showing ${this.start} - ${this.end} of ${this.total} items
        </span>

        <div class="${TW.pagination.controls}">
          <button 
            class="${TW.pagination.button} ${!this.hasPrev ? TW.pagination.buttonDisabled : TW.pagination.buttonInactive} flex items-center gap-1"
            ?disabled=${!this.hasPrev}
            @click=${this._handlePrevious}>
            <iconify-icon icon="ph:caret-left-bold" width="16"></iconify-icon>
            Previous
          </button>

          ${this._renderPageNumbers()}

          <button 
            class="${TW.pagination.button} ${!this.hasNext ? TW.pagination.buttonDisabled : TW.pagination.buttonInactive} flex items-center gap-1"
            ?disabled=${!this.hasNext}
            @click=${this._handleNext}>
            Next
            <iconify-icon icon="ph:caret-right-bold" width="16"></iconify-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _renderPageNumbers() {
    const pages = this._getPageRange();
    
    return html`
      <div class="flex gap-1">
        ${pages.map(page => {
          if (page === '...') {
            return html`<span class="px-2 py-1 text-slate-400">...</span>`;
          }
          return html`
            <button
              class="${TW.pagination.button} ${page === this.page ? TW.pagination.buttonActive : TW.pagination.buttonInactive} min-w-[2rem] h-8"
              @click=${() => this._handlePageClick(page as number)}>
              ${page}
            </button>
          `;
        })}
      </div>
    `;
  }

  private _getPageRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 2; // Number of pages to show on each side

    if (total <= 7) {
      // Show all pages if total is small
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Always show first page
    const range: (number | string)[] = [1];

    if (current <= delta + 2) {
      // Near the start
      for (let i = 2; i <= Math.min(delta + 3, total - 1); i++) {
        range.push(i);
      }
      range.push('...');
    } else if (current >= total - (delta + 1)) {
      // Near the end
      range.push('...');
      for (let i = total - (delta + 2); i < total; i++) {
        range.push(i);
      }
    } else {
      // Middle
      range.push('...');
      for (let i = current - delta; i <= current + delta; i++) {
        range.push(i);
      }
      range.push('...');
    }

    // Always show last page
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  private _handlePrevious() {
    if (this.hasPrev) {
      this._changePage(this.page - 1);
    }
  }

  private _handleNext() {
    if (this.hasNext) {
      this._changePage(this.page + 1);
    }
  }

  private _handlePageClick(page: number) {
    this._changePage(page);
  }

  private _changePage(newPage: number) {
    this.page = newPage;
    this.dispatchEvent(new CustomEvent('page-change', {
      detail: { page: newPage },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pagination-controls': PaginationControls;
  }
}
