import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Expense, BudgetConfig, ExtractedExpense } from './types/expense';
import {
  loadExpenses,
  saveExpenses,
  loadBudget,
  saveBudget,
  computeMetrics,
  formatCurrency,
  loadCurrency,
  saveCurrency,
  getCurrencyConfig,
  getInitialSeedExpenses,
} from './lib/storage';
import {
  parseRomanUrduExpenses,
  sanitizeExtractedItem,
  splitCombinedExpenses,
} from './lib/romanUrduNlp';
import { ExpandedWidget } from './components/ExpandedWidget';
import { EditExpenseModal } from './components/EditExpenseModal';
import { CurrencySetupModal } from './components/CurrencySetupModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ResetConfirmationModal } from './components/ResetConfirmationModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PhoneWidgetIcon } from './components/PhoneWidgetIcon';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wifi,
  Battery,
  Camera,
  MessageCircle,
  Phone,
  Compass,
  Coins,
  Maximize2,
  Smartphone,
  Sliders,
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function App() {
  // 1. One-time currency setup state
  const [currency, setCurrency] = useState<string>(() => loadCurrency() || 'PKR');
  const [showCurrencyModal, setShowCurrencyModal] = useState<boolean>(() => !loadCurrency());

  // 2. Expense records and budget state
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const b = loadBudget();
    return { ...b, currency: loadCurrency() || 'PKR' };
  });

  // 3. Widget expansion state: false = phone icon on home screen, true = full expanded widget
  const [widgetExpanded, setWidgetExpanded] = useState<boolean>(false);

  // 4. Extraction & loading state
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 5. In-app confirmation dialog state
  const [expensePendingDelete, setExpensePendingDelete] = useState<Expense | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // 6. Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success',
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, action ? 6000 : 3800);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  // Handle currency selection
  const handleSelectCurrency = (newCurr: string) => {
    saveCurrency(newCurr);
    setCurrency(newCurr);
    setBudget((prev) => ({ ...prev, currency: newCurr }));
    setShowCurrencyModal(false);
    showToast(`Currency set to ${newCurr}`, 'info');
  };

  // Compute live metrics
  const metrics = useMemo(() => {
    return computeMetrics(expenses, budget);
  }, [expenses, budget]);

  // DIRECT AUTO-SAVE: Extracts expense using Gemini and saves immediately without asking
  const handleDirectExtractAndSave = async (transcriptText: string) => {
    const text = transcriptText.trim();
    if (!text) {
      showToast('No speech detected. Hold the icon and speak, or tap to type!', 'info');
      return;
    }

    setIsExtracting(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch('/api/extract-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          text,
          localDate: todayStr,
          dateContext: todayStr,
          currency: currency || 'PKR',
        }),
      });

      if (!res.ok) {
        throw new Error(`Extraction server responded with ${res.status}`);
      }

      const data = await res.json();
      let extractedList: ExtractedExpense[] = data.expenses || [];

      // Fallback if list is empty but text was provided
      if (extractedList.length === 0) {
        extractedList = parseRomanUrduExpenses(text, {
          todayStr,
          currency: currency || 'PKR',
        });
      }

      // Directly convert and save to state with complete stopword sanitization and category detection
      const sanitized = extractedList.map((item) =>
        sanitizeExtractedItem(item, todayStr, currency || 'PKR')
      );
      const newItems: Expense[] = splitCombinedExpenses(sanitized, todayStr, currency || 'PKR');

      // Immediately append to expenses list
      setExpenses((prev) => [...newItems, ...prev]);

      // Direct success notifications
      for (const it of newItems) {
        showToast(`✓ Saved: ${it.title} · ${formatCurrency(it.amount, currency)} (${it.category})`);
      }
    } catch (err) {
      console.warn('Network extraction error, utilizing Roman Urdu parser fallback:', err);
      // Even if network or API errors, accurately parse Roman Urdu and save cleanly
      const parsed = parseRomanUrduExpenses(text, {
        todayStr,
        currency: currency || 'PKR',
      });
      const fallbackItems = splitCombinedExpenses(parsed, todayStr, currency || 'PKR');

      const directItems: Expense[] = fallbackItems.length > 0
        ? fallbackItems
        : [
            sanitizeExtractedItem(
              {
                id: 'exp_' + Date.now().toString(36),
                title: text,
                amount: 0,
                currency: currency || 'PKR',
                category: 'Other',
                expenseDate: todayStr,
                paymentMethod: 'Cash',
                notes: text,
                originalTranscript: text,
                createdAt: new Date().toISOString(),
                isFuturePlan: false,
              },
              todayStr,
              currency || 'PKR'
            ),
          ];

      setExpenses((prev) => [...directItems, ...prev]);
      for (const it of directItems) {
        showToast(`✓ Saved: ${it.title} · ${formatCurrency(it.amount, currency)} (${it.category})`);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Handler: Edit existing expense
  const handleUpdateExpense = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showToast(`Updated "${updated.title}"`);
  };

  // Handler: Delete expense - opens in-app confirmation modal
  const handleDeleteExpense = (id: string) => {
    const item = expenses.find((e) => e.id === id);
    if (item) {
      setExpensePendingDelete(item);
    }
  };

  // Perform confirmed deletion
  const handleConfirmDelete = () => {
    if (!expensePendingDelete) return;
    const item = expensePendingDelete;
    setExpenses((prev) => prev.filter((e) => e.id !== item.id));
    setExpensePendingDelete(null);
    if (editingExpense?.id === item.id) {
      setEditingExpense(null);
    }
    showToast(`Deleted "${item.title}"`, 'info', {
      label: 'Undo',
      onClick: () => {
        setExpenses((prev) => [item, ...prev]);
        showToast(`Restored "${item.title}"`, 'success');
      },
    });
  };

  // Handler: Update budget
  const handleUpdateBudget = (newBudget: BudgetConfig) => {
    setBudget(newBudget);
    showToast(`Monthly budget set to ${formatCurrency(newBudget.monthlyBudget, currency)}`);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    localStorage.removeItem('kharcha_ai_expenses_v1');
    const freshSeed = getInitialSeedExpenses();
    saveExpenses(freshSeed);
    setExpenses(freshSeed);
    setShowResetModal(false);
    showToast('Reset sample transactions successfully', 'info');
  };

  // Current dynamic time for mobile status bar & clock
  const [currentTime, setCurrentTime] = useState({
    timeStr: '09:41',
    dateStr: 'Saturday, October 24',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const dateFormatted = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      setCurrentTime({
        timeStr: `${hours}:${minutes}`,
        dateStr: dateFormatted,
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const currConfig = getCurrencyConfig(currency);

  return (
    <div className="min-h-screen w-full bg-[#18181B] sm:bg-[#EFECE6] text-stone-900 font-sans flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-emerald-200 antialiased">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none max-w-sm ml-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 text-white rounded-2xl shadow-xl text-xs font-medium flex items-center justify-between gap-3 pointer-events-auto border animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-800'
                : toast.type === 'info'
                ? 'bg-stone-900/95 border-stone-800'
                : 'bg-emerald-950/95 border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="leading-tight truncate">{toast.message}</span>
            </div>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-white text-stone-900 hover:bg-stone-100 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}

        {/* Global Extracting Loader Pill */}
        {isExtracting && (
          <div className="p-3 bg-stone-950/95 text-white rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 border border-emerald-500/50 animate-pulse pointer-events-auto">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <span>Analyzing &amp; saving expense with AI...</span>
          </div>
        )}
      </div>

      {/* Main Container: Strict Vertical Phone Shape for both collapsed and expanded views */}
      <div
        className={`w-full transition-all duration-300 flex flex-col relative overflow-hidden ${
          widgetExpanded
            ? 'h-[100dvh] sm:h-[844px] sm:max-w-[400px] sm:rounded-[44px] sm:border-[5px] sm:border-stone-800 sm:shadow-2xl bg-[#FAF8F5]'
            : 'h-[100dvh] sm:h-[844px] sm:max-w-[390px] bg-stone-950 sm:p-3 sm:rounded-[50px] sm:shadow-2xl sm:border-[5px] sm:border-stone-800'
        }`}
      >
        {!widgetExpanded ? (
          <>
            {/* Physical Dynamic Island / Speaker Notch (visible on phone mockup) */}
            <div className="hidden sm:flex w-28 h-4.5 bg-black rounded-full mx-auto mb-1 items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 bg-stone-900 rounded-full mr-2" />
              <div className="w-2 h-2 bg-stone-950 rounded-full" />
            </div>

            {/* Phone Screen Canvas */}
            <div className="w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white sm:rounded-[40px] overflow-hidden flex flex-col relative">
              {/* Top Status Bar */}
              <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-stone-300 select-none shrink-0 z-10">
                <span>{currentTime.timeStr}</span>
                <div className="flex items-center gap-2 text-stone-300">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    {currConfig.code === 'PKR' ? 'Rs.' : currConfig.code}
                  </span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* PHONE HOME SCREEN: CLEAN, MINIMAL, JUST THE ICON */}
              <div className="flex-1 flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
                {/* Minimal Top Clock & Date */}
                <div className="text-center pt-6">
                  <span className="text-5xl font-extralight tracking-tight text-white block font-sans">
                    {currentTime.timeStr}
                  </span>
                  <span className="text-xs text-stone-400 font-medium mt-1 block tracking-wide">
                    {currentTime.dateStr}
                  </span>
                </div>

                {/* CENTER: KHARCHA AI WIDGET ICON */}
                <div className="my-auto py-8 flex flex-col items-center justify-center">
                  <PhoneWidgetIcon
                    todayTotal={metrics.todayTotal}
                    currency={currency}
                    onTap={() => setWidgetExpanded(true)}
                    onHoldRecordComplete={handleDirectExtractAndSave}
                    onSpeechError={(err) => showToast(err, 'info')}
                    isProcessing={isExtracting}
                    isBudgetExceeded={metrics.isBudgetExceeded}
                    isBudgetWarning={metrics.isBudgetWarning}
                  />
                </div>

                {/* Bottom Phone Dock */}
                <div className="space-y-3 pb-2">
                  <div className="flex justify-center">
                    <PWAInstallButton variant="compact" />
                  </div>
                  <div className="p-2.5 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-around text-stone-300 border border-white/5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600/90 flex items-center justify-center text-white shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/90 flex items-center justify-center text-white shadow-sm">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-amber-600/90 flex items-center justify-center text-white shadow-sm">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-purple-600/90 flex items-center justify-center text-white shadow-sm">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-32 h-1 bg-white/40 rounded-full mx-auto my-2 shrink-0 pointer-events-none" />
            </div>
          </>
        ) : (
          /* EXPANDED VIEW: COMPLETE RESPONSIVE EXPENSE MANAGEMENT */
          <div className="w-full h-full flex flex-col animate-in fade-in duration-200">
            <ExpandedWidget
              expenses={expenses}
              budget={budget}
              currency={currency}
              metrics={metrics}
              onCollapse={() => setWidgetExpanded(false)}
              onDirectSaveExpense={handleDirectExtractAndSave}
              onEditExpense={(exp) => setEditingExpense(exp)}
              onDeleteExpense={handleDeleteExpense}
              onUpdateBudget={handleUpdateBudget}
              onOpenCurrencySettings={() => setShowCurrencyModal(true)}
            />
          </div>
        )}
      </div>

      {/* Desktop External Helper Controls Bar */}
      <div className="hidden sm:flex items-center justify-center gap-3 mt-4 text-xs text-stone-500">
        <PWAInstallButton variant="compact" />

        <button
          type="button"
          onClick={() => setShowCurrencyModal(true)}
          className="hover:text-stone-800 inline-flex items-center gap-1 font-medium bg-white/70 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-700" />
          <span>Currency: {currConfig.flag} {currConfig.code === 'PKR' ? 'Rs.' : currConfig.code}</span>
        </button>

        <button
          type="button"
          onClick={() => setWidgetExpanded(!widgetExpanded)}
          className="hover:text-stone-800 inline-flex items-center gap-1 font-medium bg-white/70 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-700" />
          <span>{widgetExpanded ? 'Close to Home Screen' : 'Open Expanded Widget'}</span>
        </button>

        <button
          type="button"
          onClick={handleResetData}
          className="hover:text-stone-800 inline-flex items-center gap-1 font-medium bg-white/70 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors cursor-pointer"
          title="Reset sample data"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          currency={currency}
          onClose={() => setEditingExpense(null)}
          onSave={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      )}

      {/* In-App Delete Confirmation Modal */}
      {expensePendingDelete && (
        <DeleteConfirmationModal
          isOpen={!!expensePendingDelete}
          expense={expensePendingDelete}
          currency={currency}
          onConfirm={handleConfirmDelete}
          onCancel={() => setExpensePendingDelete(null)}
        />
      )}

      {/* In-App Reset Demo Confirmation Modal */}
      {showResetModal && (
        <ResetConfirmationModal
          isOpen={showResetModal}
          onConfirm={handleConfirmReset}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {/* One-time Currency Setup Modal */}
      {showCurrencyModal && (
        <CurrencySetupModal
          isOpen={showCurrencyModal}
          selectedCurrency={currency}
          onSelectCurrency={handleSelectCurrency}
          onClose={() => setShowCurrencyModal(false)}
          isInitialSetup={!loadCurrency()}
        />
      )}
    </div>
  );
}
