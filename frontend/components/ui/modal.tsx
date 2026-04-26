'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  width?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, width = '520px', children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="gap-0 p-0"
        style={{ maxWidth: width }}
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </DialogDescription>
            )}
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-muted-foreground" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
