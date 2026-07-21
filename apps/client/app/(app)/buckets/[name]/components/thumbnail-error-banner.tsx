'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ThumbnailErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ThumbnailErrorBanner({ message, onDismiss }: ThumbnailErrorBannerProps) {
  const { t } = useI18n();
  return (
    <div className="shrink-0 px-6 pt-4 max-w-[1600px] mx-auto w-full">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[12.5px] text-destructive"
      >
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{t.bucketThumbnailErrorTitle}</p>
          <p className="text-destructive/80 mt-0.5 break-words">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          aria-label={t.bucketThumbnailErrorClose}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
