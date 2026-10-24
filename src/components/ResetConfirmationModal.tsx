import React from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
            <RotateCcw className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 id="reset-dialog-title" className="text-base font-extrabold text-stone-900">
            Reset demo data?
          </h3>
          <p className="mt-1 text-xs text-stone-500 leading-relaxed">
            This will reset your logged transactions back to the initial sample expenses.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 active:scale-98 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
