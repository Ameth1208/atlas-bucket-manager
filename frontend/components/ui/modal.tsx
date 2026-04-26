'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

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
        className="gap-0 p-0 rounded-xl border border-[#D2D2D7] bg-white shadow-xl"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2D2D7]/50">
          <div>
            <DialogTitle className="text-[17px] font-semibold text-[#1D1D1F]">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-[13px] text-[#86868B] mt-0.5">
                {description}
              </DialogDescription>
            )}
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-[#86868B]" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}