import React from 'react';
import { ExtractedExpense, CATEGORIES, PAYMENT_METHODS } from '../types/expense';
import { Trash2, AlertCircle, Clock } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseReviewCardProps {
  expense: ExtractedExpense;
  index: number;
  totalItems: number;
  onChange: (updated: ExtractedExpense) => void;
  onRemove: () => void;
}

export const ExpenseReviewCard: React.FC<ExpenseReviewCardProps> = ({
  expense,
  index,
  totalItems,
  onChange,
  onRemove,
}) => {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      expense.missingAmount
        ? 'border-amber-300 bg-amber-50/60'
        : expense.isFuturePlan
        ? 'border-blue-200 bg-blue-50/40'
        : 'border-stone-200 bg-white shadow-xs'
    }`}>
      {/* Header bar of review card */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-stone-600">
            Item {index + 1} of {totalItems}
          </span>
          {expense.isFuturePlan && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              Future Plan
            </span>
          )}
        </div>

        {totalItems > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
            title="Remove item"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Warning if amount is missing */}
      {expense.missingAmount && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Missing Amount</p>
            <p className="text-amber-800">
              {expense.clarificationNeeded || 'No amount was detected in your voice/text. Please enter how much was spent.'}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Expense Title
          </label>
          <input
            type="text"
            value={expense.title}
            onChange={(e) => onChange({ ...expense, title: e.target.value })}
            placeholder="e.g. Chicken Biryani"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Amount (PKR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-semibold text-stone-500">
              Rs.
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={expense.amount === 0 ? '' : expense.amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onChange({
                  ...expense,
                  amount: val,
                  missingAmount: val <= 0,
                });
              }}
              placeholder="0"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border font-mono tabular-nums focus:outline-none focus:ring-2 ${
                expense.missingAmount
                  ? 'border-amber-400 focus:ring-amber-500 bg-white'
                  : 'border-stone-200 focus:ring-emerald-500 bg-white'
              }`}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              value={expense.category}
              onChange={(e) => onChange({ ...expense, category: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none pr-8 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-stone-400">
              <CategoryIcon category={expense.category} size={15} />
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Date
          </label>
          <input
            type="date"
            value={expense.expenseDate}
            onChange={(e) => onChange({ ...expense, expenseDate: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Payment Method
          </label>
          <select
            value={expense.paymentMethod}
            onChange={(e) => onChange({ ...expense, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Notes / Details (Optional)
          </label>
          <input
            type="text"
            value={expense.notes || ''}
            onChange={(e) => onChange({ ...expense, notes: e.target.value })}
            placeholder="e.g. Lunch with office team"
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Future Plan Flag Option */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
          <input
            type="checkbox"
            checked={!!expense.isFuturePlan}
            onChange={(e) => onChange({ ...expense, isFuturePlan: e.target.checked })}
            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-stone-300"
          />
          <span>Mark as future planned expense (do not count in current spend)</span>
        </label>
      </div>
    </div>
  );
};
