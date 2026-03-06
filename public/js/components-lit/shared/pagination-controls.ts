import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pagination-controls')
export class PaginationControls extends LitElement {
  @property({ type: Number }) total = 0;
  @property({ type: Number }) page = 1;
  @property({ type: Number }) pageSize = 100;

  static styles = css`
    :host {
      display: block;
      padding: 1rem 0;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .info {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      font-weight: 500;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 0.75rem;
      background: var(--bg-secondary, #f1f5f9);
      border: none;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-primary, #1e293b);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn:hover:not(:disabled) {
      background: var(--color-rose-500, #f43f5e);
      color: white;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .page-btn {
      min-width: 2rem;
      height: 2rem;
      padding: 0.25rem 0.5rem;
      background: none;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-muted, #64748b);
    }

    .page-btn:hover:not(.active) {
      background: var(--bg-secondary, #f1f5f9);
    }

    .page-btn.active {
      background: var(--color-rose-500, #f43f5e);
      color: white;
    }

    .ellipsis {
      padding: 0.25rem 0.5rem;
      color: var(--text-muted, #64748b);
    }

    @media (max-width: 640px) {
      .container {
        flex-direction: column;
        align-items: stretch;
      }

      .info {
        text-align: center;
      }

      .controls {
        justify-content: center;
      }
    }
  `;

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
      return html`<div class="container"><span class="info">No items</span></div>`;
    }

    return html`
      <div class="container">
        <span class="info">
          Showing ${this.start} - ${this.end} of ${this.total} items
        </span>

        <div class="controls">
          <button 
            class="btn"
            ?disabled=${!this.hasPrev}
            @click=${this._handlePrevious}>
            <iconify-icon icon="ph:caret-left-bold" width="16"></iconify-icon>
            Previous
          </button>

          ${this._renderPageNumbers()}

          <button 
            class="btn"
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
      <div class="page-numbers">
        ${pages.map(page => {
          if (page === '...') {
            return html`<span class="ellipsis">...</span>`;
          }
          return html`
            <button
              class="page-btn ${page === this.page ? 'active' : ''}"
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
