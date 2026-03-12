import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Loading from './Loading.jsx';
import TimeComplexityChart from './ComplexityChart.jsx';

const supportedModels = [
  { id: 'openai/gpt-oss-120b', shortName: 'GPT-OSS 120B', label: 'Experimental' },
  { id: 'llama3-70b-8192', shortName: 'LLaMA 3 70B', label: 'Recommended' },
  { id: 'deepseek-r1-distill-llama-70b', shortName: 'DeepSeek 70B', label: 'Thinking' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', shortName: 'LLaMA 4 Scout 17B' },
  { id: 'llama-3.3-70b-versatile', shortName: 'LLaMA 3.3 70B' },
  { id: 'compound-beta', shortName: 'Compound Beta' },
];

export default function CodeAnalyzer() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const analysisRef = useRef(null);

  useEffect(() => {
    document.title = 'Code Analyzer';
    if (result || loading) {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result, loading]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      window.alert('Please paste your code before submitting.');
      return;
    }
    setLoading(true);
    try {
      const backendBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
      const url = backendBase
        ? `${backendBase}/api/ai/analyze/complexity/ai`
        : `/api/ai/analyze/complexity/ai`;
      const response = await axios.post(url, { code }, { withCredentials: true });
      setResult(null);
      const parsed = response.data.result;
      setResult(parsed);
    } catch (err) {
      console.error(err);
      window.scrollTo(0, 0);
      window.alert(err?.response?.data?.message || err?.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '100px 24px 60px',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    position: 'relative',
  };

  const headerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  };

  const titleBlock = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };

  const titleStyle = {
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: -0.02,
    margin: 0,
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 25%, #f472b6 50%, #fbbf24 75%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 80px rgba(96, 165, 250, 0.5)',
    filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.3))',
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: 400,
    lineHeight: 1.6,
  };

  const badge = {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #22c55e33',
    background: 'linear-gradient(135deg,#065f46,#052e16)',
    color: '#bbf7d0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  };

  const layout = {
    display: 'grid',
    gap: 20,
    alignItems: 'flex-start',
  };

  const editorCard = {
    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
    borderRadius: 20,
    border: '1px solid rgba(148, 163, 184, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
  };

  const editorHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    color: '#9ca3af',
  };

  const editorLabel = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    color: '#64748b',
  };

  const chipRow = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  };

  const chip = {
    fontSize: 10,
    borderRadius: 999,
    padding: '4px 8px',
    border: '1px solid #1f2937',
    background: '#020617',
    color: '#94a3b8',
  };

  const card = {
    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={container}>
      <div style={headerRow} className="ca-header-row">
        <div style={titleBlock}>
          <h1 style={titleStyle}>
            Code Analyzer
          </h1>
          <p style={subtitleStyle}>
            Paste any snippet and get AI-powered time & space complexity analysis with stunning visual comparisons.
          </p>
        </div>
      </div>

      <div style={layout} className="ca-layout">
        {/* Editor panel */}
        <div style={editorCard}>
          <div style={editorHeader}>
            <span style={editorLabel}>Input code</span>
            <div style={chipRow}>
              <span style={chip}>Supports C++ / Java / Python / JS / more</span>
              <span style={chip}>Tip: Keep it to a single function or class for best results</span>
            </div>
          </div>

          <textarea
            value={code}
            spellCheck="false"
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your C++/Python/JS/Rust/Java/any code here..."
            style={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              minHeight: '45vh',
              background: 'linear-gradient(145deg, #020617, #0f172a)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 16,
              color: '#e5e7eb',
              padding: 20,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Your code never leaves your machine except for analysis by the configured AI model.
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 'none',
                background: loading
                  ? 'linear-gradient(135deg, #64748b, #475569)'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: loading ? 'progress' : 'pointer',
                opacity: loading ? 0.8 : 1,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: loading 
                  ? '0 10px 25px rgba(100, 116, 139, 0.3)'
                  : '0 10px 25px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: loading ? 'none' : 'translateY(0)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div ref={analysisRef}>
          {(result || loading) && (
            <div style={card}>
            {loading ? (
              <Loading />
            ) : result?.error ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <h2 style={{ color: '#f87171', margin: 0 }}>Error Occurred</h2>
                <p style={{ color: '#d1d5db', textAlign: 'center' }}>{result.error || 'An unexpected error occurred while analyzing your code.'}</p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    textAlign: 'left',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginTop: 0,
                    marginBottom: 8,
                    letterSpacing: -0.02,
                  }}
                >
                  Code Complexity Analysis
                </h2>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
                  Advanced AI-powered analysis with visual performance comparisons. Treat as guidance, not formal proof.
                </p>

                <div style={{ display: 'grid', gap: 18 }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Time Complexity:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{ fontSize: 24, fontWeight: 800, color: '#a3e635' }}
                        dangerouslySetInnerHTML={{ __html: result.timeComplexity }}
                      />
                      <TimeComplexityChart
                        complexity={result.timeComplexity}
                        complexityType={result.timeComplexityType}
                        name={'Time Complexity'}
                      />
                    </div>
                    <p style={{ color: '#d1d5db', marginTop: 6 }}>{result.timeExplanation}</p>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Space Complexity:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}
                        dangerouslySetInnerHTML={{ __html: result.spaceComplexity }}
                      />
                      <TimeComplexityChart
                        complexity={result.spaceComplexity}
                        complexityType={result.spaceComplexityType}
                        name={'Space Complexity'}
                      />
                    </div>
                    <p style={{ color: '#d1d5db', marginTop: 6 }}>{result.spaceExplanation}</p>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Code Rating (out of 5):</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: Number(result.codeRating || 0) }).map((_, idx) => (
                        <span key={idx} style={{ color: '#facc15', fontSize: 22 }}>★</span>
                      ))}
                    </div>
                  </div>

          
                </div>
              </>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
