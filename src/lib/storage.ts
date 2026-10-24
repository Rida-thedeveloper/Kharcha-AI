import { Expense, BudgetConfig } from '../types/expense';

const STORAGE_KEY_EXPENSES = 'kharcha_ai_expenses_v1';
const STORAGE_KEY_BUDGET = 'kharcha_ai_budget_v1';

// Seed sample data for demonstration if empty
export function getInitialSeedExpenses(): Expense[] {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = format(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday);

  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = format(threeDaysAgo);

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fiveDaysAgoStr = format(fiveDaysAgo);

  return [
    {
      id: 'seed_1',
      title: 'Chicken Biryani & Raita',
      amount: 450,
      currency: 'PKR',
      category: 'Food & Drinks',
      expenseDate: todayStr,
      paymentMethod: 'Cash',
      notes: 'Office lunch with team',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'seed_2',
      title: 'Careem Ride to Mall',
      amount: 320,
      currency: 'PKR',
      category: 'Transport',
      expenseDate: todayStr,
      paymentMethod: 'Card',
      notes: 'Evening commute',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'seed_3',
      title: 'Weekly Milk & Grocery',
      amount: 1850,
      currency: 'PKR',
      category: 'Groceries',
      expenseDate: yesterdayStr,
      paymentMethod: 'EasyPaisa',
      notes: 'Bread, eggs, and milk from Imtiaz Super Market',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'seed_4',
      title: 'Car Petrol Fill-up',
      amount: 3500,
      currency: 'PKR',
      category: 'Transport',
      expenseDate: yesterdayStr,
      paymentMethod: 'Card',
      notes: 'Shell pump 12.5 liters',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    },
    {
      id: 'seed_5',
      title: 'Electricity Bill',
      amount: 7800,
      currency: 'PKR',
      category: 'Bills & Utilities',
      expenseDate: threeDaysAgoStr,
      paymentMethod: 'JazzCash',
      notes: 'K-Electric monthly bill paid via mobile app',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
      id: 'seed_6',
      title: 'Chai & Paratha Nashta',
      amount: 220,
      currency: 'PKR',
      category: 'Food & Drinks',
      expenseDate: fiveDaysAgoStr,
      paymentMethod: 'Cash',
      notes: 'Morning roadside dhaba breakfast',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    },
  ];
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      const seed = getInitialSeedExpenses();
      saveExpenses(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load expenses from LocalStorage:', err);
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses to LocalStorage:', err);
  }
}

const STORAGE_KEY_CURRENCY = 'kharcha_currency_v1';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PKR', symbol: 'Rs.', label: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', flag: '🇨🇦' },
];

export function loadCurrency(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_CURRENCY);
  } catch {
    return null;
  }
}

export function saveCurrency(currency: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
  } catch (err) {
    console.error('Failed to save currency:', err);
  }
}

export function getCurrencyConfig(code: string = 'PKR'): CurrencyConfig {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found || { code, symbol: code, label: code, flag: '🌐' };
}

// Dynamic currency formatter based on chosen currency
export function formatCurrency(amount: number, currencyCode: string = 'PKR'): string {
  if (isNaN(amount)) amount = 0;
  const config = getCurrencyConfig(currencyCode);
  const rounded = Math.round(amount).toLocaleString();
  return `${config.symbol} ${rounded}`;
}

// Backward compatibility helper
export function formatPKR(amount: number, currencyCode: string = 'PKR'): string {
  return formatCurrency(amount, currencyCode);
}

export function loadBudget(): BudgetConfig {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const defaultBudget: BudgetConfig = {
    monthlyBudget: 50000,
    currency: loadCurrency() || 'PKR',
    month: currentMonth,
    alertThresholdPercent: 85,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (!raw) return defaultBudget;
    const parsed = JSON.parse(raw);
    return { ...defaultBudget, ...parsed };
  } catch {
    return defaultBudget;
  }
}

export function saveBudget(budget: BudgetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
  } catch (err) {
    console.error('Failed to save budget:', err);
  }
}

// Compute overview metrics
export function computeMetrics(expenses: Expense[], budget: BudgetConfig) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Start of current week (Monday)
  const currentDay = today.getDay(); // 0 is Sun
  const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of current month
  const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM

  // Start of previous month
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  let prevMonthTotal = 0;
  let transactionCount = 0;

  const categoryTotals: Record<string, number> = {};

  for (const exp of expenses) {
    // Only count actual expenses, not pending future plans
    if (exp.isFuturePlan) continue;

    const expDate = exp.expenseDate;
    const amount = Number(exp.amount) || 0;

    if (expDate === todayStr) {
      todayTotal += amount;
    }

    const itemDate = new Date(expDate + 'T00:00:00');
    if (itemDate >= startOfWeek && itemDate <= today) {
      weekTotal += amount;
    }

    if (expDate.startsWith(currentMonthStr)) {
      monthTotal += amount;
      transactionCount++;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amount;
    }

    if (expDate.startsWith(prevMonthStr)) {
      prevMonthTotal += amount;
    }
  }

  // Find highest category
  let highestCategory = 'None';
  let highestAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  }

  const budgetRemaining = Math.max(0, budget.monthlyBudget - monthTotal);
  const budgetUsedPercent = budget.monthlyBudget > 0
    ? Math.round((monthTotal / budget.monthlyBudget) * 100)
    : 0;
  const isBudgetExceeded = monthTotal > budget.monthlyBudget;
  const isBudgetWarning = budgetUsedPercent >= budget.alertThresholdPercent && !isBudgetExceeded;

  // Month-over-month comparison percentage
  let momChangePercent: number | null = null;
  if (prevMonthTotal > 0) {
    momChangePercent = Math.round(((monthTotal - prevMonthTotal) / prevMonthTotal) * 100);
  }

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    prevMonthTotal,
    momChangePercent,
    transactionCount,
    budgetRemaining,
    budgetUsedPercent,
    isBudgetExceeded,
    isBudgetWarning,
    highestCategory,
    highestAmount,
    categoryTotals,
  };
}

// Generate CSV string and trigger download
export function exportExpensesToCSV(expenses: Expense[]) {
  const headers = ['Date', 'Title', 'Category', 'Amount (PKR)', 'Payment Method', 'Notes', 'Created At'];
  const rows = expenses.map((exp) => [
    `"${exp.expenseDate || ''}"`,
    `"${(exp.title || '').replace(/"/g, '""')}"`,
    `"${(exp.category || '').replace(/"/g, '""')}"`,
    exp.amount,
    `"${(exp.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(exp.notes || '').replace(/"/g, '""')}"`,
    `"${exp.createdAt || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kharcha_ai_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
