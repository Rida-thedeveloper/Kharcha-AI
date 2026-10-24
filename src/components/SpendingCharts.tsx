import React from 'react';
import { Expense } from '../types/expense';
import { formatCurrency } from '../lib/storage';
import { CategoryIcon } from './CategoryIcon';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface SpendingChartsProps {
  expenses: Expense[];
  currency?: string;
  metrics: {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    prevMonthTotal: number;
    momChangePercent: number | null;
    highestCategory: string;
    highestAmount: number;
    categoryTotals: Record<string, number>;
  };
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  expenses,
  metrics,
  currency = 'PKR',
}) => {
  // Compute last 7 days spending
  const today = new Date();
  const days: { dateStr: string; label: string; amount: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const totalForDay = expenses
      .filter((e) => e.expenseDate === dateStr && !e.isFuturePlan)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    days.push({
      dateStr,
      label: i === 0 ? 'Today' : dayName,
      amount: totalForDay,
    });
  }

  const maxDailyAmount = Math.max(...days.map((d) => d.amount), 500);

  // Compute category breakdown
  const categoryEntries = Object.entries(metrics.categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );
  const totalCategorySpend = categoryEntries.reduce((s, [, amt]) => s + amt, 0) || 1;

  // Compute past 4 months spending for monthly trend
  const monthData: { monthName: string; total: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mStr = d.toISOString().slice(0, 7);
    const mLabel = d.toLocaleDateString('en-US', { month: 'short' });

    const mTotal = expenses
      .filter((e) => e.expenseDate.startsWith(mStr) && !e.isFuturePlan)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    monthData.push({ monthName: mLabel, total: mTotal });
  }
  const maxMonthAmount = Math.max(...monthData.map((m) => m.total), 1000);

  return (
    <div className="space-y-6">
      {/* Month-over-month insight banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">
            Top Spending Category
          </span>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CategoryIcon category={metrics.highestCategory} size={16} />
              </div>
              <span className="text-sm font-semibold text-stone-900">
                {metrics.highestCategory}
              </span>
            </div>
            <span className="text-sm font-bold font-mono tabular-nums text-stone-900">
              {formatCurrency(metrics.highestAmount)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">
            Vs. Previous Month
          </span>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-stone-900 font-mono tabular-nums">
                {formatCurrency(metrics.monthTotal)}
              </span>
              <span className="text-xs text-stone-400 ml-1.5 font-mono tabular-nums">
                (prev: {formatCurrency(metrics.prevMonthTotal)})
              </span>
            </div>
            {metrics.momChangePercent !== null ? (
              <div
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  metrics.momChangePercent > 0
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {metrics.momChangePercent > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{Math.abs(metrics.momChangePercent)}%</span>
              </div>
            ) : (
              <span className="text-xs text-stone-400">First month tracked</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Spending Chart (Last 7 Days) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Daily Spending Trend
            </h4>
            <p className="text-[11px] text-stone-500">Last 7 days of expenses</p>
          </div>
          <span className="text-xs font-medium font-mono tabular-nums text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Week: {formatCurrency(metrics.weekTotal)}
          </span>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
          {days.map((d, idx) => {
            const heightPercent = Math.max(
              4,
              Math.round((d.amount / maxDailyAmount) * 100)
            );
            const isToday = idx === days.length - 1;

            return (
              <div
                key={d.dateStr}
                className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-stone-900 text-white text-[10px] py-1 px-2 rounded font-mono tabular-nums whitespace-nowrap pointer-events-none z-10 shadow-md">
                  {formatCurrency(d.amount)}
                </div>

                {/* Amount on top if > 0 */}
                {d.amount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-stone-500 hidden sm:block">
                    Rs. {Math.round(d.amount)}
                  </span>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[32px] rounded-t-md transition-all ${
                    isToday
                      ? 'bg-emerald-600 group-hover:bg-emerald-700'
                      : 'bg-stone-200 group-hover:bg-emerald-400'
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-[11px] font-medium mt-1 truncate ${
                    isToday ? 'text-emerald-700 font-bold' : 'text-stone-500'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Category Breakdown
            </h4>
            <p className="text-[11px] text-stone-500">Current month distribution</p>
          </div>
          <span className="text-xs font-medium font-mono tabular-nums text-stone-600">
            {formatCurrency(metrics.monthTotal)}
          </span>
        </div>

        {categoryEntries.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            No expenses recorded for this month yet.
          </p>
        ) : (
          <div className="space-y-3 pt-2">
            {categoryEntries.map(([cat, amt]) => {
              const pct = Math.round((amt / totalCategorySpend) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-stone-600 bg-stone-100">
                        <CategoryIcon category={cat} size={13} />
                      </div>
                      <span className="font-medium text-stone-800">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-stone-900 font-semibold">
                        {formatCurrency(amt)}
                      </span>
                      <span className="text-stone-400 text-[11px] w-9 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Trend (4 Months) */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Monthly Trend
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center pt-2">
          {monthData.map((m, idx) => {
            const isCurrent = idx === monthData.length - 1;
            const barPct = Math.max(8, Math.round((m.total / maxMonthAmount) * 100));

            return (
              <div key={m.monthName} className="flex flex-col items-center">
                <div className="h-24 w-full flex items-end justify-center pb-1">
                  <div
                    style={{ height: `${barPct}%` }}
                    className={`w-8 rounded-t-md transition-all ${
                      isCurrent ? 'bg-emerald-600' : 'bg-stone-200'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold text-stone-800 mt-1">
                  {m.monthName}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-stone-500">
                  {formatCurrency(m.total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
