import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, FileText, MapPin, Clock,
  CheckCircle, AlertCircle, AlertTriangle,
  ChevronDown, ChevronUp, Upload, Save, Send,
  RefreshCw, Briefcase, DollarSign, Users,
  Shield, Sparkles, Globe, Star
} from 'lucide-react';
import { type Job, type ScreeningQuestion } from './JobCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name?: string;
  resume_url?: string;
  profile_completion_percentage?: number;
  current_role?: string;
}

export interface ApplyJobModalProps {
  job: Job;
  onClose: () => void;
  onApplySuccess: (jobId: string) => void;
}

type Phase = 'loading' | 'blocked' | 'form' | 'submitting' | 'success';

interface ModalState {
  phase: Phase;
  profileData: ProfileData | null;
  blockReason: string;
  warning: string;
}

type ModalAction =
  | { type: 'BLOCKED'; reason: string }
  | { type: 'READY'; profileData: ProfileData; warning: string }
  | { type: 'SUBMITTING' }
  | { type: 'FORM' }
  | { type: 'SUCCESS' };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'BLOCKED':   return { ...state, phase: 'blocked', blockReason: action.reason };
    case 'READY':     return { ...state, phase: 'form', profileData: action.profileData, warning: action.warning };
    case 'SUBMITTING':return { ...state, phase: 'submitting' };
    case 'FORM':      return { ...state, phase: 'form' };
    case 'SUCCESS':   return { ...state, phase: 'success' };
    default:          return state;
  }
}

// ─── ATS Score Ring ───────────────────────────────────────────────────────────

const ATSScoreRing = React.memo(({ score }: { score: number }) => {
  const r = 34, circ = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * circ;
  const color  = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label  = score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Needs Improvement';
  const bg     = score >= 80 ? 'rgba(16,185,129,0.08)' : score >= 60 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  const border = score >= 80 ? 'rgba(16,185,129,0.2)' : score >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '16px 20px', borderRadius: 14,
      background: bg, border: `1px solid ${border}`,
    }}>
      <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
        <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="6" />
          <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{score}%</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>ATS Profile Score</div>
        <div style={{ fontSize: 12, color, fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {score < 70 ? 'Complete your profile to improve visibility.' : 'Your profile is well-optimised for ATS screening.'}
        </div>
      </div>
    </div>
  );
});

// ─── Screening Input ──────────────────────────────────────────────────────────

const ScreeningInput = React.memo(({
  question, value, onChange, disabled,
}: {
  question: ScreeningQuestion;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  const base: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    fontSize: 14, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  const opts: string[] = (() => {
    try { return question.options_json ? JSON.parse(question.options_json) : []; }
    catch { return []; }
  })();

  const onFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--color-primary)';
    (e.target as HTMLElement).style.boxShadow  = '0 0 0 3px rgba(99,102,241,0.12)';
  }, []);
  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--border-color)';
    (e.target as HTMLElement).style.boxShadow  = 'none';
  }, []);

  switch (question.question_type) {
    case 'yes_no':
      return (
        <div style={{ display: 'flex', gap: 10 }}>
          {(['Yes', 'No'] as const).map(opt => (
            <button key={opt} type="button" disabled={disabled} onClick={() => onChange(opt)}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10,
                border: `1.5px solid ${value === opt ? 'var(--color-primary)' : 'var(--border-color)'}`,
                backgroundColor: value === opt ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                color: value === opt ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s',
              }}
            >{opt}</button>
          ))}
        </div>
      );
    case 'multiple_choice':
    case 'dropdown':
      return <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        onFocus={onFocus as any} onBlur={onBlur as any}
        style={{ ...base, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <option value="">Select an option...</option>
        {opts.map((o, i) => <option key={i} value={o}>{o}</option>)}
      </select>;
    case 'paragraph':
      return <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        placeholder="Write your detailed answer here..."
        onFocus={onFocus as any} onBlur={onBlur as any}
        style={{ ...base, resize: 'vertical', lineHeight: 1.6 }} />;
    case 'number':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        placeholder="Enter a number..." onFocus={onFocus as any} onBlur={onBlur as any} style={base} />;
    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        onFocus={onFocus as any} onBlur={onBlur as any} style={base} />;
    case 'file_upload': {
      const fileRef = useRef<HTMLInputElement>(null);
      return (
        <div onClick={() => !disabled && fileRef.current?.click()}
          style={{
            border: `1.5px dashed ${value ? 'var(--color-primary)' : 'var(--border-color)'}`,
            borderRadius: 10, padding: '20px', textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: value ? 'rgba(99,102,241,0.05)' : 'var(--bg-primary)',
            transition: 'all 0.18s',
          }}>
          <Upload size={20} style={{ color: value ? 'var(--color-primary)' : 'var(--text-muted)', marginBottom: 6 }} />
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {value ? `✓ ${value}` : 'Click to upload or drag & drop'}
          </div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => onChange(e.target.files?.[0]?.name || '')} />
        </div>
      );
    }
    default:
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        placeholder="Type your answer..." onFocus={onFocus as any} onBlur={onBlur as any} style={base} />;
  }
});

