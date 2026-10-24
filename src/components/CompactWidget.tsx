import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { formatPKR } from '../lib/storage';
import { CategoryIcon } from './CategoryIcon';
import {
  Mic,
  Maximize2,
  ChevronRight,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

interface CompactWidgetProps {
  expenses: Expense[];
  todayTotal: number;
  onExpand: () => void;
  onOpenVoiceRecord: () => void;
  onOpenDashboard: () => void;
  onQuickTextSubmit: (text: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const CompactWidget: React.FC<CompactWidgetProps> = ({
  expenses,
  todayTotal,
  onExpand,
  onOpenVoiceRecord,
  onOpenDashboard,
  onQuickTextSubmit,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [showQuickInput, setShowQuickInput] = useState(false);

  // Take the latest three non-future-plan expenses
  const recentExpenses = expenses
    .filter((e) => !e.isFuturePlan)
    .slice(0, 3);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onQuickTextSubmit(quickInput.trim());
      setQuickInput('');
      setShowQuickInput(false);
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto bg-[#FAF8F5] rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden transition-all duration-300">
      {/* Widget Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-stone-900 leading-tight">
              Kharcha AI
            </h1>
            <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
              Smart Expense Tracker
            </span>
          </div>
        </div>

        {/* Expand control */}
        <button
          type="button"
          onClick={onExpand}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          title="Expand Widget"
          aria-label="Expand Widget"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Greeting & Today's Total */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-stone-500 font-medium">
          Where did your money go today?
        </p>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums tracking-tight">
              {formatPKR(todayTotal)}
            </span>
            <span className="text-[11px] font-medium text-stone-400">
              spent today
            </span>
          </div>
          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            PKR
          </span>
        </div>
      </div>

      {/* Prominent Microphone Voice Button */}
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-stone-900 block">
              Speak your expense
            </span>
            <span className="text-[11px] text-stone-500 block leading-tight">
              Roman Urdu, Urdu, or English
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceRecord}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Tap to speak</span>
          </button>
        </div>

        {/* Small text-entry alternative toggle */}
        <div className="mt-2 text-center">
          {!showQuickInput ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setShowQuickInput(true)}
                className="text-[11px] text-stone-500 hover:text-emerald-800 font-medium underline underline-offset-2 transition-colors cursor-pointer"
              >
                or type expense manually
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => onQuickTextSubmit('Aaj 200 ka burger khaya')}
                  className="text-[10px] bg-stone-200/60 hover:bg-emerald-100 text-stone-600 hover:text-emerald-900 px-2 py-0.5 rounded transition-colors"
                >
                  Try: 200 ka burger
                </button>
                <button
                  type="button"
                  onClick={() => onQuickTextSubmit('Aaj maine 250 ki biryani khayi, 100 Careem aur kal 500 ka petrol')}
                  className="text-[10px] bg-stone-200/60 hover:bg-emerald-100 text-stone-600 hover:text-emerald-900 px-2 py-0.5 rounded transition-colors"
                >
                  Try: Multiple items
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuickSubmit} className="mt-2 space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="e.g. Aaj 200 ka burger khaya..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickInput(false)}
                  className="px-2 py-1.5 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-1 text-left">
                <span className="text-[10px] text-stone-400">Quick:</span>
                <button
                  type="button"
                  onClick={() => onQuickTextSubmit('Aaj 200 ka burger khaya')}
                  className="text-[10px] text-emerald-800 hover:underline"
                >
                  &ldquo;Aaj 200 ka burger&rdquo;
                </button>
                <span className="text-[10px] text-stone-300">·</span>
                <button
                  type="button"
                  onClick={() => onQuickTextSubmit('Kal 500 ka petrol dalwaya tha')}
                  className="text-[10px] text-emerald-800 hover:underline"
                >
                  &ldquo;Kal 500 petrol&rdquo;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Latest Three Saved Expenses */}
      <div className="px-5 pt-1 pb-4">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-stone-200/60">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            Recent Expenses
          </span>
          <button
            type="button"
            onClick={onExpand}
            className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400">
            No expenses logged yet. Tap microphone above!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="py-2.5 flex items-center justify-between gap-3 group hover:bg-stone-100/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                    <CategoryIcon category={exp.category} size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      {exp.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <span>{exp.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{exp.expenseDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold font-mono tabular-nums text-stone-900">
                    {formatPKR(exp.amount)}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditExpense(exp)}
                      className="text-stone-400 hover:text-stone-700 p-1"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="px-5 py-3 bg-stone-100/80 border-t border-stone-200/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onOpenDashboard}
          className="text-emerald-800 hover:text-emerald-950 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>View Full History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onExpand}
          className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Expand Panel</span>
        </button>
      </div>
    </div>
  );
};
