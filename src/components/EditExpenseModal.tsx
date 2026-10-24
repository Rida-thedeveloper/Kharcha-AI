import React, { useState } from 'react';
import { Expense, CATEGORIES, PAYMENT_METHODS } from '../types/expense';
import { X, Check } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface EditExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: (updated: Expense) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  onClose,
  onSave,
}) => {
  if (!expense) return null;

  const [formData, setFormData] = useState<Expense>({ ...expense });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (isNaN(formData.amount) || formData.amount < 0) {
      setError('Amount must be zero or a positive number');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900">
            Edit Expense
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Amount (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-stone-400">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none pr-8 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-stone-400">
                  <CategoryIcon category={formData.category} size={15} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Shared with roommates"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={!!formData.isFuturePlan}
                onChange={(e) => setFormData({ ...formData, isFuturePlan: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-stone-300"
              />
              <span>Mark as future planned expense (excludes from current spending total)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