// ─── Main Full-Page Component ─────────────────────────────────────────────────

export const ApplyJobModal: React.FC<ApplyJobModalProps> = React.memo(({ job, onClose, onApplySuccess }) => {
  const [state, dispatch] = React.useReducer(modalReducer, {
    phase: 'loading', profileData: null, blockReason: '', warning: '',
  });
  const { phase, profileData, blockReason, warning } = state;

  const [coverOpen,    setCoverOpen]    = useState(false);
  const [coverLetter,  setCoverLetter]  = useState('');
  const [answers,      setAnswers]      = useState<Record<number, string>>({});
  const [confirmed,    setConfirmed]    = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const pageRef   = useRef<HTMLDivElement>(null);
  const draftKey  = `ats_draft_${job.id}`;
  const isFormActive = phase === 'form' || phase === 'submitting';

  // ── Mount: init answers, load draft, fetch profile ───────────────────────
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    // Slide-in page
    if (pageRef.current) {
      pageRef.current.style.animation = 'applypage-in 0.32s cubic-bezier(0.16,1,0.3,1) forwards';
    }

    const init: Record<number, string> = {};
    (job.screening_questions || []).forEach(q => { init[q.id] = ''; });

    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.coverLetter) { setCoverLetter(d.coverLetter); setCoverOpen(true); }
        setAnswers({ ...init, ...(d.answers || {}) });
      } else setAnswers(init);
    } catch { setAnswers(init); }

    const token = localStorage.getItem('getworxs_access_token');
    if (!token) {
      dispatch({ type: 'BLOCKED', reason: 'You must be logged in as a Candidate to apply.' });
      return;
    }

    fetch(`${API_URL}/api/v1/candidates/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if (data.success && data.data) {
          const pct = data.data.profile_completion_percentage ?? 0;
          if (!data.data.resume_url) {
            dispatch({ type: 'BLOCKED', reason: 'Please upload a resume to your profile before applying. Go to Profile → Resume.' });
          } else {
            dispatch({
              type: 'READY',
              profileData: data.data,
              warning: pct < 70 ? `Your profile is ${pct}% complete. We recommend 70%+ for better ATS visibility.` : '',
            });
          }
        } else {
          dispatch({ type: 'BLOCKED', reason: 'Candidate profile not found. Please complete your registration.' });
        }
      })
      .catch(() => dispatch({ type: 'BLOCKED', reason: 'Unable to verify your profile. Check your network connection.' }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleClose = useCallback(() => {
    if (pageRef.current) {
      pageRef.current.style.animation = 'applypage-out 0.22s ease forwards';
    }
    setTimeout(onClose, 230);
  }, [onClose]);

  const makeAnswerSetter = useCallback((qid: number) => (val: string) => {
    setAnswers(prev => prev[qid] === val ? prev : { ...prev, [qid]: val });
  }, []);

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem(draftKey, JSON.stringify({ coverLetter, answers }));
    setIsDraftSaved(true);
    setValidationMsg('Draft saved!');
    setTimeout(() => { setValidationMsg(''); setIsDraftSaved(false); }, 2500);
  }, [draftKey, coverLetter, answers]);

  const handleSubmit = useCallback(async () => {
    setValidationMsg('');
    for (const q of (job.screening_questions || []).filter(q => q.is_mandatory)) {
      if (!answers[q.id]?.trim()) {
        setValidationMsg(`Required: "${q.question_text}"`);
        return;
      }
    }
    if (!confirmed) { setValidationMsg('Please check the confirmation box before submitting.'); return; }

    const token = localStorage.getItem('getworxs_access_token');
    if (!token) { setValidationMsg('Session expired. Please log in again.'); return; }

    dispatch({ type: 'SUBMITTING' });

    const answersPayload = Object.entries(answers)
      .filter(([, v]) => v.trim())
      .map(([qid, v]) => ({ question_id: Number(qid), candidate_answer: v.trim() }));

    try {
      const res = await fetch(`${API_URL}/api/v1/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: Number(job.id), cover_letter: coverLetter.trim() || undefined, answers: answersPayload }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        localStorage.removeItem(draftKey);
        dispatch({ type: 'SUCCESS' });
        setTimeout(() => { onApplySuccess(job.id); onClose(); }, 2400);
      } else {
        dispatch({ type: 'FORM' });
        setValidationMsg(data?.message || data?.detail || 'Submission failed. Please try again.');
      }
    } catch {
      dispatch({ type: 'FORM' });
      setValidationMsg('Network error. Please try again.');
    }
  }, [job, answers, confirmed, coverLetter, draftKey, onApplySuccess, onClose]);

  const questions = React.useMemo(
    () => [...(job.screening_questions || [])].sort((a, b) => a.display_order - b.display_order),
    [job.screening_questions]
  );
  const skills   = React.useMemo(() => (job.tags || []).slice(0, 12), [job.tags]);
  const atsScore = profileData?.profile_completion_percentage ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes applypage-in  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes applypage-out { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(20px)} }
        @keyframes ats-success-pop { 0%{transform:scale(.4);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes ats-spin { to{transform:rotate(360deg)} }
        @keyframes ats-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .apply-page-form-section { background:var(--bg-card); border:1px solid var(--border-color); border-radius:18px; padding:24px; }
        .apply-page-label { font-size:11px; font-weight:700; color:var(--text-muted); letter-spacing:.08em; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .apply-page-btn-ghost:hover { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
        .apply-page-btn-draft:hover { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
        .apply-page-link:hover { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
        .apply-page-close:hover { background:rgba(239,68,68,0.08)!important; color:#ef4444!important; }
        .apply-page-body::-webkit-scrollbar { width:5px; }
        .apply-page-body::-webkit-scrollbar-track { background:transparent; }
        .apply-page-body::-webkit-scrollbar-thumb { background:var(--border-color); border-radius:10px; }
      `}</style>

      {/* ── Full-Page Overlay ─────────────────────────────────────────────── */}
      <div
        ref={pageRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          backgroundColor: 'var(--bg-primary)',
          display: 'flex', flexDirection: 'column',
          opacity: 0, // animation sets it to 1
        }}
      >
        {/* ══ TOP NAVBAR ════════════════════════════════════════════════════ */}
        <div style={{
          height: 60, flexShrink: 0,
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 16,
          background: 'var(--bg-card)',
          boxShadow: '0 1px 0 var(--border-color)',
        }}>
          {/* Back button */}
          <button
            className="apply-page-close"
            onClick={handleClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
              padding: '6px 12px', borderRadius: 10, transition: 'all 0.18s',
            }}
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />

          {/* Breadcrumb */}
          <div style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
              {job.title}
            </span>
            <span style={{ opacity: 0.4 }}>at</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
              {job.clientName}
            </span>
          </div>

          {/* Status pill */}
          {isFormActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {isDraftSaved && (
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={13} /> Draft saved
                </span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: 'rgba(16,185,129,0.1)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)', letterSpacing: '0.04em',
              }}>OPEN POSITION</span>
            </div>
          )}
        </div>

        {/* ══ PAGE BODY (two-column) ════════════════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', overflow: 'hidden',
          maxWidth: 1400, width: '100%', margin: '0 auto', alignSelf: 'stretch',
        }}>

          {/* ── LEFT COLUMN: Job Info (sticky) ── */}
          <div style={{
            width: 380, flexShrink: 0,
            borderRight: '1px solid var(--border-color)',
            overflowY: 'auto',
            padding: '32px 28px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {/* Company + title */}
            <div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 900,
                  boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                }}>
                  {(job.clientName || 'J').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{job.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{job.clientName}</div>
                </div>
              </div>

              {/* Location / posted */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <MapPin size={13} />, text: job.clientLocation },
                  { icon: <Globe size={13} />, text: job.workMode },
                  { icon: <Clock size={13} />, text: `Posted ${job.postedTime}` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-color)' }} />

            {/* Key details grid */}
            <div>
              <div className="apply-page-label">JOB DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: <DollarSign size={14} />, label: 'Salary', value: job.budget },
                  { icon: <Briefcase size={14} />, label: 'Type', value: job.jobType },
                  { icon: <Users size={14} />, label: 'Experience', value: job.experience === 0 ? 'Fresher' : `${job.experience}+ yrs` },
                  { icon: <Globe size={14} />, label: 'Mode', value: job.workMode },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg-neutral-light,#f8fafc)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, color: 'var(--color-primary)' }}>
                      {item.icon}
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{item.label.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <div className="apply-page-label">
                  <Star size={11} />SKILLS REQUIRED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skills.map((s, i) => (
                    <span key={i} style={{
                      padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: 'rgba(99,102,241,0.08)', color: '#6366f1',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
                <div className="apply-page-label">ABOUT THIS ROLE</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {job.description}
                </p>
              </div>
            )}

            {/* Step counter */}
            {isFormActive && (
              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'linear-gradient(135deg,rgba(99,102,241,0.08) 0%,rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>
                  <Sparkles size={11} style={{ display: 'inline', marginRight: 5 }} />
                  APPLICATION CHECKLIST
                </div>
                {[
                  { label: 'Resume verified', done: !!profileData?.resume_url },
                  { label: 'Cover letter', done: coverLetter.trim().length > 0, optional: true },
                  { label: `Screening questions (${questions.length})`, done: questions.every(q => !q.is_mandatory || answers[q.id]?.trim()), skip: questions.length === 0 },
                  { label: 'Confirmation', done: confirmed },
                ].filter(s => !s.skip).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${s.done ? '#10b981' : 'var(--border-color)'}`,
                      background: s.done ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.done && <CheckCircle size={11} style={{ color: '#fff' }} />}
                    </div>
                    <span style={{ flex: 1 }}>{s.label}</span>
                    {s.optional && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>optional</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Form ── */}
          <div
            className="apply-page-body"
            style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}
          >

            {/* ── Loading ── */}
            {phase === 'loading' && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)',
                  animation: 'ats-spin 0.75s linear infinite',
                  margin: '0 auto 18px',
                }} />
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>Verifying your candidate profile...</p>
              </div>
            )}

            {/* ── Blocked ── */}
            {phase === 'blocked' && (
              <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '2px solid rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertCircle size={32} style={{ color: '#ef4444' }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>Application Blocked</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>{blockReason}</div>
                <a href="/profile" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                  <Shield size={15} />Go to Profile
                </a>
              </div>
            )}

            {/* ── Success ── */}
            {phase === 'success' && (
              <div style={{ textAlign: 'center', padding: '80px 0', maxWidth: 500, margin: '0 auto' }}>
                <div style={{ animation: 'ats-success-pop 0.55s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%', margin: '0 auto 22px',
                    background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle size={48} style={{ color: '#10b981' }} />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Application Submitted!</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Your application for <strong>{job.title}</strong> at <strong>{job.clientName}</strong> has been received.
                  The hiring team will review your profile and get back to you.
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>Redirecting you back...</div>
              </div>
            )}

            {/* ── FORM ── */}
            {isFormActive && (
              <>
                {/* Page title */}
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    Complete Your Application
                  </h1>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                    Fill in the required details below. Fields marked <span style={{ color: '#ef4444' }}>*</span> are mandatory.
                  </p>
                </div>

                {/* Warning */}
                {warning && (
                  <div style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 12, padding: '14px 16px', fontSize: 14,
                  }}>
                    <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{warning}</span>
                  </div>
                )}

                {/* ─── SECTION: RESUME ─── */}
                <div className="apply-page-form-section">
                  <div className="apply-page-label"><FileText size={11} />RESUME &amp; ATS SCORE</div>
                  <ATSScoreRing score={atsScore} />
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)' }}>
                    <FileText size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                        {profileData?.name ? `${profileData.name}'s Resume` : 'Your Resume'}
                        <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>VERIFIED</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        This resume will be attached to your application
                        {profileData?.resume_url && <> · <a href={profileData.resume_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Preview ↗</a></>}
                      </div>
                    </div>
                    <a href="/profile" target="_blank" rel="noreferrer"
                      className="apply-page-link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, textDecoration: 'none', border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, flexShrink: 0, transition: 'all 0.18s' }}>
                      <RefreshCw size={13} />Change Resume
                    </a>
                  </div>
                </div>

                {/* ─── SECTION: COVER LETTER ─── */}
                <div className="apply-page-form-section">
                  <button type="button" onClick={() => setCoverOpen(p => !p)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: coverOpen ? 14 : 0 }}>
                    <div className="apply-page-label" style={{ margin: 0 }}>
                      COVER LETTER
                      <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-neutral-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500 }}>OPTIONAL</span>
                    </div>
                    {coverOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {coverOpen && (
                    <textarea rows={7} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} disabled={phase === 'submitting'}
                      placeholder={`Dear Hiring Manager at ${job.clientName},\n\nI am excited to apply for the ${job.title} position...`}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 12,
                        border: '1.5px solid var(--border-color)', background: 'var(--bg-neutral-light)',
                        fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', lineHeight: 1.7,
                        outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.18s, box-shadow 0.18s',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                    />
                  )}
                  {!coverOpen && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {coverLetter ? `${coverLetter.slice(0, 80)}...` : 'Click to expand and write a personalised cover letter.'}
                    </div>
                  )}
                </div>

                {/* ─── SECTION: SCREENING QUESTIONS ─── */}
                {questions.length > 0 && (
                  <div className="apply-page-form-section">
                    <div className="apply-page-label" style={{ marginBottom: 4 }}>SCREENING QUESTIONS</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px' }}>
                      {questions.filter(q => q.is_mandatory).length} required · {questions.length} total questions from the employer.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {questions.map((q, idx) => (
                        <div key={q.id} style={{ padding: '18px', borderRadius: 14, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                              background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
                              color: '#fff', fontSize: 12, fontWeight: 800,
                            }}>{idx + 1}</span>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                {q.question_text}
                                {q.is_mandatory && <span style={{ color: '#ef4444', marginLeft: 5 }}>*</span>}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ textTransform: 'capitalize' }}>{q.question_type.replace(/_/g, ' ')}</span>
                                {q.is_knockout && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>Knockout</span>}
                                {!q.is_mandatory && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Optional</span>}
                              </div>
                            </div>
                          </div>
                          <ScreeningInput question={q} value={answers[q.id] ?? ''} onChange={makeAnswerSetter(q.id)} disabled={phase === 'submitting'} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── SECTION: CONFIRMATION ─── */}
                <div className="apply-page-form-section">
                  <div className="apply-page-label">DECLARATION</div>
                  <label style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, cursor: phase === 'submitting' ? 'not-allowed' : 'pointer',
                    padding: '16px', borderRadius: 12,
                    background: confirmed ? 'rgba(16,185,129,0.06)' : 'var(--bg-neutral-light)',
                    border: `1.5px solid ${confirmed ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                      <input type="checkbox" checked={confirmed} disabled={phase === 'submitting'} onChange={e => setConfirmed(e.target.checked)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', margin: 0, width: 20, height: 20 }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${confirmed ? '#10b981' : 'var(--border-color)'}`, background: confirmed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        {confirmed && <CheckCircle size={13} style={{ color: '#fff' }} />}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      I confirm that all information provided in this application — including my resume, cover letter,
                      and responses to screening questions — is accurate, complete, and truthful to the best of my knowledge.
                    </span>
                  </label>
                </div>

                {/* Validation message */}
                {validationMsg && (
                  <div style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '12px 16px', borderRadius: 12, fontSize: 14,
                    background: isDraftSaved ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    color: isDraftSaved ? '#10b981' : '#ef4444',
                    border: `1px solid ${isDraftSaved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}>
                    {isDraftSaved ? <CheckCircle size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{validationMsg}</span>
                  </div>
                )}

                {/* Bottom padding spacer */}
                <div style={{ height: 20 }} />
              </>
            )}
          </div>
        </div>

        {/* ══ STICKY BOTTOM ACTION BAR ══════════════════════════════════════ */}
        {isFormActive && (
          <div style={{
            height: 68, flexShrink: 0,
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center',
            padding: '0 36px',
            justifyContent: 'space-between', gap: 16,
            boxShadow: '0 -1px 0 var(--border-color)',
          }}>
            {/* Left: Cancel */}
            <button className="apply-page-btn-ghost" onClick={handleClose}
              style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}>
              Cancel
            </button>

            {/* Right: Save Draft + Submit */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="apply-page-btn-draft" type="button" onClick={handleSaveDraft} disabled={phase === 'submitting'}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: phase === 'submitting' ? 'not-allowed' : 'pointer', opacity: phase === 'submitting' ? 0.55 : 1, transition: 'all 0.18s' }}>
                <Save size={15} />Save Draft
              </button>
              <button type="button" onClick={handleSubmit} disabled={phase === 'submitting'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 10, border: 'none',
                  background: phase === 'submitting'
                    ? 'rgba(99,102,241,0.65)'
                    : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: phase === 'submitting' ? 'not-allowed' : 'pointer',
                  boxShadow: phase === 'submitting' ? 'none' : '0 4px 16px rgba(99,102,241,0.45)',
                  transition: 'all 0.2s',
                }}>
                {phase === 'submitting' ? (
                  <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', animation: 'ats-spin 0.75s linear infinite' }} />Submitting...</>
                ) : (
                  <><Send size={15} />Submit Application</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default ApplyJobModal;
