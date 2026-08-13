/**
 * ApplyJobPage — Dedicated full-page route: /candidate/jobs/:jobId/apply
 *
 * Enterprise ATS application flow (LinkedIn / Greenhouse / Workday / Lever style).
 * Completely independent of the Jobs listing. Zero background rendering.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Upload,
  Save,
  Send,
  RefreshCw,
  Briefcase,
  DollarSign,
  Users,
  Shield,
  Globe,
  Star,
  Sparkles,
  Loader2,
  Award,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScreeningQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options_json?: string;
  is_mandatory: boolean;
  is_knockout: boolean;
  preferred_answer?: string;
  display_order: number;
}

export interface JobDetail {
  id: string;
  title: string;
  clientName: string;
  clientLocation: string;
  budget: string;
  description: string;
  tags: string[];
  postedTime: string;
  workMode: string;
  category: string;
  experience: number;
  jobType: string;
  screening_questions: ScreeningQuestion[];
  // database fields
  summary?: string;
  about_company?: string;
  responsibilities?: string;
  required_skills?: string;
  preferred_skills?: string;
  benefits_json?: string;
  working_hours?: string;
  education?: string;
  experience_min?: number;
  experience_max?: number;
  openings?: number;
  priority?: string;
  hiring_manager_name?: string;
  hiring_manager_email?: string;
  internal_job_id?: string;
  visibility?: string;
  auto_close_date?: string;
  prevent_duplicates?: boolean;
  email_notifications?: string;
  // extras from API
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  department?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface ProfileData {
  name?: string;
  resume_url?: string;
  profile_completion_percentage?: number;
  current_role?: string;
}

// ─── Page state (single reducer = one render per transition) ─────────────────

type PagePhase =
  | 'loading_job'
  | 'loading_profile'
  | 'blocked'
  | 'form'
  | 'submitting'
  | 'success'
  | 'not_found';

interface PageState {
  phase: PagePhase;
  job: JobDetail | null;
  profileData: ProfileData | null;
  blockReason: string;
  warning: string;
  errorMsg: string;
}

type PageAction =
  | { type: 'JOB_LOADED'; job: JobDetail }
  | { type: 'JOB_NOT_FOUND' }
  | { type: 'PROFILE_BLOCKED'; reason: string }
  | { type: 'PROFILE_READY'; profileData: ProfileData; warning: string }
  | { type: 'SUBMITTING' }
  | { type: 'FORM' }
  | { type: 'SUCCESS' }
  | { type: 'SUBMIT_ERROR'; msg: string };

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'JOB_LOADED':
      return { ...state, phase: 'loading_profile', job: action.job };
    case 'JOB_NOT_FOUND':
      return { ...state, phase: 'not_found' };
    case 'PROFILE_BLOCKED':
      return { ...state, phase: 'blocked', blockReason: action.reason };
    case 'PROFILE_READY':
      return { ...state, phase: 'form', profileData: action.profileData, warning: action.warning };
    case 'SUBMITTING':
      return { ...state, phase: 'submitting', errorMsg: '' };
    case 'FORM':
      return { ...state, phase: 'form' };
    case 'SUCCESS':
      return { ...state, phase: 'success' };
    case 'SUBMIT_ERROR':
      return { ...state, phase: 'form', errorMsg: action.msg };
    default:
      return state;
  }
}

const initialPageState: PageState = {
  phase: 'loading_job',
  job: null,
  profileData: null,
  blockReason: '',
  warning: '',
  errorMsg: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapApiJobToDetail(j: any): JobDetail {
  const cur = j.salary_currency === 'INR' || !j.salary_currency ? '₹' : '$';
  const budgetStr = j.salary_min
    ? `${cur}${Number(j.salary_min).toLocaleString()} – ${cur}${j.salary_max ? Number(j.salary_max).toLocaleString() : ''}${j.salary_currency === 'INR' ? ' / yr' : ' USD'}`
    : 'Competitive Salary';

  return {
    id: String(j.id),
    title: j.title || 'Job Position',
    clientName: j.company?.name || j.about_company || j.company_name || 'Company',
    clientLocation: j.city ? `${j.city}, ${j.state || ''}, ${j.country || ''}`.replace(/, $/, '').replace(/, ,/, ',') : j.country || 'Location not specified',
    budget: budgetStr,
    description: j.summary || j.description || 'This is an exciting opportunity with a great organisation.',
    tags: j.skills_json
      ? typeof j.skills_json === 'string'
        ? (() => { try { return JSON.parse(j.skills_json); } catch { return []; } })()
        : j.skills_json
      : [],
    postedTime: j.created_at ? new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
    workMode: j.work_mode || 'Remote',
    category: j.department || j.category || 'Technology',
    experience: j.experience_min || 0,
    jobType: j.employment_type || j.job_type || 'Full Time',
    screening_questions: Array.isArray(j.screening_questions) ? j.screening_questions : [],
    
    // Detailed fields
    summary: j.summary || '',
    about_company: j.about_company || '',
    responsibilities: j.responsibilities || '',
    required_skills: j.required_skills || '',
    preferred_skills: j.preferred_skills || '',
    benefits_json: j.benefits_json || '[]',
    working_hours: j.working_hours || '',
    education: j.education || '',
    experience_min: j.experience_min || 0,
    experience_max: j.experience_max || 0,
    openings: j.openings || 1,
    priority: j.priority || 'Medium',
    hiring_manager_name: j.hiring_manager_name || '',
    hiring_manager_email: j.hiring_manager_email || '',
    internal_job_id: j.internal_job_id || '',
    visibility: j.visibility || 'Public',
    auto_close_date: j.auto_close_date || '',
    prevent_duplicates: j.prevent_duplicates ?? true,
    email_notifications: j.email_notifications || 'Instant',
    
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    salary_currency: j.salary_currency,
  };
}

// ─── ATS Score Ring ───────────────────────────────────────────────────────────

const ATSScoreRing = React.memo(({ score }: { score: number }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Needs Work';
  const bg = score >= 80 ? 'rgba(16,185,129,0.06)' : score >= 60 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)';
  const border = score >= 80 ? 'rgba(16,185,129,0.18)' : score >= 60 ? 'rgba(245,158,11,0.18)' : 'rgba(239,68,68,0.18)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 20px', borderRadius: 14, background: bg, border: `1px solid ${border}` }}>
      <div style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
        <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="6" />
          <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{score}%</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>ATS Profile Score</div>
        <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 240 }}>
          {score >= 80
            ? 'Your profile is highly optimised. Great chance of passing ATS screening.'
            : score >= 60
            ? 'Your profile looks good. Consider adding more skills to boost visibility.'
            : 'Complete your profile to significantly improve your ATS pass rate.'}
        </div>
      </div>
    </div>
  );
});

// ─── Screening Question Input ─────────────────────────────────────────────────

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
    padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    fontSize: 14, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
    opacity: disabled ? 0.65 : 1,
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  const opts: string[] = useMemo(() => {
    try { return question.options_json ? JSON.parse(question.options_json) : []; }
    catch { return []; }
  }, [question.options_json]);

  const onFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--color-primary)';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
  }, []);
  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    (e.target as HTMLElement).style.borderColor = 'var(--border-color)';
    (e.target as HTMLElement).style.boxShadow = 'none';
  }, []);

  switch (question.question_type) {
    case 'yes_no':
      return (
        <div style={{ display: 'flex', gap: 12 }}>
          {(['Yes', 'No'] as const).map(opt => (
            <button key={opt} type="button" disabled={disabled} onClick={() => onChange(opt)}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 10, fontWeight: 700, fontSize: 14,
                border: `1.5px solid ${value === opt ? 'var(--color-primary)' : 'var(--border-color)'}`,
                backgroundColor: value === opt ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                color: value === opt ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.18s',
              }}
            >{opt}</button>
          ))}
        </div>
      );
    case 'multiple_choice':
    case 'dropdown':
      return (
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          onFocus={onFocus as any} onBlur={onBlur as any}
          style={{ ...base, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <option value="">Select an option...</option>
          {opts.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
      );
    case 'paragraph':
      return (
        <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          placeholder="Write your detailed answer here..."
          onFocus={onFocus as any} onBlur={onBlur as any}
          style={{ ...base, resize: 'vertical', lineHeight: 1.65 }} />
      );
    case 'number':
      return (
        <input type="number" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          placeholder="Enter a number" onFocus={onFocus as any} onBlur={onBlur as any} style={base} />
      );
    case 'date':
      return (
        <input type="date" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          onFocus={onFocus as any} onBlur={onBlur as any} style={base} />
      );
    case 'file_upload': {
      const fileRef = useRef<HTMLInputElement>(null);
      return (
        <div onClick={() => !disabled && fileRef.current?.click()}
          style={{ border: `1.5px dashed ${value ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', background: value ? 'rgba(99,102,241,0.04)' : 'var(--bg-neutral-light,#f8fafc)', transition: 'all 0.18s' }}>
          <Upload size={20} style={{ color: value ? 'var(--color-primary)' : 'var(--text-muted)', marginBottom: 6 }} />
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{value ? `✓ ${value}` : 'Click to upload file or drag & drop'}</div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => onChange(e.target.files?.[0]?.name || '')} />
        </div>
      );
    }
    default:
      return (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          placeholder="Type your answer..." onFocus={onFocus as any} onBlur={onBlur as any} style={base} />
      );
  }
});

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ label: string; icon?: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode }> = ({ label, icon, badge, children }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 18, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}{label}
      </div>
      {badge}
    </div>
    {children}
  </div>
);

// ─── ApplyJobPage ─────────────────────────────────────────────────────────────

export default function ApplyJobPage() {
  const { jobId: routeJobId, slug } = useParams<{ jobId?: string; slug?: string }>();
  let jobId = routeJobId;
  if (slug) {
    const match = slug.match(/-(\d+)$/);
    jobId = match ? match[1] : slug;
  }
  const navigate = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(pageReducer, initialPageState);
  const { phase, job, profileData, blockReason, warning, errorMsg } = state;

  const getTokenRole = useCallback((): string | null => {
    try {
      const token = localStorage.getItem('getworxs_access_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.role || payload.user_role || '').toUpperCase();
    } catch { return null; }
  }, []);

  const parseJsonArray = (jsonStr: any): string[] => {
    if (!jsonStr) return [];
    if (Array.isArray(jsonStr)) return jsonStr;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  // Form state
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  const draftKey = `ats_draft_${jobId}`;
  const isForm = phase === 'form' || phase === 'submitting';

  // ── Step 1: Fetch job ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId) { dispatch({ type: 'JOB_NOT_FOUND' }); return; }
    document.title = 'Applying… | GetWorxs';

    const token = localStorage.getItem('getworxs_access_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/api/v1/jobs/${jobId}`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const raw = data.data || data;
        if (!raw || !raw.id) { dispatch({ type: 'JOB_NOT_FOUND' }); return; }
        const mapped = mapApiJobToDetail(raw);
        document.title = `Apply: ${mapped.title} at ${mapped.clientName} | GetWorxs`;
        dispatch({ type: 'JOB_LOADED', job: mapped });

        // Init answer slots from job's screening questions
        const init: Record<number, string> = {};
        (mapped.screening_questions || []).forEach(q => { init[q.id] = ''; });

        // Restore draft
        try {
          const saved = localStorage.getItem(draftKey);
          if (saved) {
            const d = JSON.parse(saved);
            if (d.coverLetter) { setCoverLetter(d.coverLetter); setCoverOpen(true); }
            setAnswers({ ...init, ...(d.answers || {}) });
          } else {
            setAnswers(init);
          }
        } catch { setAnswers(init); }
      })
      .catch(() => dispatch({ type: 'JOB_NOT_FOUND' }));
  }, [jobId]);

  // ── Step 2: Verify candidate profile (after job is loaded) ─────────────────
  useEffect(() => {
    if (phase !== 'loading_profile') return;

    const token = localStorage.getItem('getworxs_access_token');
    if (!token) {
      // If not logged in, proceed to form phase but let the form display the apply/login prompt in the right column
      dispatch({ type: 'PROFILE_READY', profileData: { id: 0, name: '', email: '', resume_url: '' } as any, warning: '' });
      return;
    }

    fetch(`${API_URL}/api/v1/candidates/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (data.success && data.data) {
          const pct = data.data.profile_completion_percentage ?? 0;
          if (!data.data.resume_url) {
            dispatch({ type: 'PROFILE_BLOCKED', reason: 'Please upload a resume to your profile before applying. Visit your Profile to add one.' });
          } else {
            dispatch({
              type: 'PROFILE_READY',
              profileData: data.data,
              warning: pct < 70 ? `Your profile is ${pct}% complete. Candidates with 70%+ profiles are 3× more likely to get shortlisted.` : '',
            });
          }
        } else {
          dispatch({ type: 'PROFILE_BLOCKED', reason: 'Candidate profile not found. Please complete your registration first.' });
        }
      })
      .catch(() => dispatch({ type: 'PROFILE_BLOCKED', reason: 'Could not verify your profile. Please check your connection.' }));
  }, [phase]);

  // ── Back navigation ─────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    // Go back to wherever the user came from (preserves browser history)
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, location.key]);

  // Escape key → go back
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleBack(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleBack]);

  // ── Draft ───────────────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(() => {
    localStorage.setItem(draftKey, JSON.stringify({ coverLetter, answers }));
    setDraftSaved(true);
    setValidationMsg('Draft saved!');
    setTimeout(() => { setDraftSaved(false); setValidationMsg(''); }, 2500);
  }, [draftKey, coverLetter, answers]);

  // ── Stable per-question setters ─────────────────────────────────────────────
  const makeAnswerSetter = useCallback((qid: number) => (val: string) => {
    setAnswers(prev => prev[qid] === val ? prev : { ...prev, [qid]: val });
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setValidationMsg('');
    if (!job) return;

    // Validate required questions
    for (const q of (job.screening_questions || []).filter(q => q.is_mandatory)) {
      if (!answers[q.id]?.trim()) {
        setValidationMsg(`Please answer the required question: "${q.question_text}"`);
        return;
      }
    }
    if (!confirmed) {
      setValidationMsg('Please check the declaration box before submitting.');
      return;
    }

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
        body: JSON.stringify({
          job_id: Number(job.id),
          cover_letter: coverLetter.trim() || undefined,
          answers: answersPayload,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        localStorage.removeItem(draftKey);
        dispatch({ type: 'SUCCESS' });
        setTimeout(() => navigate(-1), 2800);
      } else {
        dispatch({ type: 'SUBMIT_ERROR', msg: data?.message || data?.detail || 'Submission failed. Please try again.' });
        setValidationMsg(data?.message || data?.detail || 'Submission failed. Please try again.');
      }
    } catch {
      dispatch({ type: 'SUBMIT_ERROR', msg: 'Network error. Please check your connection.' });
      setValidationMsg('Network error. Please check your connection.');
    }
  }, [job, answers, confirmed, coverLetter, draftKey, navigate]);

  // ── Memoised derivations ────────────────────────────────────────────────────
  const questions = useMemo(
    () => [...(job?.screening_questions || [])].sort((a, b) => a.display_order - b.display_order),
    [job?.screening_questions]
  );
  const skills = useMemo(() => (job?.tags || []).slice(0, 12), [job?.tags]);
  const atsScore = profileData?.profile_completion_percentage ?? 0;

  // Checklist items
  const checklist = useMemo(() => {
    const items = [
      { label: 'Resume uploaded & verified', done: !!profileData?.resume_url },
      { label: 'Cover letter', done: coverLetter.trim().length > 0, optional: true },
    ];
    if (questions.length > 0) {
      const reqDone = questions.filter(q => q.is_mandatory).every(q => answers[q.id]?.trim());
      items.push({ label: `Screening questions (${questions.length})`, done: reqDone, optional: false });
    }
    items.push({ label: 'Declaration confirmed', done: confirmed, optional: false });
    return items;
  }, [profileData, coverLetter, questions, answers, confirmed]);

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
    @keyframes apj-in    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes apj-spin  { to{transform:rotate(360deg)} }
    @keyframes apj-pop   { 0%{transform:scale(.35);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    .apj-page            { animation:apj-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
    .apj-left::-webkit-scrollbar, .apj-right::-webkit-scrollbar { width:5px; }
    .apj-left::-webkit-scrollbar-track, .apj-right::-webkit-scrollbar-track { background:transparent; }
    .apj-left::-webkit-scrollbar-thumb, .apj-right::-webkit-scrollbar-thumb { background:var(--border-color); border-radius:10px; }
    .apj-back:hover      { color:var(--color-primary)!important; background:rgba(99,102,241,0.07)!important; }
    .apj-ghost:hover     { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
    .apj-draft:hover     { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
    .apj-resume-link:hover { border-color:var(--color-primary)!important; color:var(--color-primary)!important; }
    .apj-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(99,102,241,0.55)!important; }
  `;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      <div
        className="apj-page"
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          backgroundColor: 'var(--bg-primary)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'inherit',
        }}
      >
        {/* ══ TOP NAV ═══════════════════════════════════════════════════════ */}
        <nav style={{
          height: 58, flexShrink: 0,
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 1px 0 var(--border-color)',
        }}>
          {/* Back */}
          <button
            className="apj-back"
            onClick={handleBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
              padding: '6px 10px', borderRadius: 8, transition: 'all 0.18s',
            }}
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </button>

          <div style={{ width: 1, height: 22, background: 'var(--border-color)', flexShrink: 0 }} />

          {/* Breadcrumb */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Application for</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
              {job?.title ?? (phase === 'loading_job' ? '…' : 'Position')}
            </span>
            {job?.clientName && (
              <>
                <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>at</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{job.clientName}</span>
              </>
            )}
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {draftSaved && (
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} />Draft saved
              </span>
            )}
            {phase !== 'loading_job' && job && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 11px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.22)', letterSpacing: '0.04em' }}>
                OPEN
              </span>
            )}
          </div>
        </nav>

        {/* ══ LOADING JOB ════════════════════════════════════════════════════ */}
        {phase === 'loading_job' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <Loader2 size={40} style={{ color: 'var(--color-primary)', animation: 'apj-spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>Loading job details…</p>
          </div>
        )}

        {/* ══ LOADING PROFILE ════════════════════════════════════════════════ */}
        {phase === 'loading_profile' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <Loader2 size={40} style={{ color: 'var(--color-primary)', animation: 'apj-spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>Verifying your candidate profile…</p>
          </div>
        )}

        {/* ══ NOT FOUND ══════════════════════════════════════════════════════ */}
        {phase === 'not_found' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center', padding: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={32} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Job Not Found</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>This position may have been closed or the link is invalid.</div>
              <button onClick={handleBack} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                ← Browse Jobs
              </button>
            </div>
          </div>
        )}

        {/* ══ BLOCKED ════════════════════════════════════════════════════════ */}
        {phase === 'blocked' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center', padding: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.07)', border: '2px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={32} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Application Blocked</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 440, marginBottom: 24 }}>{blockReason}</div>
              <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 28px', borderRadius: 10, textDecoration: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(99,102,241,0.38)' }}>
                <Shield size={15} />Go to Profile
              </a>
            </div>
          </div>
        )}

        {/* ══ SUCCESS ════════════════════════════════════════════════════════ */}
        {phase === 'success' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0, textAlign: 'center', padding: 40 }}>
            <div style={{ animation: 'apj-pop 0.55s cubic-bezier(0.16,1,0.3,1) forwards', marginBottom: 24 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2.5px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <CheckCircle size={52} style={{ color: '#10b981' }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Application Submitted!</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 440 }}>
              Your application for <strong>{job?.title}</strong> at <strong>{job?.clientName}</strong> has been received.
              The hiring team will review your profile soon.
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Loader2 size={13} style={{ animation: 'apj-spin 0.8s linear infinite' }} />
              Returning to jobs…
            </div>
          </div>
        )}

        {/* ══ TWO-COLUMN FORM ════════════════════════════════════════════════ */}
        {isForm && job && (() => {
          const userRole = getTokenRole();
          const isEmployerOrAdmin = userRole && ['EMPLOYER', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);

          return (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1440, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>

              {/* ── LEFT: Complete Job Details (sticky/scrollable) ────────── */}
              <div
                className="apj-left"
                style={{ flex: 1.2, overflowY: 'auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24, borderRight: '1px solid var(--border-color)' }}
              >
                {/* Header Section */}
                <div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 900, boxShadow: '0 6px 20px rgba(99,102,241,0.32)' }}>
                      {job.clientName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.3, margin: '0 0 4px 0' }}>{job.title}</h1>
                      <div style={{ fontSize: 16, color: 'var(--color-primary)', fontWeight: 700 }}>{job.clientName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
                    {[
                      { icon: <MapPin size={14} />, text: job.clientLocation },
                      { icon: <Globe size={14} />, text: `${job.workMode} · ${job.jobType}` },
                      { icon: <Clock size={14} />, text: `Posted on ${job.postedTime}` },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{r.icon}</span>
                        <span>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                {/* Core Job Details Grid */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>CORE JOB DETAILS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                    {[
                      { icon: <DollarSign size={14} />, label: 'Salary Budget', value: job.budget },
                      { icon: <Briefcase size={14} />, label: 'Employment Type', value: job.jobType },
                      { icon: <Users size={14} />, label: 'Experience Required', value: job.experience === 0 ? 'Fresher (0 Yrs)' : `${job.experience_min} - ${job.experience_max} Yrs` },
                      { icon: <Globe size={14} />, label: 'Work Mode', value: job.workMode },
                    ].map(item => (
                      <div key={item.label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, color: 'var(--color-primary)' }}>
                          {item.icon}
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{item.label.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{item.value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Summary */}
                {job.summary && (
                  <Section label="Job Summary" icon={<Briefcase size={12} />}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{job.summary}</p>
                  </Section>
                )}

                {/* About Company */}
                {job.about_company && (
                  <Section label="About The Company" icon={<Globe size={12} />}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{job.about_company}</p>
                  </Section>
                )}

                {/* Responsibilities & Duties */}
                {job.responsibilities && (
                  <Section label="Responsibilities & Duties" icon={<CheckCircle size={12} />}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.responsibilities}</div>
                  </Section>
                )}

                {/* Required Skills */}
                {(job.required_skills || skills.length > 0) && (
                  <Section label="Required Skills & Competencies" icon={<Star size={12} />}>
                    {job.required_skills && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 12 }}>
                        {job.required_skills}
                      </div>
                    )}
                    {skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {skills.map((s, i) => (
                          <span key={i} style={{ padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.18)' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {/* Preferred Skills */}
                {job.preferred_skills && (
                  <Section label="Preferred / Nice-to-Have Skills" icon={<Sparkles size={12} />}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.preferred_skills}</div>
                  </Section>
                )}

                {/* Qualifications */}
                {job.education && (
                  <Section label="Qualifications & Education" icon={<Award size={12} />}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{job.education}</p>
                  </Section>
                )}

                {/* Benefits / Perks */}
                {job.benefits_json && parseJsonArray(job.benefits_json).length > 0 && (
                  <Section label="Benefits & Perks" icon={<Sparkles size={12} />}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {parseJsonArray(job.benefits_json).map((b, i) => (
                        <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Working Hours */}
                {job.working_hours && (
                  <Section label="Working Hours" icon={<Clock size={12} />}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{job.working_hours}</p>
                  </Section>
                )}

                {/* Advanced Options & Metadata */}
                <Section label="Job Metadata & Setup Details" icon={<Shield size={12} />}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                    {job.internal_job_id && <div><strong>Internal Job ID:</strong> {job.internal_job_id}</div>}
                    {job.openings !== undefined && <div><strong>Total Openings:</strong> {job.openings}</div>}
                    {job.priority && <div><strong>Priority level:</strong> {job.priority}</div>}
                    {job.visibility && <div><strong>Job Visibility:</strong> {job.visibility}</div>}
                    {job.hiring_manager_name && <div><strong>Hiring Manager:</strong> {job.hiring_manager_name}</div>}
                    {job.hiring_manager_email && <div><strong>Hiring Manager Email:</strong> {job.hiring_manager_email}</div>}
                    {job.email_notifications && <div><strong>Email Alerts:</strong> {job.email_notifications}</div>}
                    <div><strong>Duplicate Prevention:</strong> {job.prevent_duplicates ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </Section>

                {/* Application checklist (Only for candidates) */}
                {!isEmployerOrAdmin && (
                  <div style={{ padding: '18px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(99,102,241,0.07) 0%,rgba(139,92,246,0.04) 100%)', border: '1px solid rgba(99,102,241,0.18)' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Sparkles size={10} />APPLICATION CHECKLIST
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {checklist.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${item.done ? '#10b981' : 'rgba(148,163,184,0.4)'}`, background: item.done ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            {item.done && <CheckCircle size={11} style={{ color: '#fff' }} />}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
                          {item.optional && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>optional</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN: Candidate Form or Hiring Team Dashboard ─── */}
              <div
                className="apj-right"
                style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}
              >
                {isEmployerOrAdmin ? (
                  /* ── Recruiter/Employer Dashboard Panel ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 14, padding: '20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <Shield size={20} style={{ color: '#4F46E5', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 800, color: '#1E1B4B' }}>Hiring Team Portal View</h4>
                        <p style={{ margin: 0, fontSize: 13, color: '#4338CA', lineHeight: 1.55 }}>
                          You are viewing this job details page as an <strong>{userRole}</strong>. Below is a preview of the candidate screening setup and system parameters.
                        </p>
                      </div>
                    </div>

                    {/* Screening Questions Preview */}
                    <Section 
                      label="SCREENING QUESTIONS PREVIEW" 
                      badge={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{questions.length} Questions Set</span>}
                    >
                      {questions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {questions.map((q, idx) => (
                            <div key={q.id} style={{ padding: '16px', borderRadius: 12, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)' }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: '#4F46E5', color: '#fff', fontSize: 11, fontWeight: 800 }}>{idx + 1}</span>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {q.question_text}{q.is_mandatory && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                                  </div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                    Type: <span style={{ textTransform: 'capitalize' }}>{q.question_type.replace(/_/g, ' ')}</span>
                                    {q.is_knockout && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700 }}>Knockout Question</span>}
                                  </div>
                                </div>
                              </div>
                              <ScreeningInput question={q} value="" onChange={() => {}} disabled={true} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>No screening questions configured for this position.</p>
                      )}
                    </Section>

                    {/* Administrative Quick Summary */}
                    <Section label="SYSTEM METRICS" icon={<Clock size={12} />}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 800, marginBottom: 4 }}>TOTAL APPLICATIONS</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#1E293B' }}>{job.screening_questions?.length ? 'Pending Review' : '0 Applicants'}</div>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 800, marginBottom: 4 }}>JOB STATUS</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981', textTransform: 'uppercase' }}>Active</div>
                        </div>
                      </div>
                    </Section>

                    {/* Employer Portal actions */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <button 
                        onClick={() => navigate('/employer/dashboard')}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
                      >
                        Go to Employer Dashboard
                      </button>
                      <button 
                        onClick={handleBack}
                        style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : !localStorage.getItem('getworxs_access_token') ? (
                  /* ── Candidate Logged Out View ── */
                  <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 18, border: '1.5px solid var(--border-color)', textAlign: 'center', gap: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Interested in this role?</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>Log in as a Candidate to submit your application and resume directly to the hiring team.</p>
                    </div>
                    <button 
                      onClick={() => {
                        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                      }}
                      style={{
                        padding: '12px 32px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ) : (
                  /* ── Candidate Form View ── */
                  <>
                    <div>
                      <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                        Complete Your Application
                      </h1>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                        Fields marked <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span> are required. Your application is private and secure.
                      </p>
                    </div>

                    {warning && (
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 12, padding: '14px 16px' }}>
                        <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{warning}</span>
                      </div>
                    )}

                    {/* Resume section */}
                    <Section label="RESUME & ATS SCORE" icon={<FileText size={11} />}>
                      <ATSScoreRing score={atsScore} />
                      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 12 }}>
                        <FileText size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {profileData?.name ? `${profileData.name}'s Resume` : 'Your Resume'}
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>VERIFIED</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Will be attached to this application
                            {profileData?.resume_url && (
                              <> · <a href={profileData.resume_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Preview ↗</a></>
                            )}
                          </div>
                        </div>
                        <a href="/" className="apj-resume-link"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, textDecoration: 'none', border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, flexShrink: 0, transition: 'all 0.18s' }}>
                          <RefreshCw size={13} />Change
                        </a>
                      </div>
                    </Section>

                    {/* Cover Letter */}
                    <Section
                      label="COVER LETTER"
                      badge={<span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-neutral-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500 }}>OPTIONAL</span>}
                    >
                      <button type="button" onClick={() => setCoverOpen(p => !p)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', fontSize: 14, color: 'var(--text-secondary)' }}>
                        <span>{coverOpen ? 'Collapse cover letter' : coverLetter ? `${coverLetter.slice(0, 60)}…` : 'Expand to write a personalised cover letter'}</span>
                        {coverOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {coverOpen && (
                        <textarea rows={7} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                          disabled={phase === 'submitting'}
                          placeholder={`Dear Hiring Manager at ${job.clientName},\n\nI am excited to apply for the ${job.title} position…`}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border-color)', background: 'var(--bg-neutral-light,#f8fafc)', fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', lineHeight: 1.7, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                          onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                        />
                      )}
                    </Section>

                    {/* Screening Questions */}
                    {questions.length > 0 && (
                      <Section
                        label="SCREENING QUESTIONS"
                        badge={<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{questions.filter(q => q.is_mandatory).length} required · {questions.length} total</span>}
                      >
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>These questions were set by the employer for this specific role.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {questions.map((q, idx) => (
                            <div key={q.id} style={{ padding: '18px', borderRadius: 14, background: 'var(--bg-neutral-light,#f8fafc)', border: '1px solid var(--border-color)' }}>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 12, fontWeight: 800 }}>{idx + 1}</span>
                                <div>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                    {q.question_text}{q.is_mandatory && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{q.question_type.replace(/_/g, ' ')}</span>
                                    {q.is_knockout && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>Knockout</span>}
                                    {!q.is_mandatory && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional</span>}
                                  </div>
                                </div>
                              </div>
                              <ScreeningInput
                                question={q}
                                value={answers[q.id] ?? ''}
                                onChange={makeAnswerSetter(q.id)}
                                disabled={phase === 'submitting'}
                              />
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {/* Declaration */}
                    <Section label="DECLARATION" icon={<Shield size={11} />}>
                      <label style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, cursor: phase === 'submitting' ? 'not-allowed' : 'pointer',
                        padding: '18px', borderRadius: 13,
                        background: confirmed ? 'rgba(16,185,129,0.05)' : 'var(--bg-neutral-light,#f8fafc)',
                        border: `1.5px solid ${confirmed ? 'rgba(16,185,129,0.28)' : 'var(--border-color)'}`,
                        transition: 'all 0.22s',
                      }}>
                        <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                          <input type="checkbox" checked={confirmed} disabled={phase === 'submitting'} onChange={e => setConfirmed(e.target.checked)}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', margin: 0, width: 22, height: 22 }} />
                          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2.5px solid ${confirmed ? '#10b981' : 'rgba(148,163,184,0.5)'}`, background: confirmed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.22s' }}>
                            {confirmed && <CheckCircle size={14} style={{ color: '#fff' }} />}
                          </div>
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          I confirm that all information provided in this application — including my resume, cover letter,
                          and responses to any screening questions — is <strong>accurate, complete, and truthful</strong> to the best of my knowledge.
                        </span>
                      </label>
                    </Section>

                    {/* Validation / feedback */}
                    {(validationMsg || errorMsg) && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '13px 16px', borderRadius: 12, fontSize: 14, background: draftSaved ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: draftSaved ? '#10b981' : '#ef4444', border: `1px solid ${draftSaved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                        {draftSaved ? <CheckCircle size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                        <span>{validationMsg || errorMsg}</span>
                      </div>
                    )}

                    {/* Bottom spacer */}
                    <div style={{ height: 24 }} />
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* ══ STICKY ACTION BAR ══════════════════════════════════════════════ */}
        {isForm && job && localStorage.getItem('getworxs_access_token') && !['EMPLOYER', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'].includes(getTokenRole() || '') && (
          <div style={{
            height: 66, flexShrink: 0,
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', padding: '0 36px',
            justifyContent: 'space-between', gap: 12,
          }}>
            <button className="apj-ghost" onClick={handleBack}
              style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}>
              Cancel
            </button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="apj-draft" type="button" onClick={handleSaveDraft} disabled={phase === 'submitting'}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: phase === 'submitting' ? 'not-allowed' : 'pointer', opacity: phase === 'submitting' ? 0.5 : 1, transition: 'all 0.18s' }}>
                <Save size={15} />Save Draft
              </button>
              <button
                className="apj-submit"
                type="button"
                onClick={handleSubmit}
                disabled={phase === 'submitting'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 10, border: 'none',
                  background: phase === 'submitting' ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: phase === 'submitting' ? 'not-allowed' : 'pointer',
                  boxShadow: phase === 'submitting' ? 'none' : '0 4px 16px rgba(99,102,241,0.42)',
                  transition: 'all 0.22s',
                }}
              >
                {phase === 'submitting'
                  ? <><Loader2 size={15} style={{ animation: 'apj-spin 0.75s linear infinite' }} />Submitting…</>
                  : <><Send size={15} />Submit Application</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
