import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

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
    speed: number; // bytes/sec
    eta: number; // seconds
  };
  errors: Array<{
    file: string;
    error: string;
    timestamp: Date;
  }>;
  startedAt?: Date;
  completedAt?: Date;
}

@customElement('copy-progress-panel')
export class CopyProgressPanel extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() jobs: CopyJob[] = [];
  @state() collapsed = false;

  // Disable Shadow DOM to use Tailwind directly
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
    if (this.jobs.length === 0) {
      this.open = false;
    }
  }

  public getActiveJobs(): CopyJob[] {
    return this.jobs.filter(job => job.status === 'running' || job.status === 'pending');
  }

  private handleClose() {
    // Only close if no active jobs
    const hasActiveJobs = this.getActiveJobs().length > 0;
    if (hasActiveJobs) {
      this.collapsed = !this.collapsed;
    } else {
      this.open = false;
      this.jobs = [];
    }
  }

  private handleCancelJob(jobId: string) {
    this.dispatchEvent(new CustomEvent('cancel-job', {
      detail: { jobId },
      bubbles: true,
      composed: true
    }));
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

  private getStatusClass(status: string, type: 'icon' | 'badge' | 'progress'): string {
    const classes: Record<string, { icon: string; badge: string; progress: string }> = {
      running: {
        icon: TW.copyProgress.headerIconRunning,
        badge: TW.copyProgress.jobBadgeRunning,
        progress: TW.copyProgress.progressFillRunning
      },
      completed: {
        icon: TW.copyProgress.headerIconCompleted,
        badge: TW.copyProgress.jobBadgeCompleted,
        progress: TW.copyProgress.progressFillCompleted
      },
      failed: {
        icon: TW.copyProgress.headerIconFailed,
        badge: TW.copyProgress.jobBadgeFailed,
        progress: TW.copyProgress.progressFillFailed
      },
      cancelled: {
        icon: TW.copyProgress.headerIconCancelled,
        badge: TW.copyProgress.jobBadgeCancelled,
        progress: TW.copyProgress.progressFillFailed
      },
      pending: {
        icon: TW.copyProgress.headerIconRunning,
        badge: TW.copyProgress.jobBadgeRunning,
        progress: TW.copyProgress.progressFillRunning
      }
    };
    return classes[status]?.[type] || classes.pending[type];
  }

  private renderJob(job: CopyJob) {
    const percent = job.progress.totalFiles > 0
      ? Math.round((job.progress.copiedFiles / job.progress.totalFiles) * 100)
      : 0;

    return html`
      <div class="${TW.copyProgress.jobItem}">
        <!-- Job Header -->
        <div class="${TW.copyProgress.jobHeader}">
          <div class="${TW.copyProgress.jobTitle}">
            ${job.sourceBucket} → ${job.targetBucket}
          </div>
          <span class="${TW.copyProgress.jobBadge} ${this.getStatusClass(job.status, 'badge')}">
            ${job.status.toUpperCase()}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="${TW.copyProgress.progressWrapper}">
          <div class="${TW.copyProgress.progressBar}">
            <div 
              class="${TW.copyProgress.progressFill} ${this.getStatusClass(job.status, 'progress')}"
              style="width: ${percent}%">
            </div>
          </div>
          <div class="${TW.copyProgress.progressStats}">
            <span class="${TW.copyProgress.progressLabel}">
              ${job.progress.copiedFiles} / ${job.progress.totalFiles} files
            </span>
            <span class="${TW.copyProgress.progressPercent}">${percent}%</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="${TW.copyProgress.statsGrid}">
          <div class="${TW.copyProgress.statItem}">
            <span class="${TW.copyProgress.statLabel}">Copied:</span>
            <span class="${TW.copyProgress.statValue}">
              ${this.formatBytes(job.progress.copiedBytes)}
            </span>
          </div>
          <div class="${TW.copyProgress.statItem}">
            <span class="${TW.copyProgress.statLabel}">Total:</span>
            <span class="${TW.copyProgress.statValue}">
              ${this.formatBytes(job.progress.totalBytes)}
            </span>
          </div>
          ${job.progress.failedFiles > 0 ? html`
            <div class="${TW.copyProgress.statItem}">
              <span class="${TW.copyProgress.statLabel}">Failed:</span>
              <span class="${TW.copyProgress.statValue} text-red-600">
                ${job.progress.failedFiles}
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Current File (only if running) -->
        ${job.status === 'running' && job.progress.currentFile ? html`
          <div class="${TW.copyProgress.currentFile}">
            <span class="${TW.copyProgress.currentFileLabel}">Current:</span> 
            ${job.progress.currentFile}
          </div>
        ` : ''}

        <!-- Speed & ETA (only if running) -->
        ${job.status === 'running' ? html`
          <div class="${TW.copyProgress.speedEta}">
            <div class="${TW.copyProgress.speedEtaItem}">
              <iconify-icon icon="ph:gauge-bold" width="14" class="${TW.copyProgress.speedEtaIcon}"></iconify-icon>
              <span class="${TW.copyProgress.speedEtaValue}">
                ${this.formatSpeed(job.progress.speed)}
              </span>
            </div>
            <div class="${TW.copyProgress.speedEtaItem}">
              <iconify-icon icon="ph:clock-bold" width="14" class="${TW.copyProgress.speedEtaIcon}"></iconify-icon>
              <span class="${TW.copyProgress.speedEtaValue}">
                ${this.formatETA(job.progress.eta)}
              </span>
            </div>
          </div>
        ` : ''}

        <!-- Duration (if completed/failed/cancelled) -->
        ${job.status !== 'running' && job.status !== 'pending' ? html`
          <div class="${TW.copyProgress.currentFile}">
            <span class="${TW.copyProgress.currentFileLabel}">Duration:</span> 
            ${this.formatDuration(job.startedAt, job.completedAt)}
          </div>
        ` : ''}

        <!-- Errors -->
        ${job.errors.length > 0 ? html`
          <div class="${TW.copyProgress.errorsSection}">
            <div class="${TW.copyProgress.errorsTitle}">
              Errors (${job.errors.length}):
            </div>
            <div class="${TW.copyProgress.errorsList}">
              ${job.errors.slice(0, 3).map(err => html`
                <div class="${TW.copyProgress.errorItem}" title="${err.error}">
                  ${err.file}: ${err.error}
                </div>
              `)}
              ${job.errors.length > 3 ? html`
                <div class="${TW.copyProgress.errorItem}">
                  ... and ${job.errors.length - 3} more
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="${TW.copyProgress.actions}">
          ${job.status === 'running' ? html`
            <button class="${TW.copyProgress.btnCancel}" @click="${() => this.handleCancelJob(job.id)}">
              <iconify-icon icon="ph:x-bold" width="14"></iconify-icon>
              Cancel
            </button>
          ` : html`
            <button class="${TW.copyProgress.btnDismiss}" @click="${() => this.handleDismissJob(job.id)}">
              <iconify-icon icon="ph:check-bold" width="14"></iconify-icon>
              Dismiss
            </button>
          `}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open || this.jobs.length === 0) return html``;

    const activeJobs = this.getActiveJobs();
    const hasActiveJobs = activeJobs.length > 0;
    const mainStatus = hasActiveJobs ? 'running' : (this.jobs.some(j => j.status === 'completed') ? 'completed' : 'failed');

    return html`
      <div class="${TW.copyProgress.panel}">
        <!-- Header -->
        <div class="${TW.copyProgress.header}">
          <div class="${TW.copyProgress.headerLeft}">
            <div class="${TW.copyProgress.headerIcon} ${this.getStatusClass(mainStatus, 'icon')}">
              <iconify-icon icon="${this.getStatusIcon(mainStatus)}" width="20"></iconify-icon>
            </div>
            <div>
              <div class="${TW.copyProgress.headerTitle}">
                ${hasActiveJobs ? 'Copying Buckets' : 'Copy Complete'}
              </div>
              <div class="${TW.copyProgress.headerSubtitle}">
                ${this.jobs.length} ${this.jobs.length === 1 ? 'job' : 'jobs'}
                ${hasActiveJobs ? ` • ${activeJobs.length} active` : ''}
              </div>
            </div>
          </div>
          <div class="${TW.copyProgress.headerActions}">
            <button class="${TW.copyProgress.btnHeaderAction}" @click="${this.handleClose}">
              <iconify-icon icon="${this.collapsed ? 'ph:caret-up-bold' : 'ph:x-bold'}" width="20"></iconify-icon>
            </button>
          </div>
        </div>

        <!-- Body (jobs list) -->
        ${!this.collapsed ? html`
          <div class="${TW.copyProgress.body}">
            ${this.jobs.length === 0 ? html`
              <div class="${TW.copyProgress.emptyState}">
                <iconify-icon icon="ph:package-duotone" width="48" class="${TW.copyProgress.emptyIcon}"></iconify-icon>
                <div class="${TW.copyProgress.emptyText}">No copy jobs</div>
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
