import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load .env if present
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

if (!GEMINI_KEY) {
  // Don't throw at import time; let callers handle missing key. Log a warning.
  console.warn('Warning: GEMINI_API_KEY not set — Gemini analysis will fail until provided.');
}

// Only create the client when a key is present. Defer creation to runtime.
let genAI = null;
if (GEMINI_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
}

/**
 * Analyze code using OpenAI Responses API and return a parsed JSON object.
 * The model is instructed to return a strict JSON object with the following keys:
 *   timeComplexity, timeComplexityType, timeExplanation,
 *   spaceComplexity, spaceComplexityType, spaceExplanation,
 *   codeRating (1..5)
 */
export async function analyzeWithOpenAI(code, model = DEFAULT_MODEL) {
  if (!genAI) throw new Error('Missing GEMINI_API_KEY (or Gemini client not configured)');
  const system = `You are a concise code-complexity analyzer. Respond with a single valid JSON object and nothing else. Do NOT use markdown, do NOT wrap the JSON in backticks, and do NOT add any explanation before or after the JSON.`;
  const user = `Analyze the following code and return a JSON object with these fields:\n` +
    `- timeComplexity (string, e.g., 'O(log n)')\n` +
    `- timeComplexityType (one of: constant, logarithmic, linear, linearithmic, quadratic, exponential)\n` +
    `- timeExplanation (short, 1-2 sentences)\n` +
    `- spaceComplexity (string, e.g., 'O(1)')\n` +
    `- spaceComplexityType (same taxonomy as time)\n` +
    `- spaceExplanation (short)\n` +
    `- codeRating (integer 1..5)\n\n` +
    `Respond ONLY with valid JSON. Do not include any extra commentary, markdown, or backticks. The response MUST start with '{' and end with '}'.\n\nCode:\n\n${code}`;

  const modelId = model || DEFAULT_MODEL;
  const modelClient = genAI.getGenerativeModel({ model: modelId });

  const resp = await modelClient.generateContent([system, user]);
  const text = resp?.response?.text?.() ?? '';

  // First, try to parse the whole response as JSON
  try {
    return JSON.parse(text);
  } catch (err) {
    // If that fails, try to extract the first JSON object substring
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (inner) {
      // fall through to error object below
    }
    // Return an error-shaped object so callers can handle it gracefully
    return { error: 'Gemini returned non-JSON content', raw: text };
  }
}

export default analyzeWithOpenAI;
