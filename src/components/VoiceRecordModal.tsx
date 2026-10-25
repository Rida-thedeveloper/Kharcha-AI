import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles, X, Plus, AlertCircle, Volume2 } from 'lucide-react';
import { ExtractedExpense } from '../types/expense';
import { speechManager } from '../lib/speech';
import { parseRomanUrduExpenses, sanitizeExtractedItem } from '../lib/romanUrduNlp';
import { ExpenseReviewCard } from './ExpenseReviewCard';

interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpenses: (expenses: ExtractedExpense[]) => void;
  initialText?: string;
  autoStartRecording?: boolean;
}

const SAMPLE_PROMPTS = [
  'Biryani 250',
  'Cold Drink 80',
  'Petrol 500',
  'Grocery 1500',
  'Electricity Bill 5000',
];

export const VoiceRecordModal: React.FC<VoiceRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveExpenses,
  initialText = '',
  autoStartRecording = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItems, setReviewItems] = useState<ExtractedExpense[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-US' | 'ur-PK'>('en-US');
  const [manualText, setManualText] = useState(initialText);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const isSpeechSupported = speechManager.isSupported();
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  // Process initialText if provided, or auto start mic if requested
  useEffect(() => {
    if (!isOpen) return;
    if (initialText && initialText.trim()) {
      setManualText(initialText);
      processTranscript(initialText.trim());
    } else if (autoStartRecording && isSpeechSupported) {
      startVoiceRecording();
    }
  }, [isOpen, initialText, autoStartRecording]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      speechManager.stop();
    };
  }, []);

  const startVoiceRecording = () => {
    setSpeechError(null);
    setProcessingError(null);
    setReviewItems([]);
    setTranscript('');
    setManualText('');

    speechManager.setLanguage(selectedLanguage);
    speechManager.start({
      onTranscriptChange: (text) => {
        setTranscript(text);
        setManualText(text);
      },
      onError: (err) => {
        setSpeechError(err);
        setIsRecording(false);
      },
      onStateChange: (recording) => {
        setIsRecording(recording);
      },
    });
  };

  const stopVoiceRecording = () => {
    speechManager.stop();
    setIsRecording(false);
    const textToProcess = manualText || transcriptRef.current;
    if (textToProcess.trim()) {
      processTranscript(textToProcess.trim());
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/extract-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          localDate: today,
          timezone: 'Asia/Karachi',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      let items: ExtractedExpense[] = data.expenses || [];

      if (!items || items.length === 0) {
        items = parseRomanUrduExpenses(text, { todayStr: today, currency: 'PKR' });
      }

      const sanitized = items.map((it) => sanitizeExtractedItem(it, today, 'PKR'));

      if (sanitized.length > 0) {
        setReviewItems(sanitized);
      } else {
        setProcessingError(
          'No distinct expenses could be recognized. Please specify an expense name and amount.'
        );
      }
    } catch (err: any) {
      console.warn('Network extraction error in modal, utilizing local Roman Urdu NLP parser:', err);
      const today = new Date().toISOString().split('T')[0];
      const fallback = parseRomanUrduExpenses(text, { todayStr: today, currency: 'PKR' });
      if (fallback.length > 0) {
        setReviewItems(fallback.map((it) => sanitizeExtractedItem(it, today, 'PKR')));
      } else {
        setProcessingError(err?.message || 'Failed to process expense with AI. Please check server.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      processTranscript(manualText.trim());
    }
  };

  const handleCardChange = (index: number, updated: ExtractedExpense) => {
    const next = [...reviewItems];
    next[index] = updated;
    setReviewItems(next);
  };

  const handleCardRemove = (index: number) => {
    setReviewItems(reviewItems.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: ExtractedExpense = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'New Expense',
      amount: 0,
      currency: 'PKR',
      category: 'Food & Drinks',
      expenseDate: today,
      paymentMethod: 'Cash',
      notes: '',
      createdAt: new Date().toISOString(),
      missingAmount: true,
      clarificationNeeded: 'Please enter the amount spent',
    };
    setReviewItems([...reviewItems, newItem]);
  };

  const handleConfirmAndSave = () => {
    // Validate that items have titles
    const validItems = reviewItems.filter((it) => it.title.trim().length > 0);
    if (validItems.length === 0) {
      setProcessingError('Please review and provide valid expense details.');
      return;
    }
    onSaveExpenses(validItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Record Expense with Voice & AI
              </h2>
              <p className="text-xs text-stone-500">
                Smart speech recognition &amp; instant parsing
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              speechManager.stop();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-4 space-y-4">
          {reviewItems.length === 0 ? (
            <>
              {/* Voice Interface */}
              <div className="bg-white rounded-xl p-5 border border-stone-200 text-center flex flex-col items-center justify-center">
                {/* Language toggle */}
                <div className="mb-4 inline-flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('en-US');
                      speechManager.setLanguage('en-US');
                    }}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      selectedLanguage === 'en-US'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    English / Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('ur-PK');
                      speechManager.setLanguage('ur-PK');
                    }}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      selectedLanguage === 'ur-PK'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Urdu (اردو)
                  </button>
                </div>

                {/* Big Mic Button with visual pulse indicator */}
                <div className="relative my-3">
                  {isRecording && (
                    <>
                      <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                      <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={isProcessing}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                    aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                {/* Animated Sound Waves while recording */}
                {isRecording && (
                  <div className="flex items-center gap-1.5 h-6 my-2">
                    {[40, 75, 55, 95, 65, 80, 45, 90, 60, 85, 50, 70].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="w-1 bg-emerald-600 rounded-full animate-bounce"
                      />
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs font-semibold text-stone-800">
                  {isRecording ? 'Listening... Tap to finish' : 'Tap microphone to speak'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  e.g. &ldquo;Biryani 250, Careem 100, Petrol 500&rdquo;
                </p>

                {/* Live Transcript Display */}
                {isRecording && transcript && (
                  <div className="mt-4 w-full p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-left italic">&ldquo;{transcript}&rdquo;</p>
                  </div>
                )}

                {/* Speech Error */}
                {speechError && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>{speechError}</p>
                  </div>
                )}
              </div>

              {/* Text Fallback / Alternative Input */}
              <div className="bg-white rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-700">
                    Or type expenses manually:
                  </span>
                  {!isSpeechSupported && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Mic unsupported in browser
                    </span>
                  )}
                </div>

                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="e.g. Biryani 250, Careem 100, Petrol 500..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !manualText.trim()}
                    className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Parse</span>
                  </button>
                </form>

                {/* Sample Prompt Chips */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-[11px] text-stone-400 mb-1.5 font-medium">
                    Try quick test phrases:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setManualText(sample);
                          processTranscript(sample);
                        }}
                        disabled={isProcessing}
                        className="text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors text-left truncate max-w-full"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Review & Confirmation Stage */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-bold text-stone-900">
                    Review Extracted Expenses
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Verify and edit amounts, categories, and dates before saving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another
                </button>
              </div>

              {/* Review Cards list */}
              <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                {reviewItems.map((item, idx) => (
                  <ExpenseReviewCard
                    key={item.id}
                    expense={item}
                    index={idx}
                    totalItems={reviewItems.length}
                    onChange={(updated) => handleCardChange(idx, updated)}
                    onRemove={() => handleCardRemove(idx)}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReviewItems([]);
                    setManualText('');
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium py-2 px-3"
                >
                  Record Again
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-stone-500 hover:text-stone-800 font-medium py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSave}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Confirm &amp; Save ({reviewItems.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-700 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-950">
                  Kharcha AI is analyzing your expenses...
                </p>
                <p className="text-[11px] text-emerald-800">
                  Separating multiple expenses, parsing dates &amp; categories with Gemini
                </p>
              </div>
            </div>
          )}

          {/* Processing Error */}
          {processingError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{processingError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
