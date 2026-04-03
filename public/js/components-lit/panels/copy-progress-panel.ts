import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface CopyJob {
  id: string;
  sourceBucket: string;
  sourceProviderId: string;
  targetBucket: string;
  targetProviderId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    totalFiles: number;
    copiedFiles: number;
    failedFiles: number;
    totalBytes: number;
    copiedBytes: number;
    currentFile: string;
    speed: number;
    eta: number;
  };
  errors: Array<{ file: string; error: string; timestamp: Date }>;
  startedAt?: Date;
  completedAt?: Date;
}

@customElement('copy-progress-panel')
export class CopyProgressPanel extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() jobs: CopyJob[] = [];
  @state() collapsed = false;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this as unknown as HTMLElement;
  }

  public addJob(job: CopyJob) {
    this.jobs = [...this.jobs, job];
    this.open = true;
    this.collapsed = false;
  }

  public updateJob(jobId: string, updates: Partial<CopyJob>) {
    this.jobs = this.jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    );
  }

  public removeJob(jobId: string) {
    this.jobs = this.jobs.filter(job => job.id !== jobId);
    if (this.jobs.length === 0) this.open = false;
  }

  public getActiveJobs(): CopyJob[] {
    return this.jobs.filter(job => job.status === 'running' || job.status === 'pending');
  }

  private handleClose() {
    const hasActive = this.getActiveJobs().length > 0;
    if (hasActive) {
      this.collapsed = !this.collapsed;
    } else {
      this.open = false;
      this.jobs = [];
    }
  }

  private handleCancelJob(jobId: string) {
    this.dispatchEvent(new CustomEvent('cancel-job', { detail: { jobId }, bubbles: true, composed: true }));
  }

  private handleDismissJob(jobId: string) {
    this.removeJob(jobId);
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private formatSpeed(bytesPerSec: number): string {
    return `${this.formatBytes(bytesPerSec)}/s`;
  }

  private formatETA(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }

  private formatDuration(start?: Date, end?: Date): string {
    if (!start) return 'N/A';
    const endTime = end || new Date();
    const durationMs = endTime.getTime() - new Date(start).getTime();
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      running: 'ph:circle-notch-bold',
      completed: 'ph:check-circle-bold',
      failed: 'ph:x-circle-bold',
      cancelled: 'ph:warning-circle-bold',
      pending: 'ph:clock-bold'
    };
    return icons[status] || 'ph:circle-bold';
  }

  private getStatusClass(status: string) {
    const classes: Record<string, { icon: string; badge: string; progress: string }> = {
      running: { icon: 'bg-rose-500/10 text-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', progress: 'bg-rose-500' },
      completed: { icon: 'bg-green-500/10 text-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', progress: 'bg-green-500' },
      failed: { icon: 'bg-red-500/10 text-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', progress: 'bg-red-500' },
      cancelled: { icon: 'bg-amber-500/10 text-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', progress: 'bg-red-500' },
      pending: { icon: 'bg-rose-500/10 text-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', progress: 'bg-rose-500' },
    };
    return classes[status] || classes.pending;
  }

  private renderJob(job: CopyJob) {
    const percent = job.progress && job.progress.totalFiles > 0 ? Math.round((job.progress.copiedFiles / job.progress.totalFiles) * 100) : 0;
    const statusClass = this.getStatusClass(job.status);

    return html`
      <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mb-3">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-slate-700 dark:text-white">
            ${job.sourceBucket} → ${job.targetBucket}
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusClass.badge}">
            ${job.status.toUpperCase()}
          </span>
        </div>

        <div class="mb-3">
          <div class="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${statusClass.progress}" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-slate-500 dark:text-white/50">${job.progress?.copiedFiles || 0} / ${job.progress?.totalFiles || 0} files</span>
            <span class="text-xs font-medium text-slate-600 dark:text-white/70">${percent}%</span>
          </div>
        </div>

        ${job.progress ? html`
          <div class="grid grid-cols-3 gap-2 mb-3 text-center">
            <div>
              <span class="block text-xs text-slate-500 dark:text-white/40">Copied</span>
              <span class="block text-sm font-medium text-slate-700 dark:text-white">${this.formatBytes(job.progress.copiedBytes)}</span>
            </div>
            <div>
              <span class="block text-xs text-slate-500 dark:text-white/40">Total</span>
              <span class="block text-sm font-medium text-slate-700 dark:text-white">${this.formatBytes(job.progress.totalBytes)}</span>
            </div>
            ${job.progress.failedFiles > 0 ? html`
              <div>
                <span class="block text-xs text-red-500">Failed</span>
                <span class="block text-sm font-medium text-red-600">${job.progress.failedFiles}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${job.status === 'running' && job.progress?.currentFile ? html`
          <div class="text-xs text-slate-500 dark:text-white/50 truncate mb-2">
            <span class="font-medium text-slate-600 dark:text-white/70">Current:</span> ${job.progress.currentFile}
          </div>
        ` : ''}

        ${job.status === 'running' && job.progress?.speed > 0 ? html`
          <div class="flex items-center gap-4 mb-3">
            <div class="flex items-center gap-1">
              <iconify-icon icon="ph:gauge-bold" width="14" class="text-slate-400"></iconify-icon>
              <span class="text-xs text-slate-600 dark:text-white/70">${this.formatSpeed(job.progress.speed)}</span>
            </div>
            <div class="flex items-center gap-1">
              <iconify-icon icon="ph:clock-bold" width="14" class="text-slate-400"></iconify-icon>
              <span class="text-xs text-slate-600 dark:text-white/70">${this.formatETA(job.progress.eta)}</span>
            </div>
          </div>
        ` : ''}

        ${job.status !== 'running' && job.status !== 'pending' && job.startedAt ? html`
          <div class="text-xs text-slate-500 dark:text-white/50 mb-2">
            <span class="font-medium">Duration:</span> ${this.formatDuration(job.startedAt, job.completedAt)}
          </div>
        ` : ''}

        ${job.errors.length > 0 ? html`
          <div class="mt-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
            <div class="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Errors (${job.errors.length}):</div>
            <div class="space-y-1">
              ${job.errors.slice(0, 3).map(err => html`
                <div class="text-xs text-red-600 dark:text-red-400 truncate">${err.file}: ${err.error}</div>
              `)}
              ${job.errors.length > 3 ? html`
                <div class="text-xs text-red-600">... and ${job.errors.length - 3} more</div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <div class="flex justify-end gap-2 mt-3">
          ${job.status === 'running' ? html`
            <button class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 cursor-pointer" @click="${() => this.handleCancelJob(job.id)}">
              <iconify-icon icon="ph:x-bold" width="14"></iconify-icon>
              Cancel
            </button>
          ` : html`
            <button class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 cursor-pointer" @click="${() => this.handleDismissJob(job.id)}">
              <iconify-icon icon="ph:check-bold" width="14"></iconify-icon>
              Dismiss
            </button>
          `}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open || !this.jobs || this.jobs.length === 0) return html``;

    const activeJobs = this.getActiveJobs();
    const hasActiveJobs = activeJobs.length > 0;
    const mainStatus = hasActiveJobs ? 'running' : (this.jobs.some(j => j.status === 'completed') ? 'completed' : 'failed');
    const statusClass = this.getStatusClass(mainStatus);

    return html`
      <div class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center ${statusClass.icon}">
              <iconify-icon icon="${this.getStatusIcon(mainStatus)}" width="20"></iconify-icon>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-800 dark:text-white">
                ${hasActiveJobs ? 'Copying Buckets' : 'Copy Complete'}
              </div>
              <div class="text-xs text-slate-500 dark:text-white/50">
                ${this.jobs.length} ${this.jobs.length === 1 ? 'job' : 'jobs'}
                ${hasActiveJobs ? ` • ${activeJobs.length} active` : ''}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer" @click="${this.handleClose}">
              <iconify-icon icon="${this.collapsed ? 'ph:caret-up-bold' : 'ph:x-bold'}" width="20"></iconify-icon>
            </button>
          </div>
        </div>

        ${!this.collapsed ? html`
          <div class="p-4 max-h-80 overflow-y-auto">
            ${this.jobs.length === 0 ? html`
              <div class="flex flex-col items-center justify-center py-8">
                <iconify-icon icon="ph:package-duotone" width="48" class="text-slate-300 dark:text-white/20 mb-3"></iconify-icon>
                <div class="text-sm text-slate-500 dark:text-white/50">No copy jobs</div>
              </div>
            ` : this.jobs.map(job => this.renderJob(job))}
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'copy-progress-panel': CopyProgressPanel;
  }
}
