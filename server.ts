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

// Fallback rule-based parser in case Gemini API is temporarily unavailable
function fallbackParseTranscript(
  transcript: string,
  todayStr: string,
  targetCurrency: string = 'PKR'
): ExtractedExpenseItem[] {
  const text = transcript.toLowerCase();
  const results: ExtractedExpenseItem[] = [];

  // Split by common conjunctions
  const clauses = text.split(/\s*(?:,|aur|and|plus|phir|\+)\s*/i);

  for (const clause of clauses) {
    if (!clause.trim()) continue;

    // Detect amounts like "250", "Rs 500", "500 ka", "100 rupay", "$50", "AED 20"
    const amountMatch = clause.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    let amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    // Detect word numbers in Urdu/English if no digits found
    if (amount === 0) {
      if (/\b(sau|so|hundred)\b/i.test(clause)) {
        if (/\b(ek|one|1)\b/i.test(clause)) amount = 100;
        else if (/\b(do|two|2)\b/i.test(clause)) amount = 200;
        else if (/\b(teen|three|3)\b/i.test(clause)) amount = 300;
        else if (/\b(char|chaar|four|4)\b/i.test(clause)) amount = 400;
        else if (/\b(panch|paanch|five|5)\b/i.test(clause)) amount = 500;
        else amount = 100;
      } else if (/\b(hazar|hazaar|thousand)\b/i.test(clause)) {
        if (/\b(ek|one|1)\b/i.test(clause)) amount = 1000;
        else if (/\b(do|two|2)\b/i.test(clause)) amount = 2000;
        else if (/\b(teen|three|3)\b/i.test(clause)) amount = 3000;
        else if (/\b(panch|paanch|five|5)\b/i.test(clause)) amount = 5000;
        else if (/\b(dus|das|ten|10)\b/i.test(clause)) amount = 10000;
        else amount = 1000;
      } else if (/\b(pachas|fifty)\b/i.test(clause)) {
        amount = 50;
      } else if (/\b(bees|twenty)\b/i.test(clause)) {
        amount = 20;
      }
    }

    let category = 'Other';
    if (/biryani|burger|pizza|khana|khayi|khaya|lunch|dinner|chai|coffee|tea|nashta|food|drink|restaurant|shawarma|karahi|roll|samosa|bakery|juice|hotel|snack|mcdonalds|kfc/i.test(clause)) {
      category = 'Food & Drinks';
    } else if (/careem|uber|indrive|petrol|fuel|diesel|rikshaw|rickshaw|bus|metro|taxi|transport|ride|bykea|toll|parking|fare|cng/i.test(clause)) {
      category = 'Transport';
    } else if (/grocery|groceries|doodh|milk|dahi|sabzi|vegetable|fruit|atta|chawal|rice|oil|ghee|ration|supermarket|mart|eggs|anday|meat|gosht|chicken/i.test(clause)) {
      category = 'Groceries';
    } else if (/bijli|gas|water|electricity|bill|bills|wifi|internet|mobile load|recharge|easyload|ptcl|nayatel|utilities/i.test(clause)) {
      category = 'Bills & Utilities';
    } else if (/medicine|dawa|dawai|doctor|hospital|clinic|pharmacy|medical|dentist|test|checkup/i.test(clause)) {
      category = 'Health';
    } else if (/school|college|fees|fee|books|course|tuition|university|exam|academy|register/i.test(clause)) {
      category = 'Education';
    } else if (/kapray|clothes|shoes|joote|shopping|daraz|dress|shirt|pants|mall/i.test(clause)) {
      category = 'Shopping';
    } else if (/netflix|movie|cinema|game|gaming|concert|tickets/i.test(clause)) {
      category = 'Entertainment';
    } else if (/gym|salon|haircut|barber|facial|beauty|spa/i.test(clause)) {
      category = 'Personal Care';
    } else if (/rent|kiraya|flat rent|house rent/i.test(clause)) {
      category = 'Rent';
    } else if (/tour|trip|travel|flight|train|hotel stay/i.test(clause)) {
      category = 'Travel';
    }

    let date = todayStr;
    const isYesterday = /kal|yesterday|guzra kal/i.test(clause) && /tha|thi|the|li|diya|gaya|karaya/i.test(clause);
    if (isYesterday) {
      const d = new Date(todayStr);
      d.setDate(d.getDate() - 1);
      date = d.toISOString().split('T')[0];
    }

    const isFuturePlan = /karna hai|khana hai|jaunga|jaungi|dena hai|plan|will buy|tomorrow/i.test(clause) && !/tha|chuka|li/i.test(clause);

    let paymentMethod = 'Cash';
    if (/card|debit|credit/i.test(clause)) paymentMethod = 'Card';
    else if (/easypaisa/i.test(clause)) paymentMethod = 'EasyPaisa';
    else if (/jazzcash/i.test(clause)) paymentMethod = 'JazzCash';
    else if (/online|bank|transfer|nayapay|sadapay/i.test(clause)) paymentMethod = 'Bank Transfer';

    // Clean and extract title
    let title = clause
      .replace(/[.,!?;:]/g, '')
      .replace(/\b(aaj|kal|maine|mene|kiya|tha|thi|the|hai|rupya|rupay|rupees|rs|pkr|usd|aed|eur|inr|ka|ki|ke|ko|li|khayi|khaya|dalwaya|de|diya|chuka|karaya|kareed|khareedi|spent|paid)\b/gi, '')
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!title || title.length < 2) {
      title = category !== 'Other' ? category : 'Expense';
    } else {
      title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    results.push({
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      title,
      amount,
      currency: targetCurrency,
      category,
      expenseDate: date,
      paymentMethod,
      notes: clause.trim(),
      originalTranscript: transcript,
      createdAt: new Date().toISOString(),
      isFuturePlan,
      missingAmount: amount <= 0,
      clarificationNeeded: amount <= 0 ? 'Amount was not mentioned. Please specify how much was spent.' : undefined,
    });
  }

  return results;
}

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

    // If Gemini API key is missing, use intelligent fallback instantly
    if (!process.env.GEMINI_API_KEY) {
      const parsed = fallbackParseTranscript(transcript, referenceDate, currency);
      return res.json({ expenses: parsed, source: 'fallback_parser' });
    }

    const systemInstruction = `You are Kharcha AI, an expert financial expense extractor specialized in ${currency}, Roman Urdu, English, Urdu, and bilingual conversational speech.
Given a user's speech transcript or text description of their expenses, your job is to extract distinct expense items into a structured list.

Current Reference Context:
- Reference local date today is: "${referenceDate}"
- Reference Timezone: "${timezone}"
- Target currency: "${currency}"

Supported Categories:
- Food & Drinks
- Transport
- Groceries
- Shopping
- Bills & Utilities
- Education
- Health
- Entertainment
- Personal Care
- Rent
- Subscriptions
- Travel
- Other

Rules:
1. Extract EVERY distinct expense mentioned into an independent object.
2. Date Resolution: "Aaj" = "${referenceDate}", "Kal" with past tense = yesterday relative to "${referenceDate}".
3. Title should be concise in Title Case (e.g. "Biryani", "Careem Ride", "Petrol").
4. Currency must be "${currency}".`;

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
                  title: { type: Type.STRING, description: 'Short clean title of the expense' },
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

    // 2.5s timeout: if Gemini takes longer or is blocked, seamlessly fall back to local NLP parser immediately
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out after 2.5s')), 2500)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    const rawJson = response.text ? response.text.trim() : '{}';
    let parsedData: { expenses?: any[] };
    try {
      parsedData = JSON.parse(rawJson);
    } catch (parseErr) {
      console.warn('Error parsing Gemini JSON response, utilizing fallback parser');
      const fallback = fallbackParseTranscript(transcript, referenceDate, currency);
      return res.json({ expenses: fallback, source: 'fallback_after_json_error' });
    }

    const items: ExtractedExpenseItem[] = (parsedData.expenses || []).map((item, index) => {
      // Validate category
      const matchedCategory = VALID_CATEGORIES.find(
        (c) => c.toLowerCase() === (item.category || '').toLowerCase()
      ) || 'Other';

      return {
        id: 'exp_' + Date.now().toString(36) + '_' + index + '_' + Math.random().toString(36).substring(2, 6),
        title: item.title || 'Expense',
        amount: typeof item.amount === 'number' ? Math.max(0, item.amount) : 0,
        currency: currency,
        category: matchedCategory,
        expenseDate: item.expenseDate || referenceDate,
        paymentMethod: item.paymentMethod || 'Cash',
        notes: item.notes || '',
        originalTranscript: transcript,
        createdAt: new Date().toISOString(),
        isFuturePlan: !!item.isFuturePlan,
        missingAmount: !!item.missingAmount || item.amount <= 0,
      };
    });

    if (items.length === 0) {
      const fallback = fallbackParseTranscript(transcript, referenceDate, currency);
      return res.json({ expenses: fallback, source: 'fallback_empty' });
    }

    return res.json({ expenses: items, source: 'gemini' });
  } catch (error: any) {
    // Fast graceful fallback ensures user never waits or sees errors
    const textToParse = req.body?.transcript || req.body?.text || '';
    const refDate = req.body?.localDate || req.body?.dateContext || new Date().toISOString().split('T')[0];
    const curr = req.body?.currency || 'PKR';
    const fallback = fallbackParseTranscript(textToParse, refDate, curr);
    return res.json({
      expenses: fallback,
      source: 'fallback_error',
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
