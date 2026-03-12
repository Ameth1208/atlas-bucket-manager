import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import { TW } from "../styles/tailwind-classes";

// Declare PDF.js global
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

@customElement("pdf-viewer")
export class PdfViewer extends LitElement {
  @property({ type: String }) src = "";
  @property({ type: String }) filename = "";

  @state() loading = true;
  @state() currentPage = 1;
  @state() totalPages = 0;
  @state() scale = 1.0;
  @state() error = false;

  private pdfDoc: any = null;
  private canvasRef: Ref<HTMLCanvasElement> = createRef();

  // Disable Shadow DOM to use Tailwind directly
  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  // ============================================
  // PDF.js INITIALIZATION
  // ============================================

  async firstUpdated() {
    await this.loadPdf();
  }

  private async loadPdf() {
    try {
      // Wait for PDF.js to be available
      if (typeof window.pdfjsLib === "undefined") {
        console.warn("PDF.js not loaded yet, retrying...");
        setTimeout(() => this.loadPdf(), 100);
        return;
      }

      // Configure PDF.js worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      console.log("Loading PDF from:", this.src);

      // Load PDF document with CORS options
      const loadingTask = window.pdfjsLib.getDocument({
        url: this.src,
        withCredentials: true,
        isEvalSupported: false,
      });

      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      console.log("PDF loaded successfully. Total pages:", this.totalPages);
      this.loading = false;

      // Render first page
      await this.renderPage(1);
    } catch (err) {
      console.error("Error loading PDF:", err);
      this.error = true;
      this.loading = false;
    }
  }

  private async renderPage(pageNum: number) {
    if (!this.pdfDoc || !this.canvasRef.value) return;

    try {
      // Get page
      const page = await this.pdfDoc.getPage(pageNum);

      // Prepare canvas
      const canvas = this.canvasRef.value;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Calculate viewport with scale
      const viewport = page.getViewport({ scale: this.scale });

      // Set canvas size
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      this.currentPage = pageNum;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  }

  // ============================================
  // CONTROLS
  // ============================================

  private async handlePrevPage() {
    if (this.currentPage > 1) {
      await this.renderPage(this.currentPage - 1);
    }
  }

  private async handleNextPage() {
    if (this.currentPage < this.totalPages) {
      await this.renderPage(this.currentPage + 1);
    }
  }

  private async handleZoomIn() {
    this.scale = Math.min(this.scale + 0.25, 3.0);
    await this.renderPage(this.currentPage);
  }

  private async handleZoomOut() {
    this.scale = Math.max(this.scale - 0.25, 0.5);
    await this.renderPage(this.currentPage);
  }

  private async handleResetZoom() {
    this.scale = 1.0;
    await this.renderPage(this.currentPage);
  }

  // ============================================
  // RENDER
  // ============================================

  private renderToolbar() {
    return html`
      <div
        class="flex items-center justify-between gap-2 bg-white/10 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20 mb-4"
      >
        <div class="flex items-center justify-center">
          <!-- Page Navigation -->
          <button
            class="${TW.previewModal.btnControl}"
            @click="${this.handlePrevPage}"
            ?disabled="${this.currentPage === 1}"
            title="Previous Page"
          >
            <iconify-icon icon="ph:arrow-left-bold" width="18"></iconify-icon>
          </button>

          <span class="px-3 py-1 text-white/70 text-sm font-mono">
            ${this.currentPage} / ${this.totalPages}
          </span>

          <button
            class="${TW.previewModal.btnControl}"
            @click="${this.handleNextPage}"
            ?disabled="${this.currentPage === this.totalPages}"
            title="Next Page"
          >
            <iconify-icon icon="ph:arrow-right-bold" width="18"></iconify-icon>
          </button>
        </div>
        <div class="w-px h-6 bg-white/20 mx-2"></div>
        <div class="flex items-center justify-center">
          <!-- Zoom Controls -->
          <button
            class="${TW.previewModal.btnControl}"
            @click="${this.handleZoomOut}"
            title="Zoom Out"
          >
            <iconify-icon icon="ph:minus-bold" width="18"></iconify-icon>
          </button>

          <span
            class="px-3 py-1 text-white/70 text-sm font-mono min-w-[3.5rem] text-center"
          >
            ${Math.round(this.scale * 100)}%
          </span>

          <button
            class="${TW.previewModal.btnControl}"
            @click="${this.handleZoomIn}"
            title="Zoom In"
          >
            <iconify-icon icon="ph:plus-bold" width="18"></iconify-icon>
          </button>

          <button
            class="${TW.previewModal.btnControl}"
            @click="${this.handleResetZoom}"
            title="Reset Zoom"
          >
            <iconify-icon
              icon="ph:arrows-clockwise-bold"
              width="18"
            ></iconify-icon>
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (this.error) {
      return html`
        <div class="${TW.previewModal.placeholder}">
          <div class="${TW.previewModal.iconContainerDefault}">
            <iconify-icon icon="ph:file-x-duotone" width="64"></iconify-icon>
          </div>
          <div class="text-center">
            <h3 class="${TW.previewModal.placeholderTitle}">
              Error Loading PDF
            </h3>
            <p class="${TW.previewModal.placeholderText} mt-2">
              Unable to load this PDF file.
            </p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="flex flex-col w-full" style="height: 75vh;">
        <!-- Fixed Toolbar at Top -->
        <div class="flex-shrink-0">
          ${!this.loading && this.totalPages > 0 ? this.renderToolbar() : ""}
        </div>

        <!-- Scrollable PDF Container -->
        <div
          class="flex-1 overflow-auto flex items-center justify-center bg-slate-900/50 rounded-lg"
        >
          ${this.loading
            ? html`
                <div class="${TW.previewModal.placeholder}">
                  <iconify-icon
                    icon="line-md:loading-twotone-loop"
                    width="48"
                    class="${TW.previewModal.loading}"
                  ></iconify-icon>
                  <p class="${TW.previewModal.placeholderText}">
                    Loading PDF...
                  </p>
                </div>
              `
            : html`
                <canvas
                  ${ref(this.canvasRef)}
                  class="max-w-full h-auto shadow-2xl rounded-lg my-4"
                ></canvas>
              `}
        </div>
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up PDF document
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
  }
}
