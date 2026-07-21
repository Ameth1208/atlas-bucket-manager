'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Copy, Loader2, X, XCircle } from 'lucide-react';
import { cn, fmtBytes } from '@/lib/utils';
import { useCopyJobsStore, isJobActive, type ActiveCloneJob } from '@/lib/copy-jobs-store';
import { useCopyJob } from '@/hooks/use-copy-job';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import type { CopyJob } from '@/lib/api';

const COLLAPSED_HEIGHT = 64;
const EXPANDED_MIN_HEIGHT = 360;

export function CloneProgressDock() {
  const { jobs, removeJob, dismiss, isDismissed } = useCopyJobsStore();
  const visibleJobs = useMemo(() => jobs.filter((j) => !isDismissed(j.jobId)), [jobs, isDismissed]);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorsOpen, setErrorsOpen] = useState(false);

  const effectiveSelectedId =
    selectedId && visibleJobs.some((j) => j.jobId === selectedId)
      ? selectedId
      : visibleJobs[0]?.jobId ?? null;

  if (visibleJobs.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-popover/95 backdrop-blur-md ring-1 ring-border shadow-2xl shadow-black/10 overflow-hidden"
      style={{ minHeight: expanded ? EXPANDED_MIN_HEIGHT : COLLAPSED_HEIGHT }}
    >
      <DockHeader
        jobs={visibleJobs}
        selectedId={effectiveSelectedId}
        onSelect={setSelectedId}
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        onCloseAll={() => {
          visibleJobs.forEach((j) => {
            dismiss(j.jobId);
            removeJob(j.jobId);
          });
        }}
      />
      {expanded && effectiveSelectedId && (
        <DockBody
          jobId={effectiveSelectedId}
          meta={visibleJobs.find((j) => j.jobId === effectiveSelectedId)!}
          errorsOpen={errorsOpen}
          setErrorsOpen={setErrorsOpen}
        />
      )}
    </div>
  );
}

