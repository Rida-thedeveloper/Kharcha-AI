import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/storage';
import { speechManager } from '../lib/speech';

interface PhoneWidgetIconProps {
  todayTotal: number;
  currency?: string;
  onTap: () => void;
  onHoldRecordComplete: (transcript: string) => void;
  onSpeechError?: (error: string) => void;
  isProcessing?: boolean;
  isBudgetExceeded?: boolean;
  isBudgetWarning?: boolean;
}

export const PhoneWidgetIcon: React.FC<PhoneWidgetIconProps> = ({
  todayTotal,
  currency = 'PKR',
  onTap,
  onHoldRecordComplete,
  onSpeechError,
  isProcessing = false,
  isBudgetExceeded = false,
  isBudgetWarning = false,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [recordingTranscript, setRecordingTranscript] = useState('');

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointerStartTimeRef = useRef<number>(0);
  const transcriptRef = useRef('');
  transcriptRef.current = recordingTranscript;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      speechManager.stop();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isProcessing) return;

    // Do not preventDefault here so pointer capture functions properly
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    pointerStartTimeRef.current = Date.now();
    transcriptRef.current = '';
    setRecordingTranscript('');

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture fails on some test environments
    }

    // Start timer: if held for > 260ms, initiate hold-to-record
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsHolding(true);

      // Mobile haptic vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }

      if (!speechManager.isSupported()) {
        const errorMsg = 'Speech recognition is not supported in this browser. Tap to type!';
        if (onSpeechError) onSpeechError(errorMsg);
        return;
      }

      // Start recording speech
      speechManager.start({
        onTranscriptChange: (text) => {
          setRecordingTranscript(text);
          transcriptRef.current = text;
        },
        onError: (errMsg) => {
          console.warn('Speech recognition warning:', errMsg);
          if (onSpeechError) onSpeechError(errMsg);
        },
        onStateChange: () => {},
      });
    }, 260);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    // If pointer moves significantly (> 30px) before hold triggers, user is scrolling, so cancel hold
    if (!isHoldingRef.current && pointerDownPosRef.current) {
      const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
      if (dx > 30 || dy > 30) {
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    if (isHoldingRef.current) {
      // It was a hold! Stop recording and auto-process
      isHoldingRef.current = false;
      setIsHolding(false);
      speechManager.stop();

      const finalSpeech = transcriptRef.current.trim();
      onHoldRecordComplete(finalSpeech);
    } else {
      // Quick tap: open expanded view!
      const elapsed = Date.now() - pointerStartTimeRef.current;
      if (elapsed < 300) {
        onTap();
      }
    }
  };

  const handlePointerCancel = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsHolding(false);
      speechManager.stop();
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Live recording floating pill above the icon while holding */}
      {isHolding && (
        <div className="absolute -top-20 z-50 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          <div className="bg-stone-900 text-white text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-stone-700 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">
              Recording... Release to save
            </span>
          </div>

          {recordingTranscript ? (
            <div className="mt-1 bg-white text-stone-900 px-3 py-1 rounded-xl text-[11px] font-semibold shadow-md border border-stone-200 max-w-[260px] truncate text-center">
              &ldquo;{recordingTranscript}&rdquo;
            </div>
          ) : (
            <span className="text-[10px] text-stone-300 mt-1 bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Speak now (e.g. &ldquo;250 biryani&rdquo;)
            </span>
          )}
        </div>
      )}

      {/* Acoustic wave rings when holding */}
      {isHolding && (
        <>
          <div className="absolute -inset-4 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />
          <div className="absolute -inset-8 rounded-full bg-emerald-500/15 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Main Interactive Icon Button */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        disabled={isProcessing}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className={`relative group flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none select-none ${
          isHolding
            ? 'w-24 h-24 rounded-full bg-rose-600 text-white shadow-2xl ring-4 ring-rose-400 scale-105'
            : isBudgetExceeded
            ? 'w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-700 via-rose-800 to-stone-950 text-white shadow-2xl hover:scale-105 active:scale-95 border-2 border-rose-500 ring-4 ring-rose-500/40 animate-pulse'
            : isBudgetWarning
            ? 'w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-700 via-stone-800 to-emerald-950 text-white shadow-2xl hover:scale-105 active:scale-95 border-2 border-amber-400/80 ring-2 ring-amber-400/30'
            : 'w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 text-white shadow-2xl hover:scale-105 active:scale-95 border-2 border-emerald-400/40 ring-1 ring-white/20'
        }`}
        aria-label="Kharcha AI: Tap to expand, Hold to record audio"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Central Icon */}
        <div className="flex flex-col items-center justify-center">
          {isHolding ? (
            <>
              <MicOff className="w-8 h-8 animate-pulse text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                Release
              </span>
            </>
          ) : (
            <>
              <div className="relative">
                <Mic className="w-7 h-7 text-white" />
                <Sparkles className={`w-3.5 h-3.5 absolute -top-1 -right-2 animate-bounce ${isBudgetExceeded ? 'text-rose-300' : 'text-emerald-200'}`} />
              </div>
              <span className={`text-[10px] font-black tracking-tight mt-1 ${isBudgetExceeded ? 'text-rose-200' : 'text-emerald-100'}`}>
                {isBudgetExceeded ? 'OVER BUDGET' : 'KHARCHA'}
              </span>
            </>
          )}
        </div>

        {/* Small live spend badge on top corner - turns red when budget exceeded */}
        {!isHolding && (
          <div
            className={`absolute -top-2 -right-3 font-mono tabular-nums text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 transition-all ${
              isBudgetExceeded
                ? 'bg-rose-600 text-white border-2 border-rose-300 ring-2 ring-rose-500/60 animate-bounce'
                : isBudgetWarning
                ? 'bg-amber-600 text-white border border-amber-400 shadow-md'
                : 'bg-stone-900 text-white border border-stone-700 shadow-md'
            }`}
          >
            {isBudgetExceeded && <span className="text-[10px] leading-none">⚠️</span>}
            <span>{formatCurrency(todayTotal, currency)}</span>
          </div>
        )}
      </button>

      {/* Subtitle / Interaction Instructions */}
      <div className="mt-3.5 text-center pointer-events-none select-none">
        {isBudgetExceeded ? (
          <p className="text-xs font-black text-rose-400 flex items-center justify-center gap-1 drop-shadow-sm animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Over Budget! Limit Crossed</span>
          </p>
        ) : (
          <p className="text-xs font-bold text-stone-200 flex items-center justify-center gap-1.5 drop-shadow-sm">
            <span>Tap to Expand</span>
            <span className="text-stone-500">·</span>
            <span>Hold to Speak</span>
          </p>
        )}
        <p className={`text-[11px] mt-0.5 ${isBudgetExceeded ? 'text-rose-300 font-medium' : 'text-stone-400'}`}>
          {isBudgetExceeded ? 'Tap to view expenses & adjust budget' : 'Release to auto-categorize & save'}
        </p>
      </div>
    </div>
  );
};
