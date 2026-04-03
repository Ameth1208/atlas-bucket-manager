import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface UploadJob {
  id: string;
  bucket: string;
  current: number;
  total: number;
  currentFile: string;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

@customElement('upload-progress-panel')
export class UploadProgressPanel extends LitElement {
  @state() private jobs: UploadJob[] = [];
  @state() private open = false;
  @state() private collapsed = false;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  public startUpload(uploadId: string, data: { total: number; bucket: string }) {
    this.jobs = [...this.jobs, {
      id: uploadId,
      bucket: data.bucket,
      current: 0,
      total: data.total,
      currentFile: '',
      status: 'uploading',
    }];
    this.open = true;
    this.collapsed = false;
  }

  public updateProgress(uploadId: string, data: { current: number; total: number; fileName: string }) {
    this.jobs = this.jobs.map(j =>
      j.id === uploadId ? { ...j, current: data.current, total: data.total, currentFile: data.fileName } : j
    );
  }

  public completeUpload(uploadId: string) {
    this.jobs = this.jobs.map(j =>
      j.id === uploadId ? { ...j, status: 'completed', current: j.total, currentFile: '' } : j
    );
  }

  public failUpload(uploadId: string, error: string) {
    this.jobs = this.jobs.map(j =>
      j.id === uploadId ? { ...j, status: 'failed', error } : j
    );
  }

  public removeJob(uploadId: string) {
    this.jobs = this.jobs.filter(j => j.id !== uploadId);
    if (this.jobs.length === 0) this.open = false;
  }

  private handleClose() {
    const hasActive = this.jobs.some(j => j.status === 'uploading');
    if (hasActive) {
      this.collapsed = !this.collapsed;
    } else {
      this.open = false;
      this.jobs = [];
    }
  }

  private renderJob(job: UploadJob) {
    const percent = job.total > 0 ? Math.round((job.current / job.total) * 100) : 0;
    const isUploading = job.status === 'uploading';
    
    const progressColor = job.status === 'completed' ? 'bg-green-500' : job.status === 'failed' ? 'bg-red-500' : 'bg-rose-500';
    const badgeColor = job.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : job.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';

    return html`
      <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mb-3 last:mb-0">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center text-sm font-medium text-slate-700 dark:text-white">
            <iconify-icon icon="ph:upload-simple-bold" width="14" class="mr-1"></iconify-icon>
            ${job.bucket}
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}">
            ${job.status.toUpperCase()}
          </span>
        </div>

        <div class="mb-3">
          <div class="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${progressColor}" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-slate-500 dark:text-white/50">${job.current} / ${job.total} files</span>
            <span class="text-xs font-medium text-slate-600 dark:text-white/70">${percent}%</span>
          </div>
        </div>

        ${isUploading && job.currentFile ? html`
          <div class="text-xs text-slate-500 dark:text-white/50 truncate">
            <span class="font-medium text-slate-600 dark:text-white/70">Uploading:</span> ${job.currentFile}
          </div>
        ` : ''}

        ${job.status === 'failed' && job.error ? html`
          <div class="text-xs text-red-500">${job.error}</div>
        ` : ''}

        ${!isUploading ? html`
          <div class="flex justify-end gap-2 mt-3">
            <button class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20 cursor-pointer" @click="${() => this.removeJob(job.id)}">
              <iconify-icon icon="ph:check-bold" width="14"></iconify-icon>
              Dismiss
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.open || !this.jobs || this.jobs.length === 0) return html``;

    const hasActive = this.jobs.some(j => j.status === 'uploading');
    const headerIconClass = hasActive ? 'bg-rose-500/10 text-rose-500' : 'bg-green-500/10 text-green-500';

    return html`
      <div class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center ${headerIconClass}">
              <iconify-icon icon="${hasActive ? 'ph:circle-notch-bold' : 'ph:check-circle-bold'}" width="20"></iconify-icon>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-800 dark:text-white">
                ${hasActive ? 'Uploading Files' : 'Upload Complete'}
              </div>
              <div class="text-xs text-slate-500 dark:text-white/50">
                ${this.jobs.length} ${this.jobs.length === 1 ? 'upload' : 'uploads'}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer" @click="${this.handleClose}">
              <iconify-icon icon="${this.collapsed ? 'ph:caret-up-bold' : 'ph:x-bold'}" width="20"></iconify-icon>
            </button>
          </div>
        </div>

        ${!this.collapsed ? html`
          <div class="p-4 max-h-80 overflow-y-auto">
            ${this.jobs.map(job => this.renderJob(job))}
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'upload-progress-panel': UploadProgressPanel;
  }
}
