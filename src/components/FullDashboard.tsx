import React, { useState, useMemo } from 'react';
import {
  Expense,
  BudgetConfig,
  DateFilterOption,
  CATEGORIES,
} from '../types/expense';
import { formatPKR, exportExpensesToCSV } from '../lib/storage';
import { CategoryIcon } from './CategoryIcon';
import { SpendingCharts } from './SpendingCharts';
import {
  Search,
  Download,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
  Database,
  Calendar,
} from 'lucide-react';

interface FullDashboardProps {
  expenses: Expense[];
  budget: BudgetConfig;
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
  onBackToWidget: () => void;
  onOpenVoiceRecord: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateBudget: (budget: BudgetConfig) => void;
}

export const FullDashboard: React.FC<FullDashboardProps> = ({
  expenses,
  budget,
  metrics,
  onBackToWidget,
  onOpenVoiceRecord,
  onEditExpense,
  onDeleteExpense,
  onUpdateBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  // Quick budget editing
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget.monthlyBudget.toString());

  // Filtered and sorted expenses
  const filteredAndSorted = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const currentMonthStr = today.toISOString().slice(0, 7);

    let list = expenses.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesNotes = (item.notes || '').toLowerCase().includes(query);
        const matchesMethod = (item.paymentMethod || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesMethod) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Date Filter
      if (dateFilter === 'today') {
        if (item.expenseDate !== todayStr) return false;
      } else if (dateFilter === 'yesterday') {
        if (item.expenseDate !== yesterdayStr) return false;
      } else if (dateFilter === 'week') {
        const d = new Date(item.expenseDate + 'T00:00:00');
        if (d < startOfWeek || d > today) return false;
      } else if (dateFilter === 'month') {
        if (!item.expenseDate.startsWith(currentMonthStr)) return false;
      } else if (dateFilter === 'custom') {
        if (customStart && item.expenseDate < customStart) return false;
        if (customEnd && item.expenseDate > customEnd) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return b.expenseDate.localeCompare(a.expenseDate);
      } else if (sortBy === 'date-asc') {
        return a.expenseDate.localeCompare(b.expenseDate);
      } else if (sortBy === 'amount-desc') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      } else if (sortBy === 'amount-asc') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return 0;
    });

    return list;
  }, [
    expenses,
    searchQuery,
    selectedCategory,
    dateFilter,
    customStart,
    customEnd,
    sortBy,
  ]);

  const filteredTotal = useMemo(() => {
    return filteredAndSorted
      .filter((e) => !e.isFuturePlan)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredAndSorted]);

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBudgetInput) || 0;
    onUpdateBudget({
      ...budget,
      monthlyBudget: val,
    });
    setIsEditingBudget(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-stone-900 pb-16">
      {/* Top Bar following Top Bar Contract: Brand | Navigation links | Primary Action */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand wordmark & back to widget */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToWidget}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Widget</span>
            </button>

            <div className="h-5 w-px bg-stone-200" aria-hidden="true" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-stone-900 tracking-tight whitespace-nowrap">
                Kharcha AI
              </span>
              <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                / Expense Dashboard
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation / Info */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <span className="text-stone-400">
              Synchronized with LocalStorage &amp; Widget
            </span>
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => exportExpensesToCSV(filteredAndSorted)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenVoiceRecord}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Persistence Architecture Note */}
        <div className="p-3.5 rounded-xl bg-stone-100/80 border border-stone-200/80 text-xs text-stone-600 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-stone-500 shrink-0" />
            <span>
              <strong>Local Browser Storage:</strong> Data is saved on this browser &amp; device.
              Ready for Supabase cloud sync &amp; multi-device synchronization.
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono whitespace-nowrap">
            {expenses.length} records saved
          </span>
        </div>

        {/* Budget Warning Banner if needed */}
        {metrics.isBudgetExceeded && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Monthly Budget Exceeded!</p>
              <p className="mt-0.5 text-rose-800">
                Total monthly spending ({formatPKR(metrics.monthTotal)}) has exceeded your set budget of{' '}
                {formatPKR(budget.monthlyBudget)}.
              </p>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl bg-white border shadow-xs transition-colors ${metrics.isBudgetExceeded ? 'border-rose-300 bg-rose-50/40' : 'border-stone-200'}`}>
            <span className="text-xs font-medium text-stone-500 block">
              Today&apos;s Spending
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono tabular-nums ${metrics.isBudgetExceeded ? 'text-rose-600 animate-pulse' : 'text-stone-900'}`}>
                {formatPKR(metrics.todayTotal)}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${metrics.isBudgetExceeded ? 'text-rose-800 bg-rose-100 font-bold' : 'text-emerald-800 bg-emerald-50'}`}>
                {metrics.isBudgetExceeded ? '⚠️ Over' : 'Today'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-xs font-medium text-stone-500 block">
              This Week
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                {formatPKR(metrics.weekTotal)}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Mon - Sun
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl bg-white border shadow-xs transition-colors ${metrics.isBudgetExceeded ? 'border-rose-300 bg-rose-50/40' : 'border-stone-200'}`}>
            <span className="text-xs font-medium text-stone-500 block">
              This Month
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono tabular-nums ${metrics.isBudgetExceeded ? 'text-rose-600 animate-pulse' : 'text-emerald-800'}`}>
                {formatPKR(metrics.monthTotal)}
              </span>
              <span className={`text-xs font-mono tabular-nums ${metrics.isBudgetExceeded ? 'text-rose-600 font-bold' : 'text-stone-500'}`}>
                {metrics.transactionCount} txns {metrics.isBudgetExceeded ? '(Over Budget)' : ''}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">
                Budget Remaining
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewBudgetInput(budget.monthlyBudget.toString());
                  setIsEditingBudget(!isEditingBudget);
                }}
                className="text-[11px] font-semibold text-emerald-800 hover:underline"
              >
                {isEditingBudget ? 'Cancel' : 'Edit Limit'}
              </button>
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleBudgetSubmit} className="mt-2 flex gap-1">
                <input
                  type="number"
                  min="0"
                  value={newBudgetInput}
                  onChange={(e) => setNewBudgetInput(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-medium"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    metrics.isBudgetExceeded ? 'text-rose-600' : 'text-stone-900'
                  }`}
                >
                  {formatPKR(metrics.budgetRemaining)}
                </span>
                <span className="text-xs text-stone-400 font-mono tabular-nums">
                  of {formatPKR(budget.monthlyBudget)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Two-Column Layout: Left (Transaction Table & Filters) | Right (Spending Insights) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Transaction Table & Filters */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter and Control Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              {/* Search + Category + Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, category, or note..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="sm:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="amount-asc">Lowest Amount</option>
                  </select>
                </div>
              </div>

              {/* Date Filters Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {(
                  [
                    { id: 'all', label: 'All Dates' },
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: 'custom', label: 'Custom Range' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDateFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      dateFilter === tab.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range if active */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 font-medium mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg font-mono bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filter Metrics Bar */}
            <div className="flex items-center justify-between text-xs px-1 text-stone-600">
              <span>
                Showing <strong>{filteredAndSorted.length}</strong> transaction
                {filteredAndSorted.length === 1 ? '' : 's'}
              </span>
              <span className="font-bold text-stone-900 font-mono tabular-nums">
                Filtered Total: {formatPKR(filteredTotal)}
              </span>
            </div>

            {/* Transaction List: Desktop Table & Mobile Responsive Cards */}
            {filteredAndSorted.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
                <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800">
                  No transactions match your filters
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Try adjusting the date range or clear search terms.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table (hidden on small screens) */}
                <div className="hidden md:block bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Expense</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredAndSorted.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50/70 transition-colors group"
                        >
                          <td className="py-3 px-4 font-mono text-stone-600 whitespace-nowrap">
                            {item.expenseDate}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-stone-900">
                              {item.title}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-stone-400 truncate max-w-xs">
                                {item.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 text-stone-700">
                              <CategoryIcon category={item.category} size={14} />
                              <span>{item.category}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-500">
                            {item.paymentMethod || 'Cash'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold font-mono tabular-nums text-stone-900 whitespace-nowrap">
                            {formatPKR(item.amount)}
                            {item.isFuturePlan && (
                              <span className="block text-[10px] text-blue-600 font-normal">
                                Planned
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onEditExpense(item)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteExpense(item.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards (shown on small screens) */}
                <div className="md:hidden space-y-2.5">
                  {filteredAndSorted.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                          <CategoryIcon category={item.category} size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <span>{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{item.expenseDate}</span>
                            {item.paymentMethod && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{item.paymentMethod}</span>
                              </>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-stone-400 truncate mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono tabular-nums text-stone-900 block">
                          {formatPKR(item.amount)}
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => onEditExpense(item)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Col: Spending Insights & Visual Analytics */}
          <div className="space-y-4">
            <SpendingCharts expenses={expenses} metrics={metrics} />
          </div>
        </div>
      </main>
    </div>
  );
};
