import React, { useState } from 'react';
import {
  Expense,
  BudgetConfig,
} from '../types/expense';
import { formatCurrency, getCurrencyConfig } from '../lib/storage';
import { CategoryIcon } from './CategoryIcon';
import { speechManager } from '../lib/speech';
import { PWAInstallButton } from './PWAInstallButton';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Mic,
  MicOff,
  Coins,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PieChart,
} from 'lucide-react';

interface ExpandedWidgetProps {
  expenses: Expense[];
  budget: BudgetConfig;
  currency?: string;
  metrics: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    prevMonthTotal: number;
    momChangePercent: number | null;
    transactionCount: number;
    budgetRemaining: number;
    budgetUsedPercent: number;
    isBudgetExceeded: boolean;
    isBudgetWarning: boolean;
    highestCategory: string;
    highestAmount: number;
    categoryTotals: Record<string, number>;
  };
  onCollapse: () => void;
  onDirectSaveExpense: (text: string) => Promise<void>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateBudget: (budget: BudgetConfig) => void;
  onOpenCurrencySettings?: () => void;
}

const QUICK_SUGGESTIONS = [
  '150 Chai',
  '350 Biryani',
  '1000 Petrol',
  '2500 Groceries',
  '4500 Electricity Bill',
  '300 Medicine',
];

export const ExpandedWidget: React.FC<ExpandedWidgetProps> = ({
  expenses,
  budget,
  currency = 'PKR',
  metrics,
  onCollapse,
  onDirectSaveExpense,
  onEditExpense,
  onDeleteExpense,
  onUpdateBudget,
  onOpenCurrencySettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.monthlyBudget.toString());

  const currConfig = getCurrencyConfig(currency);

  // Direct auto-save handler (NO confirmation popup!)
  const handleSave = async (textToSave?: string) => {
    const text = (textToSave || inputText).trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDirectSaveExpense(text);
      setInputText('');
      setVoiceTranscript('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle voice recording inside widget
  const handleToggleVoice = () => {
    if (isRecording) {
      speechManager.stop();
      setIsRecording(false);
      if (voiceTranscript.trim()) {
        handleSave(voiceTranscript.trim());
      }
    } else {
      setVoiceTranscript('');
      setIsRecording(true);
      speechManager.start({
        onTranscriptChange: (text) => {
          setVoiceTranscript(text);
          setInputText(text);
        },
        onError: () => {
          setIsRecording(false);
        },
        onStateChange: () => {},
      });
    }
  };

  // Save budget
  const handleUpdateBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget) || 0;
    onUpdateBudget({
      ...budget,
      monthlyBudget: val,
      currency,
    });
    setShowBudgetEditor(false);
  };

  // Top categories sorted by spending
  const sortedCategories = Object.entries(metrics.categoryTotals)
    .filter(([_, total]) => total > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full h-full bg-[#FAF8F5] text-stone-900 flex flex-col overflow-hidden">
      {/* 1. WIDGET HEADER */}
      <div className="px-4 py-3 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 leading-tight">
              Kharcha AI
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Voice Expense Tracker
              </span>
              {onOpenCurrencySettings && (
                <button
                  type="button"
                  onClick={onOpenCurrencySettings}
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-stone-100 hover:bg-stone-200 px-1.5 py-0.5 rounded text-stone-700 transition-colors cursor-pointer"
                  title="Change Currency"
                >
                  <Coins className="w-2.5 h-2.5 text-emerald-700" />
                  <span>{currConfig.code}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton />
          {/* Close Button */}
          <button
            type="button"
            onClick={onCollapse}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close to Phone Screen"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE WIDGET BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* SPENDING METRICS CARDS */}
        <div className="grid grid-cols-2 gap-3">
          {/* Today's Spend Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Today&apos;s Spend
            </span>
            <div className="mt-1 text-xl font-black font-mono tracking-tight text-emerald-950">
              {formatCurrency(metrics.todayTotal, currency)}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              {metrics.transactionCount} entries today
            </span>
          </div>

          {/* Monthly Budget Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Month Progress
                </span>
                <button
                  type="button"
                  onClick={() => setShowBudgetEditor(!showBudgetEditor)}
                  className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <div className="mt-1 text-sm font-bold font-mono text-stone-800">
                {metrics.budgetUsedPercent}% used
              </div>
            </div>

            {/* Progress meter bar */}
            <div className="mt-2 h-2 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, metrics.budgetUsedPercent)}%` }}
                className={`h-full transition-all duration-300 rounded-full ${
                  metrics.isBudgetExceeded
                    ? 'bg-rose-600'
                    : metrics.isBudgetWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Inline Budget Editor (when user taps 'Edit') */}
        {showBudgetEditor && (
          <form
            onSubmit={handleUpdateBudgetSubmit}
            className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 animate-in fade-in duration-150 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Set Monthly Budget Limit</span>
              <button
                type="button"
                onClick={() => setShowBudgetEditor(false)}
                className="text-stone-500 text-[11px]"
              >
                Cancel
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="500"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="50000"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* DIRECT INSTANT ADD EXPENSE SECTION */}
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Direct Add Expense</span>
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              Auto-categorized &amp; saved
            </span>
          </div>

          {/* Voice & Text Input Box */}
          <div className="relative flex items-center">
            {/* Mic button inside input */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`absolute left-2 p-2 rounded-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
              title={isRecording ? 'Stop recording' : 'Tap to speak'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              disabled={isSubmitting}
              placeholder={isRecording ? 'Listening to speech...' : 'e.g. "250 biryani", "1000 petrol"'}
              className="w-full pl-12 pr-12 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />

            {/* Submit / Send button */}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={!inputText.trim() || isSubmitting}
              className="absolute right-2 p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              title="Save expense"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick-tap suggestion chips */}
          <div className="pt-1">
            <span className="text-[10px] text-stone-400 font-semibold block mb-1.5">
              Quick 1-Tap Save:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSave(item)}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200/80 rounded-lg text-stone-700 transition-colors cursor-pointer"
                >
                  +{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT EXPENSES LIST */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Recent Expenses ({expenses.length})
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              Latest first
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
              <p className="text-xs">No expenses logged yet.</p>
              <p className="text-[10px] mt-1 text-stone-400">
                Hold phone icon or type above to add your first expense!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 15).map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between gap-3 transition-colors hover:border-stone-300"
                >
                  {/* Category icon */}
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <CategoryIcon category={exp.category} className="w-4 h-4 text-emerald-800" />
                  </div>

                  {/* Title & Category info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {exp.title}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                        {exp.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
                      {exp.expenseDate} · {exp.paymentMethod || 'Cash'}
                    </span>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black font-mono text-stone-900 tabular-nums">
                      {formatCurrency(exp.amount, currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onEditExpense(exp)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SPENDING BY CATEGORY BREAKDOWN */}
        {sortedCategories.length > 0 && (
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider block">
              Spending by Category
            </span>

            <div className="space-y-2">
              {sortedCategories.slice(0, 6).map(([cat, total]) => {
                const percent = Math.round((total / Math.max(1, metrics.monthTotal)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-stone-700">{cat}</span>
                      <span className="font-mono font-bold text-stone-900">
                        {formatCurrency(total, currency)} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. WIDGET FOOTER */}
      <div className="px-4 py-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
        <button
          type="button"
          onClick={onCollapse}
          className="text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer flex items-center gap-1"
        >
          <span>← Return to Phone Screen</span>
        </button>
        <span className="text-[10px] text-stone-400 font-mono">
          Kharcha AI Widget
        </span>
      </div>
    </div>
  );
};
