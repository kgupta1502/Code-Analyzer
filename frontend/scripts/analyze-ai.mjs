import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load env from .env at repo root or current folder
dotenv.config();

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('src');
const MAX_CHARS = Number(process.env.AI_MAX_CHARS_PER_CHUNK || 8000);
const INCLUDE_GLOBS = /(\.jsx?|\.tsx?)$/i;
const EXCLUDE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git']);

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      walk(full, out);
    } else if (e.isFile() && INCLUDE_GLOBS.test(full)) {
      out.push(full);
    }
  }
  return out;
}

function chunkText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

function readFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function summarizeIssues(analyses) {
  const agg = {
    files: analyses.length,
    totalIssues: 0,
    severityCount: { low: 0, medium: 0, high: 0 },
  };
  for (const a of analyses) {
    if (!a || !Array.isArray(a.issues)) continue;
    agg.totalIssues += a.issues.length;
    for (const i of a.issues) {
      const sev = (i.severity || 'medium').toLowerCase();
      if (agg.severityCount[sev] != null) agg.severityCount[sev]++;
    }
  }
  return agg;
}

async function analyzeChunk(client, code, filePath, chunkIndex, totalChunks) {
  const system = `You are a senior code reviewer. Analyze JavaScript/TypeScript/React code for bugs, code smells, complexity, and maintainability. Respond in strict JSON.`;
  const user = `File: ${filePath}\nChunk: ${chunkIndex + 1}/${totalChunks}\n\nPlease provide:\n- issues: array of { type: 'bug'|'complexity'|'smell'|'security'|'style', severity: 'low'|'medium'|'high', message: string, lineHint?: string }\n- summary: short string\n- recommended_actions: short array of strings\n\nCode:\n\n${code}`;

  const resp = await client.responses.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    input: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const text = resp?.output_text || '';
  try {
    const parsed = JSON.parse(text);
    parsed.issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    parsed.summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    parsed.recommended_actions = Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : [];
    return parsed;
  } catch {
    return { issues: [], summary: 'Non-JSON response', recommended_actions: [] };
  }
}

async function analyzeFile(client, filePath) {
  const content = readFile(filePath);
  if (!content) return null;
  const chunks = chunkText(content, MAX_CHARS);
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    const r = await analyzeChunk(client, chunks[i], filePath, i, chunks.length);
    results.push(r);
  }
  const issues = results.flatMap(r => r.issues || []);
  const summary = results.map(r => r.summary).filter(Boolean).join(' ');
  const recommended = Array.from(new Set(results.flatMap(r => r.recommended_actions || [])));
  return { file: filePath, issues, summary, recommended_actions: recommended };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Create .env with OPENAI_API_KEY=...');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`AI Code Analysis using model=${MODEL}`);
  console.log(`Scanning: ${ROOT}`);

  const files = walk(ROOT);
  if (!files.length) {
    console.log('No source files found.');
    return;
  }

  const analyses = [];
  for (const f of files) {
    console.log(`Analyzing: ${f}`);
    try {
      const res = await analyzeFile(client, f);
      if (res) analyses.push(res);
    } catch (e) {
      console.error(`Error analyzing ${f}:`, e?.message || e);
    }
  }

  const agg = summarizeIssues(analyses);
  console.log('\n=== Summary ===');
  console.log(JSON.stringify(agg, null, 2));

  console.log('\n=== Findings ===');
  for (const a of analyses) {
    console.log(`\n# ${a.file}`);
    if (!a.issues?.length) {
      console.log('No issues found');
      continue;
    }
    for (const i of a.issues) {
      console.log(`- [${i.severity?.toUpperCase()}] ${i.type}: ${i.message}${i.lineHint ? ` (hint: ${i.lineHint})` : ''}`);
    }
    if (a.recommended_actions?.length) {
      console.log('Recommended actions:');
      for (const r of a.recommended_actions) console.log(`  - ${r}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err?.message || err);
  process.exit(1);
});
