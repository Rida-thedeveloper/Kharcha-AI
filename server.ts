import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ExtractedExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  notes: string;
  originalTranscript: string;
  createdAt: string;
  isFuturePlan: boolean;
  missingAmount: boolean;
  clarificationNeeded?: string;
}

const VALID_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Groceries',
  'Shopping',
  'Bills & Utilities',
  'Education',
  'Health',
  'Entertainment',
  'Personal Care',
  'Rent',
  'Subscriptions',
  'Travel',
  'Other',
];

import {
  parseRomanUrduExpenses,
  sanitizeExtractedItem,
  cleanExpenseTitle,
  detectExpenseCategory,
  splitCombinedExpenses,
} from './src/lib/romanUrduNlp.ts';

// POST /api/extract-expenses endpoint
app.post('/api/extract-expenses', async (req, res) => {
  try {
    const rawTranscript = req.body.transcript || req.body.text;
    const localDate = req.body.localDate || req.body.dateContext;
    const timezone = req.body.timezone || 'Asia/Karachi';
    const currency = req.body.currency || 'PKR';

    if (!rawTranscript || typeof rawTranscript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const transcript = rawTranscript.trim();
    const referenceDate = localDate || new Date().toISOString().split('T')[0];

    // If Gemini API key is missing, use intelligent Roman Urdu local NLP parser
    if (!process.env.GEMINI_API_KEY) {
      const parsed = splitCombinedExpenses(
        parseRomanUrduExpenses(transcript, {
          todayStr: referenceDate,
          currency,
        }),
        referenceDate,
        currency
      );
      return res.json({ expenses: parsed, source: 'roman_urdu_nlp_parser' });
    }

    const systemInstruction = `You are Kharcha AI, an expert financial expense extractor specialized in ${currency}, Pakistani Roman Urdu, Urdu, English, and bilingual conversational speech.
Given a user's speech transcript or text description of their expenses, your job is to extract distinct expense items into a structured list.

Current Reference Context:
- Reference local date today is: "${referenceDate}"
- Reference Timezone: "${timezone}"
- Target currency: "${currency}"

Supported Categories:
- Food & Drinks (biryani, pulao, nihari, burger, pizza, chai, coffee, nashta, shawarma, karahi, roll, samosa, coldrik, coldrink, cold drink, soft drink, pepsi, coke, sprite, dew, juice, falooda, snack, dhaba, restaurant, etc.)
- Transport (petrol, fuel, diesel, rikshaw, auto, careem, uber, indrive, bykea, bus, metro, cab, taxi, fare/kiraya, toll, puncture, etc.)
- Groceries (doodh, milk, dahi, sabzi, tamatar, pyaz, aalo, atta, chawal, daal, oil, ghee, anday, gosht, chicken, fruit, rashan, mart, etc.)
- Bills & Utilities (bijli ka bill, electricity, gas bill, water tanker, internet, wifi, ptcl, mobile load, easyload, recharge, etc.)
- Shopping (kapray, clothes, shoes, joote, dress, suit, shirt, daraz order, mall, bag, makeup, etc.)
- Health (dawai, dawa, medicine, panadol, doctor, clinic, hospital, pharmacy, test, checkup, etc.)
- Education (school fee, college fee, tuition, academy, books, copy, register, exam fee, etc.)
- Personal Care (haircut, barber, salon, parlour, shave, cutting, facial, massage, etc.)
- Entertainment (netflix, cinema, movie, tickets, gaming, match, etc.)
- Rent (ghar ka kiraya, flat rent, room rent, hostel, etc.)
- Subscriptions (spotify, netflix, youtube premium, chatgpt, etc.)
- Travel (tour, trip, murree, hotel stay, flight, vacation, etc.)
- Other (anything else)

CRITICAL INSTRUCTIONS FOR ROMAN URDU & BILINGUAL SPEECH:
1. REPHRASE TITLE IN PROPER ENGLISH: Do NOT just copy the user's raw spoken words or transliterations. Rephrase and translate the expense title into clean, professional, concise Title Case English:
   - "yr aj mainay 200 ki biryani kahyae" -> title: "Biryani"
   - "coldrink pee hai" -> title: "Cold Drink"
   - "yr 500 ka petrol dalwaya tha" -> title: "Fuel / Petrol Refill"
   - "bhai 1500 ki grocery li aur 300 ka falooda khaya" -> Item 1: "Grocery Provisions", Item 2: "Falooda"
   - "5000 bijli ka bill paid via easypaisa" -> title: "Electricity Utility Bill"
   - "pani ka tanker mangwaya" -> title: "Water Supply Tanker"
   - "panadol dawai 80 rupay" -> title: "Panadol & Medicine"
   - "baal katwaye 300" -> title: "Haircut & Grooming"
   - "kapray khareede 2000" -> title: "Clothing & Shopping"
   - "careem ride 250" -> title: "Careem Cab Ride"
   - "subha ka nashta aur chai" -> title: "Breakfast & Tea"

2. STRIP ALL CONVERSATIONAL FILLERS: Users speak conversationally in Roman Urdu. NEVER include conversational filler words, greetings, pronouns, day words, or verbs in the title:
   - FORBIDDEN in titles: "yr", "yrr", "yar", "yaar", "bhai", "bro", "aj", "aaj", "kal", "maine", "mainay", "mene", "kahyae", "khayi", "khaya", "khai", "piya", "peeya", "pee", "liya", "li", "diya", "di", "karaya", "dalwaya", "tha", "hai", "ka", "ki", "ke", "spent", "paid"

3. MULTI-ITEM SEPARATION FOR "KAY SATH" / "KE SATH" / "AUR" / "WITH":
   When the user mentions multiple items or accompaniments connected by "kay sath", "ke sath", "k sath", "ky sath", "sath", "with", "aur", "and", "plus" (for example: "mainay biryani kay sath coldrik pee hai", "biryani ke sath coldrink", "200 ki biryani kay sath coldrik", "burger aur fries"):
   You MUST ALWAYS extract EACH ITEM AS A COMPLETELY SEPARATE ELEMENT in the 'expenses' array:
   - Item 1: title: "Biryani", category: "Food & Drinks"
   - Item 2: title: "Cold Drink", category: "Food & Drinks"
   NEVER give both items the same title like "Biryani" or "Biryani Meal". If an item is a cold drink, its title MUST be "Cold Drink"!
   If individual prices are specified, assign them. If only one amount is mentioned (e.g., "200 ki biryani kay sath coldrik"), assign 200 to the first item and 0 to the accompanying drink item with missingAmount: true.

4. ACCURATE CATEGORY MAPPING:
   - Assign the most appropriate specific category from the Supported Categories list above.
   - Do NOT default to "Other" if the item clearly belongs to Food, Transport, Groceries, Bills, etc.`;

    const promptText = `Extract all expenses from the following transcript:
"${transcript}"`;

    const geminiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Short clean title of the expense item only' },
                  amount: { type: Type.NUMBER, description: `Numeric amount in ${currency}. 0 if missing` },
                  currency: { type: Type.STRING, description: `Always ${currency}` },
                  category: {
                    type: Type.STRING,
                    description: 'One of the supported categories',
                  },
                  expenseDate: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                  paymentMethod: { type: Type.STRING, description: 'Payment method if mentioned' },
                  notes: { type: Type.STRING, description: 'Relevant details or context' },
                  isFuturePlan: {
                    type: Type.BOOLEAN,
                    description: 'True if this is an intended future plan, false if already spent',
                  },
                  missingAmount: {
                    type: Type.BOOLEAN,
                    description: 'True if no amount was mentioned in the transcript',
                  },
                },
                required: ['title', 'amount', 'currency', 'category', 'expenseDate'],
              },
            },
          },
          required: ['expenses'],
        },
      },
    });

    // 10s timeout: if Gemini takes longer or is blocked, seamlessly fall back to local NLP parser immediately
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out after 10s')), 10000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    const rawJson = response.text ? response.text.trim() : '{}';
    let parsedData: { expenses?: any[] };
    try {
      parsedData = JSON.parse(rawJson);
    } catch (parseErr) {
      console.warn('Error parsing Gemini JSON response, utilizing Roman Urdu parser');
      const fallback = splitCombinedExpenses(
        parseRomanUrduExpenses(transcript, {
          todayStr: referenceDate,
          currency,
        }),
        referenceDate,
        currency
      );
      return res.json({ expenses: fallback, source: 'fallback_after_json_error' });
    }

    const items = (parsedData.expenses || []).map((item) => {
      // Pass through sanitizeExtractedItem to guarantee 100% removal of any residual "yr", "yrr", "kahyae"
      // and ensure proper category assignment
      return sanitizeExtractedItem(
        {
          ...item,
          originalTranscript: transcript,
        },
        referenceDate,
        currency
      );
    });

    const splitItems = splitCombinedExpenses(items, referenceDate, currency);

    if (splitItems.length === 0) {
      const fallback = splitCombinedExpenses(
        parseRomanUrduExpenses(transcript, {
          todayStr: referenceDate,
          currency,
        }),
        referenceDate,
        currency
      );
      return res.json({ expenses: fallback, source: 'fallback_empty' });
    }

    return res.json({ expenses: splitItems, source: 'gemini' });
  } catch (error: any) {
    // Fast graceful fallback ensures user never waits or sees errors
    const textToParse = req.body?.transcript || req.body?.text || '';
    const refDate = req.body?.localDate || req.body?.dateContext || new Date().toISOString().split('T')[0];
    const curr = req.body?.currency || 'PKR';
    const fallback = splitCombinedExpenses(
      parseRomanUrduExpenses(textToParse, {
        todayStr: refDate,
        currency: curr,
      }),
      refDate,
      curr
    );
    return res.json({
      expenses: fallback,
      source: 'roman_urdu_fallback_error',
      warning: error?.message,
    });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Kharcha AI',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  // Always serve public assets (manifest, icons, etc.)
  const publicPath = path.resolve(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In dev mode (or fallback), use Vite middleware with complete SPA HTML routing
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const suppressorScript = `<script>
(function() {
  const _origErr = console.error;
  console.error = function(...args) {
    if (args.some(arg => {
      const str = arg instanceof Error ? (arg.message + ' ' + (arg.stack || '')) : String(arg || '');
      return str.includes('WebSocket') || str.includes('websocket') || str.includes('vite:ws');
    })) {
      return;
    }
    _origErr.apply(console, args);
  };
  const _origWarn = console.warn;
  console.warn = function(...args) {
    if (args.some(arg => {
      const str = arg instanceof Error ? (arg.message + ' ' + (arg.stack || '')) : String(arg || '');
      return str.includes('WebSocket') || str.includes('websocket') || str.includes('vite:ws');
    })) {
      return;
    }
    _origWarn.apply(console, args);
  };
  window.addEventListener('unhandledrejection', function(e) {
    const reason = e.reason;
    const msg = reason instanceof Error ? (reason.message + ' ' + (reason.stack || '')) : String(reason || '');
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('closed without opened')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  window.addEventListener('error', function(e) {
    const msg = e.message || (e.error && e.error.message) || '';
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('closed without opened')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);
  if (typeof window !== 'undefined' && window.WebSocket) {
    const OriginalWebSocket = window.WebSocket;
    class SafeWebSocket extends EventTarget {
      static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
      CONNECTING = 0; OPEN = 1; CLOSING = 2; CLOSED = 3;
      readyState = 0; url = ''; protocol = ''; binaryType = 'blob'; bufferedAmount = 0; extensions = '';
      onopen = null; onclose = null; onerror = null; onmessage = null;
      constructor(url, protocols) {
        super();
        const urlStr = String(url || '');
        const isVite = urlStr.includes('token=') || protocols === 'vite-hmr' || protocols === 'vite-ping';
        if (isVite) {
          this.url = urlStr;
          this.protocol = typeof protocols === 'string' ? protocols : '';
          this.readyState = 1;
          setTimeout(() => {
            const ev = new Event('open');
            this.dispatchEvent(ev);
            if (typeof this.onopen === 'function') this.onopen(ev);
          }, 0);
        } else {
          return new OriginalWebSocket(url, protocols);
        }
      }
      send() {}
      close() {
        this.readyState = 3;
        const ev = new CloseEvent('close', { wasClean: true, code: 1000, reason: 'Normal Closure' });
        this.dispatchEvent(ev);
        if (typeof this.onclose === 'function') this.onclose(ev);
      }
    }
    window.WebSocket = SafeWebSocket;
  }
})();
</script>`;
        template = template.replace(/<head[^>]*>/i, (match) => `${match}\n${suppressorScript}`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kharcha AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Kharcha AI] Failed to start server:', err);
  process.exit(1);
});
