import React, { useState, useMemo } from 'react';
import { Expense, BudgetConfig } from '../types/expense';
import { formatCurrency, getCurrencyConfig } from '../lib/storage';
import { CategoryIcon } from './CategoryIcon';
import { speechManager } from '../lib/speech';
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
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Lightbulb,
  Check,
  TrendingDown,
  TrendingUp,
  Calendar,
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
  const [searchQuery, setSearchQuery] = useState('');

  const currConfig = getCurrencyConfig(currency);

  // Direct auto-save handler
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

  // Save budget limit
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

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
    );
  }, [expenses, searchQuery]);

  // Top categories sorted by spending
  const sortedCategories = useMemo(() => {
    return Object.entries(metrics.categoryTotals)
      .filter(([_, total]) => total > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [metrics.categoryTotals]);

  return (
    <div className="w-full h-full bg-[#FAF8F5] text-stone-900 flex flex-col overflow-hidden select-none">
      {/* 1. CLEAN RESPONSIVE WIDGET HEADER */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-stone-200/90 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-stone-900 leading-tight tracking-tight">
                Kharcha AI
              </h2>
              {onOpenCurrencySettings && (
                <button
                  type="button"
                  onClick={onOpenCurrencySettings}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-md text-stone-700 transition-colors cursor-pointer border border-stone-200/60"
                  title="Change Currency"
                >
                  <Coins className="w-3 h-3 text-emerald-700" />
                  <span>{currConfig.flag} {currConfig.code === 'PKR' ? 'Rs.' : currConfig.code}</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Voice &amp; AI Expense Management
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2">
          {/* Close Button */}
          <button
            type="button"
            onClick={onCollapse}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE VERTICAL WIDGET BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
        {/* METRICS SUMMARY CARDS (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Today's Spend */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl shadow-xs transition-all flex flex-col justify-between ${
              metrics.isBudgetExceeded
                ? 'bg-rose-50/90 border-2 border-rose-400 ring-2 ring-rose-400/20'
                : metrics.isBudgetWarning
                ? 'bg-amber-50/80 border border-amber-300'
                : 'bg-white border border-stone-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    metrics.isBudgetExceeded ? 'text-rose-700' : 'text-stone-400'
                  }`}
                >
                  Today&apos;s Spend
                </span>
                {metrics.isBudgetExceeded && (
                  <span className="text-[9px] font-black text-rose-700 bg-rose-200/80 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" /> OVER
                  </span>
                )}
              </div>
              <div
                className={`mt-1.5 text-base sm:text-lg font-black font-mono tracking-tight leading-tight transition-colors ${
                  metrics.isBudgetExceeded
                    ? 'text-rose-600 animate-pulse'
                    : 'text-stone-900'
                }`}
              >
                {formatCurrency(metrics.todayTotal, currency)}
              </div>
            </div>
            <span
              className={`text-[11px] mt-1 block leading-tight ${
                metrics.isBudgetExceeded ? 'text-rose-600 font-bold' : 'text-stone-500'
              }`}
            >
              {metrics.transactionCount} entries logged
            </span>
          </div>

          {/* Card 2: This Week's Spend */}
          <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                This Week
              </span>
              <div className="mt-1.5 text-base sm:text-lg font-black font-mono tracking-tight leading-tight text-stone-900">
                {formatCurrency(metrics.weekTotal, currency)}
              </div>
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block leading-tight">
              Since Monday
            </span>
          </div>

          {/* Card 3: Monthly Budget */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl shadow-xs flex flex-col justify-between transition-all ${
              metrics.isBudgetExceeded
                ? 'bg-rose-50/90 border-2 border-rose-400 ring-2 ring-rose-400/20'
                : metrics.isBudgetWarning
                ? 'bg-amber-50/80 border border-amber-300'
                : 'bg-white border border-stone-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    metrics.isBudgetExceeded ? 'text-rose-700' : 'text-stone-400'
                  }`}
                >
                  Monthly Budget
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempBudget(budget.monthlyBudget.toString());
                    setShowBudgetEditor(!showBudgetEditor);
                  }}
                  className={`text-[11px] font-bold hover:underline cursor-pointer ${
                    metrics.isBudgetExceeded ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {showBudgetEditor ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div
                className={`mt-1.5 text-base sm:text-lg font-black font-mono tracking-tight leading-tight ${
                  metrics.isBudgetExceeded ? 'text-rose-600' : 'text-stone-900'
                }`}
              >
                {formatCurrency(budget.monthlyBudget, currency)}
              </div>
              <span
                className={`text-[11px] mt-0.5 block leading-tight ${
                  metrics.isBudgetExceeded ? 'text-rose-600 font-bold' : 'text-stone-500'
                }`}
              >
                {metrics.budgetUsedPercent}% used · {formatCurrency(metrics.monthTotal, currency)} spent
              </span>
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

          {/* Card 4: Remaining / Status */}
          <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Budget Remaining
              </span>
              <div
                className={`mt-1.5 text-base sm:text-lg font-black font-mono tracking-tight leading-tight ${
                  metrics.isBudgetExceeded ? 'text-rose-600' : 'text-emerald-800'
                }`}
              >
                {formatCurrency(metrics.budgetRemaining, currency)}
              </div>
            </div>
            <span
              className={`text-[11px] mt-1 block leading-tight ${
                metrics.isBudgetExceeded ? 'text-rose-600 font-bold' : 'text-stone-500'
              }`}
            >
              {metrics.isBudgetExceeded ? 'Limit crossed' : 'Available balance'}
            </span>
          </div>
        </div>

        {/* OVER BUDGET ALERT BANNER */}
        {metrics.isBudgetExceeded && (
          <div className="p-3.5 sm:p-4 bg-rose-600 text-white rounded-2xl shadow-md border border-rose-500 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black block leading-tight">
                  Budget Limit Exceeded!
                </span>
                <span className="text-[11px] sm:text-xs text-rose-100 font-medium block mt-0.5">
                  Spent {formatCurrency(metrics.monthTotal, currency)} of {formatCurrency(budget.monthlyBudget, currency)} monthly limit
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTempBudget(budget.monthlyBudget.toString());
                setShowBudgetEditor(true);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-white text-rose-700 hover:bg-rose-50 rounded-xl shrink-0 shadow-xs cursor-pointer transition-colors"
            >
              Adjust Limit
            </button>
          </div>
        )}

        {/* Inline Budget Editor (when user taps 'Edit') */}
        {showBudgetEditor && (
          <form
            onSubmit={handleUpdateBudgetSubmit}
            className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 animate-in fade-in duration-150 space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Set Monthly Budget ({currConfig.symbol})</span>
              <button
                type="button"
                onClick={() => setShowBudgetEditor(false)}
                className="text-stone-500 hover:text-stone-800 text-[11px] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                  {currConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs font-mono font-bold bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="50000"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* VERTICAL STREAM: DIRECT ADD + RECENT EXPENSES + CATEGORIES */}
        <div className="space-y-4">
          {/* DIRECT INSTANT ADD EXPENSE SECTION */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Direct Add Expense</span>
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                Auto-categorized &amp; rephrased
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
                placeholder={
                  isRecording
                    ? 'Listening... speak now'
                    : 'e.g. "Biryani 350", "Cold Drink 80", "Petrol 1000"'
                }
                className="w-full pl-12 pr-12 py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
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
            <div className="pt-0.5">
              <span className="text-[10px] text-stone-400 font-semibold block mb-1.5 uppercase tracking-wider">
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
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                Recent Expenses ({filteredExpenses.length})
              </span>

              {/* Search bar inside list */}
              {expenses.length > 3 && (
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-white rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              )}
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
                <p className="text-xs font-medium">No matching expenses found.</p>
                <p className="text-[11px] mt-1 text-stone-400">
                  Hold phone icon or type above to add a new expense!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredExpenses.slice(0, 25).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between gap-3 transition-colors hover:border-stone-300"
                  >
                    {/* Category icon */}
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <CategoryIcon category={exp.category} className="w-4.5 h-4.5 text-emerald-800" />
                    </div>

                    {/* Title & Category info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
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
                      <span className="text-xs sm:text-sm font-black font-mono text-stone-900 tabular-nums">
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
            <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider block">
                Spending by Category
              </span>

              <div className="space-y-2.5">
                {sortedCategories.slice(0, 7).map(([cat, total]) => {
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
      </div>

      {/* 3. WIDGET FOOTER */}
      <div className="px-4 sm:px-6 py-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
        <button
          type="button"
          onClick={onCollapse}
          className="text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs"
        >
          <span>← Return to Phone Screen</span>
        </button>
        <span className="text-[10px] text-stone-400 font-mono">
          Kharcha AI · Responsive Widget
        </span>
      </div>
    </div>
  );
};
