export type CategoryName =
  | 'Food & Drinks'
  | 'Transport'
  | 'Groceries'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Education'
  | 'Health'
  | 'Entertainment'
  | 'Personal Care'
  | 'Rent'
  | 'Subscriptions'
  | 'Travel'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: CategoryName | string;
  expenseDate: string; // YYYY-MM-DD
  paymentMethod: string;
  notes?: string;
  originalTranscript?: string;
  createdAt: string;
  isFuturePlan?: boolean;
}

export interface ExtractedExpense extends Expense {
  missingAmount?: boolean;
  clarificationNeeded?: string;
}

export interface BudgetConfig {
  monthlyBudget: number;
  currency: string;
  month: string; // YYYY-MM
  alertThresholdPercent: number; // e.g. 85%
}

export type DateFilterOption = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export interface FilterState {
  dateFilter: DateFilterOption;
  customStartDate?: string;
  customEndDate?: string;
  category: string;
  searchQuery: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface CategoryMeta {
  name: CategoryName;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { name: 'Food & Drinks', icon: 'Utensils', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { name: 'Transport', icon: 'Car', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { name: 'Groceries', icon: 'ShoppingBag', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { name: 'Shopping', icon: 'Tag', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { name: 'Bills & Utilities', icon: 'Zap', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { name: 'Education', icon: 'GraduationCap', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { name: 'Health', icon: 'HeartPulse', color: 'text-rose-700', bgColor: 'bg-rose-100' },
  { name: 'Entertainment', icon: 'Film', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  { name: 'Personal Care', icon: 'Sparkles', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  { name: 'Rent', icon: 'Home', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  { name: 'Subscriptions', icon: 'Repeat', color: 'text-violet-700', bgColor: 'bg-violet-100' },
  { name: 'Travel', icon: 'Plane', color: 'text-sky-700', bgColor: 'bg-sky-100' },
  { name: 'Other', icon: 'MoreHorizontal', color: 'text-stone-700', bgColor: 'bg-stone-200' },
];

export const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'EasyPaisa',
  'JazzCash',
  'Bank Transfer',
  'Nayapay',
  'SadaPay',
  'Other',
];