function DockHeader({
  jobs,
  selectedId,
  onSelect,
  expanded,
  onToggleExpand,
  onCloseAll,
}: {
  jobs: ActiveCloneJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onCloseAll: () => void;
}) {
  const { t, tx } = useI18n();
  const selected = jobs.find((j) => j.jobId === selectedId);
  const { data: job } = useCopyJob(selected?.jobId ?? null);

  const pct = useMemo(() => {
    if (!job || job.totalObjects === 0) return 0;
    return Math.round((job.copiedObjects / job.totalObjects) * 100);
  }, [job]);

  const isActive = isJobActive(job);
  const isDone = job?.status === 'completed';
  const isFailed = job?.status === 'failed';
  const isCancelled = job?.status === 'cancelled';

  const statusText = isActive && job && job.totalObjects > 0
    ? `${job.copiedObjects}/${job.totalObjects} · ${pct}%`
    : isDone
      ? t.cloneProgressCompleted
      : isFailed
        ? t.cloneProgressFailed
        : isCancelled
          ? t.cloneProgressCancelled
          : t.cloneProgressInit;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 h-16">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 flex items-center gap-3 min-w-0 text-left"
          aria-label={expanded ? t.cloneProgressCollapse : t.cloneProgressExpand}
        >
          <StatusIcon status={job?.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground truncate">
              <span className="truncate">
                {selected
                  ? `${selected.sourceBucket} → ${selected.destBucket}`
                  : t.cloneProgressCloning}
              </span>
              {jobs.length > 1 && (
                <span className="shrink-0 text-muted-foreground">· +{jobs.length - 1}</span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {statusText}
            </div>
          </div>
        </button>

        {jobs.length > 1 && (
          <select
            value={selectedId ?? ''}
            onChange={(e) => onSelect(e.target.value)}
            className="h-7 px-2 rounded-md bg-muted border border-border text-[11px] outline-none"
            aria-label={t.cloneProgressSelectAria}
          >
            {jobs.map((j) => (
              <option key={j.jobId} value={j.jobId}>
                {j.sourceBucket} → {j.destBucket}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={expanded ? t.cloneProgressCollapse : t.cloneProgressExpand}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          type="button"
          onClick={onCloseAll}
          className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
          aria-label={t.cloneProgressClose}
        >
          <X size={14} />
        </button>
      </div>

      {!expanded && (
        <div className="px-3.5 pb-3">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isFailed || isCancelled ? 'bg-destructive' : isDone ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status?: CopyJob['status'] }) {
  if (!status || status === 'queued' || status === 'running') {
    return (
      <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
        <Loader2 size={16} className="text-primary animate-spin" />
      </div>
    );
  }
  if (status === 'completed') {
    return (
      <div className="size-9 rounded-xl bg-emerald-500/10 grid place-items-center shrink-0">
        <CheckCircle2 size={16} className="text-emerald-500" />
      </div>
    );
  }
  return (
    <div className="size-9 rounded-xl bg-destructive/10 grid place-items-center shrink-0">
      <XCircle size={16} className="text-destructive" />
    </div>
  );
}

function DockBody({
  jobId,
  meta,
  errorsOpen,
  setErrorsOpen,
}: {
  jobId: string;
  meta: ActiveCloneJob;
  errorsOpen: boolean;
  setErrorsOpen: (v: boolean) => void;
}) {
  const { t, tx, meta: metaI18n } = useI18n();
  const { data: job } = useCopyJob(jobId);
  const qc = useQueryClient();

  const pctObjects = job && job.totalObjects > 0 ? Math.round((job.copiedObjects / job.totalObjects) * 100) : 0;
  const pctBytes = job && job.totalBytes > 0 ? Math.round((job.copiedBytes / job.totalBytes) * 100) : 0;

  const isActive = isJobActive(job);
  const isDone = job?.status === 'completed';
  const isFailed = job?.status === 'failed';
  const isCancelled = job?.status === 'cancelled';

  const onCancel = async () => {
    try {
      await api.copy.cancel(jobId);
      toast.message(t.cloneProgressCancelledToast);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onDelete = async () => {
    try {
      await api.copy.delete(jobId);
      qc.invalidateQueries({ queryKey: ['copy-job', jobId] });
      toast.success(t.cloneProgressDeletedToast);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-3 border-t border-border">
      <div className="flex items-center gap-2 pt-2.5 text-[11.5px] text-muted-foreground">
        <Copy size={11} className="shrink-0" />
        <span className="truncate">
          {meta.sourceBucket} → {meta.destBucket}
        </span>
        {isActive && (
          <span className="ml-auto inline-flex items-center gap-1 text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {t.activityLiveTag}
          </span>
        )}
      </div>

      <ProgressRow label={t.cloneProgressObjects} value={`${job?.copiedObjects ?? 0} / ${job?.totalObjects ?? 0}`} pct={pctObjects} />
      <ProgressRow label={t.cloneProgressBytes} value={`${fmtBytes(job?.copiedBytes ?? 0)} / ${fmtBytes(job?.totalBytes ?? 0)}`} pct={pctBytes} />

      {job && job.errors.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setErrorsOpen(!errorsOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <AlertTriangle size={12} />
            <span>
              {tx('cloneProgressErrorCount', { count: job.errors.length })}
            </span>
            {errorsOpen ? <ChevronDown size={12} className="ml-auto" /> : <ChevronUp size={12} className="ml-auto" />}
          </button>
          {errorsOpen && (
            <div className="max-h-40 overflow-y-auto px-3 pb-2 space-y-1">
              {job.errors.map((err) => (
                <div key={err.key} className="text-[11px] text-destructive/90 font-mono break-all">
                  <span className="opacity-70">{err.key}:</span> {err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {isActive && (
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {t.cloneProgressCancel}
          </button>
        )}
        {(isDone || isFailed || isCancelled) && (
          <button
            type="button"
            onClick={onDelete}
            className="h-8 px-3 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {t.cloneProgressDelete}
          </button>
        )}
        <div className="ml-auto" />
        <div
          className={cn(
            'h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md text-[11px] font-medium',
            isDone && 'bg-emerald-500/10 text-emerald-500',
            (isFailed || isCancelled) && 'bg-destructive/10 text-destructive',
            isActive && 'bg-primary/10 text-primary'
          )}
        >
          {isDone
            ? t.cloneProgressCompleted
            : isFailed
              ? t.cloneProgressFailed
              : isCancelled
                ? t.cloneProgressCancelled
                : t.cloneProgressStatusCopying}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>
          {value} <span className="opacity-60">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
