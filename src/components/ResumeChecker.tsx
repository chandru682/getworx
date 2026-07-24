import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const ResumeChecker: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    gaps: string[];
    matches: string[];
    tips: string[];
  } | null>(null);

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;

    setAnalyzing(true);
    setResults(null);

    // Simulate analysis processing
    setTimeout(() => {
      setAnalyzing(false);
      setResults({
        score: 82,
        gaps: ['TailwindCSS', 'Redux Toolkit', 'System Design', 'CI/CD Pipelines'],
        matches: ['React', 'TypeScript', 'Node.js', 'Vite', 'REST APIs', 'Git'],
        tips: [
          "Format your bullet points with quantitative results (e.g., 'Improved load times by 20%').",
          "Ensure your contact details are at the top and readable by ATS machines.",
          "Add projects that showcase full-stack state management."
        ]
      });
    }, 1200);
  };

  return (
    <div className="widget-box">
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>ATS Resume Score Checker</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Evaluate your resume against top industry ATS (Applicant Tracking System) benchmarks.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label className="form-label">
          <span>Paste Resume Text (or cover letter)</span>
          <textarea
            className="widget-textarea"
            placeholder="Paste the text of your resume here to scan for keywords and formatting..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={analyzing}
          />
        </label>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={analyzing || !resumeText.trim()}
          >
            {analyzing ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin-fast 1s linear infinite' }} />
                <span>Scanning Resume...</span>
              </>
            ) : (
              'Scan for Gaps'
            )}
          </button>
          
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Supports copy-paste formatting. ATS scoring is immediate.
          </span>
        </div>
      </div>

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
          <div className="score-display-box">
            <div className="score-circle">
              {results.score}
            </div>
            <div>
              <h4 style={{ fontWeight: '600', fontSize: '16px' }}>ATS Match Rating: Good</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your resume ranks higher than 82% of developers in this category. Let's fix the remaining gaps.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Gaps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                <span>Identified Skill Gaps</span>
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.gaps.map(g => (
                  <span key={g} className="job-tag" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} />
                <span>Matching Keywords Found</span>
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.matches.map(m => (
                  <span key={m} className="job-tag" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Formatting Tips */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h5 style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '8px' }}>Formatting Recommendations:</h5>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-fast {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
