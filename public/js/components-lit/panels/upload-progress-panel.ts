import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TW } from '../styles/tailwind-classes';

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

    const progressColor = job.status === 'completed'
      ? TW.copyProgress.progressFillCompleted
      : job.status === 'failed'
        ? TW.copyProgress.progressFillFailed
        : TW.copyProgress.progressFillRunning;

    const badgeColor = job.status === 'completed'
      ? TW.copyProgress.jobBadgeCompleted
      : job.status === 'failed'
        ? TW.copyProgress.jobBadgeFailed
        : TW.copyProgress.jobBadgeRunning;

    return html`
      <div class="${TW.copyProgress.jobItem}">
        <div class="${TW.copyProgress.jobHeader}">
          <div class="${TW.copyProgress.jobTitle}">
            <iconify-icon icon="ph:upload-simple-bold" width="14" class="mr-1"></iconify-icon>
            ${job.bucket}
          </div>
          <span class="${TW.copyProgress.jobBadge} ${badgeColor}">
            ${job.status.toUpperCase()}
          </span>
        </div>

        <div class="${TW.copyProgress.progressWrapper}">
          <div class="${TW.copyProgress.progressBar}">
            <div class="${TW.copyProgress.progressFill} ${progressColor}" style="width: ${percent}%"></div>
          </div>
          <div class="${TW.copyProgress.progressStats}">
            <span class="${TW.copyProgress.progressLabel}">${job.current} / ${job.total} files</span>
            <span class="${TW.copyProgress.progressPercent}">${percent}%</span>
          </div>
        </div>

        ${isUploading && job.currentFile ? html`
          <div class="${TW.copyProgress.currentFile}">
            <span class="${TW.copyProgress.currentFileLabel}">Uploading:</span>
            ${job.currentFile}
          </div>
        ` : ''}

        ${job.status === 'failed' && job.error ? html`
          <div class="${TW.copyProgress.currentFile} text-red-500">${job.error}</div>
        ` : ''}

        ${!isUploading ? html`
          <div class="${TW.copyProgress.actions}">
            <button class="${TW.copyProgress.btnDismiss}" @click="${() => this.removeJob(job.id)}">
              <iconify-icon icon="ph:check-bold" width="14"></iconify-icon>
              Dismiss
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.open || this.jobs.length === 0) return html``;

    const hasActive = this.jobs.some(j => j.status === 'uploading');

    return html`
      <div class="${TW.copyProgress.panel}">
        <div class="${TW.copyProgress.header}">
          <div class="${TW.copyProgress.headerLeft}">
            <div class="${TW.copyProgress.headerIcon} ${hasActive ? TW.copyProgress.headerIconRunning : TW.copyProgress.headerIconCompleted}">
              <iconify-icon icon="${hasActive ? 'ph:circle-notch-bold' : 'ph:check-circle-bold'}" width="20"></iconify-icon>
            </div>
            <div>
              <div class="${TW.copyProgress.headerTitle}">
                ${hasActive ? 'Uploading Files' : 'Upload Complete'}
              </div>
              <div class="${TW.copyProgress.headerSubtitle}">
                ${this.jobs.length} ${this.jobs.length === 1 ? 'upload' : 'uploads'}
              </div>
            </div>
          </div>
          <div class="${TW.copyProgress.headerActions}">
            <button class="${TW.copyProgress.btnHeaderAction}" @click="${this.handleClose}">
              <iconify-icon icon="${this.collapsed ? 'ph:caret-up-bold' : 'ph:x-bold'}" width="20"></iconify-icon>
            </button>
          </div>
        </div>

        ${!this.collapsed ? html`
          <div class="${TW.copyProgress.body}">
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
