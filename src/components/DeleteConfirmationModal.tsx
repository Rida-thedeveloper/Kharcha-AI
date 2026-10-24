import React from 'react';
import { Expense } from '../types/expense';
import { formatCurrency } from '../lib/storage';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  expense: Expense | null;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  expense,
  currency,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Top Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
            <Trash2 className="w-6 h-6" />
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

        {/* Header Text */}
        <div className="mt-4">
          <h3 id="delete-dialog-title" className="text-base font-extrabold text-stone-900">
            Delete this expense?
          </h3>
          <p className="mt-1 text-xs text-stone-500 leading-relaxed">
            This will permanently remove this record from your expense history.
          </p>
        </div>

        {/* Expense Preview Card */}
        <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
              <CategoryIcon category={expense.category} className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 truncate">
                {expense.title}
              </p>
              <p className="text-[10px] text-stone-500 font-mono">
                {expense.category} · {expense.expenseDate}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-black font-mono text-stone-900 tabular-nums">
              {formatCurrency(expense.amount, currency)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
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
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
