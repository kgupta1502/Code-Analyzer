import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyze } from './analyzer.js';
import { analyzeWithOpenAI } from './ai-analyzer.js';

// load .env for OPENAI_API_KEY, etc.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai/analyze/complexity', (req, res) => {
  try {
    const { code = '', model } = req.body || {};
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'code is required' });
    }

    const resultObj = analyze(code, model);
    // Frontend expects { result: JSON.stringify(result) }
    return res.json({ result: JSON.stringify(resultObj) });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze the code.' });
  }
});

// OpenAI-backed analysis endpoint (returns structured JSON)
app.post('/api/ai/analyze/complexity/ai', async (req, res) => {
  try {
    const { code = '', model } = req.body || {};
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'code is required' });
    }
    try {
      const resultObj = await analyzeWithOpenAI(code, model);
      return res.json({ result: resultObj });
    } catch (err) {
      const message = err?.message || String(err);
      console.error('AI analyze error:', message);
      // Provide a safe, actionable message to the client (no stack traces).
      if (message.toLowerCase().includes('missing gemini_api_key')) {
        return res.status(500).json({ error: 'Missing GEMINI_API_KEY on the backend.' });
      }
      return res.status(500).json({ error: 'Failed to analyze with AI.', message });
    }
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze the code.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Code Analyzer backend listening on port ${PORT}`);
});
