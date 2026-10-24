import React from 'react';
import { SUPPORTED_CURRENCIES, CurrencyConfig } from '../lib/storage';
import { Coins, Check, Sparkles } from 'lucide-react';

interface CurrencySetupModalProps {
  isOpen: boolean;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const CurrencySetupModal: React.FC<CurrencySetupModalProps> = ({
  isOpen,
  selectedCurrency,
  onSelectCurrency,
  onClose,
  isInitialSetup = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            {isInitialSetup ? 'Select Your Currency' : 'Change Currency'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-[260px] mx-auto">
            {isInitialSetup
              ? 'Choose your primary currency. All expenses and budgets will be tracked in this format.'
              : 'Select your preferred currency for expense tracking.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
          {SUPPORTED_CURRENCIES.map((curr: CurrencyConfig) => {
            const isSelected = curr.code === selectedCurrency;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  onSelectCurrency(curr.code);
                  if (onClose) onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100/80 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl leading-none">{curr.flag}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold font-mono text-stone-900">
                      {curr.code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      ({curr.symbol})
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 truncate block mt-0.5">
                    {curr.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {isInitialSetup ? (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                onSelectCurrency(selectedCurrency || 'PKR');
                if (onClose) onClose();
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Continue with {selectedCurrency || 'PKR'}</span>
            </button>
          </div>
        ) : (
          onClose && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
              >
                Close
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
