"use client";

import React from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-[min(920px,95%)] max-h-[90vh] overflow-auto rounded-lg border border-[#1E2623] bg-slate-900/95 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <div>
            <button
              onClick={onClose}
              className="rounded-md bg-transparent px-2 py-1 text-sm font-medium text-zinc-400 hover:text-white"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-200">{children}</div>
      </div>
    </div>
  );
}
