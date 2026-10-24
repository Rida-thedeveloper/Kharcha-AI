import React, { useState } from 'react';
import { Expense, BudgetConfig } from '../types/expense';
import { X, Download, Upload, Database, Check, AlertCircle } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budget: BudgetConfig;
  onImportExpenses: (imported: Expense[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  expenses,
  budget,
  onImportExpenses,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'supabase'>('backup');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  // Export JSON file
  const handleExportJSON = () => {
    const data = {
      app: 'Kharcha AI',
      exportedAt: new Date().toISOString(),
      budget,
      expenses,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kharcha_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusType('success');
    setImportStatus('Backup JSON file exported successfully.');
  };

  // Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.expenses)) {
          onImportExpenses(parsed.expenses);
          setStatusType('success');
          setImportStatus(`Successfully imported ${parsed.expenses.length} expenses!`);
        } else if (Array.isArray(parsed)) {
          onImportExpenses(parsed);
          setStatusType('success');
          setImportStatus(`Successfully imported ${parsed.length} expenses!`);
        } else {
          setStatusType('error');
          setImportStatus('Invalid backup file format. Expected a list of expenses.');
        }
      } catch (err) {
        setStatusType('error');
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Data &amp; Persistence Management
              </h3>
              <p className="text-xs text-stone-500">
                Current Storage: LocalStorage (Device-local)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeTab === 'backup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Backup &amp; Restore
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeTab === 'supabase'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Supabase Cloud Ready
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          {importStatus && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusType === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <p>{importStatus}</p>
            </div>
          )}

          {activeTab === 'backup' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">Export JSON Backup</h4>
                <p className="text-stone-500 mb-3">
                  Download a complete JSON snapshot of all {expenses.length} expenses and budget settings.
                </p>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON Backup</span>
                </button>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">Import JSON Backup</h4>
                <p className="text-stone-500 mb-3">
                  Restore expenses from a previously exported Kharcha AI JSON backup file.
                </p>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">
                  Cloud Synchronization Architecture
                </h4>
                <p className="text-stone-600 leading-relaxed mb-3">
                  Kharcha AI is structured with a decoupled storage repository pattern. To connect
                  a Supabase PostgreSQL database for multi-user authentication and cross-device sync:
                </p>
                <div className="p-2.5 bg-stone-900 text-stone-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {`CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'PKR',
  category TEXT NOT NULL,
  expense_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT,
  original_transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);`}
                </div>
                <p className="text-stone-500 mt-2 text-[11px]">
                  All client hooks in <code className="bg-stone-100 px-1 py-0.5 rounded">src/lib/storage.ts</code> are designed to swap out LocalStorage calls for Supabase client queries without altering UI components.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
