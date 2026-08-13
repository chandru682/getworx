import React, { useState, useEffect } from 'react';
import './TalentSearchTab.css';

interface MatchTag {
  label: string;
  type: string;
}

interface ParsedJD {
  extracted_title: string;
  extracted_skills: string[];
  extracted_min_experience: number;
  extracted_location?: string;
}

export interface CandidateCard {
  id: number;
  user_id: number;
  name: string;
  masked_name: string;
  email?: string | null;
  phone?: string | null;
  masked_email: string;
  masked_phone: string;
  photo_url?: string | null;
  current_role?: string | null;
  total_experience?: string | null;
  experience_years: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  location_display: string;
  expected_salary?: string | null;
  highest_qualification?: string | null;
  university?: string | null;
  graduation_year?: string | null;
  notice_period?: string | null;
  skills: string[];
  has_resume: boolean;
  resume_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  ai_match_score: number;
  match_tags: MatchTag[];
  is_saved: boolean;
  is_unlocked: boolean;
  profile_completion_percentage: number;
  boolean_match_keywords?: string[];
}

export const TalentSearchTab: React.FC = () => {
  const [mode, setMode] = useState<'filter' | 'ai_jd' | 'saved'>('filter');
  const [candidates, setCandidates] = useState<CandidateCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [remainingUnlocks, setRemainingUnlocks] = useState<number>(500);

  // Filters
  const [query, setQuery] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [skillInput, setSkillInput] = useState<string>('');
  const [minExp, setMinExp] = useState<string>('');
  const [maxExp, setMaxExp] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [noticePeriod, setNoticePeriod] = useState<string>('');

  // AI JD Matcher
  const [jdText, setJdText] = useState<string>('');
  const [parsedJd, setParsedJd] = useState<ParsedJD | null>(null);
  const [isMatchingJd, setIsMatchingJd] = useState<boolean>(false);

  // Modal Detail
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const getAuthHeader = () => {
    const token = localStorage.getItem('getworxs_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchTalentPool = async () => {
    setLoading(true);
    try {
      if (mode === 'saved') {
        const res = await fetch(`${API_URL}/api/v1/talent/saved`, { headers: getAuthHeader() });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCandidates(data.data);
          setTotal(data.data.length);
        }
      } else {
        const skills = skillInput ? skillInput.split(',').map(s => s.trim()).filter(Boolean) : undefined;
        const bodyPayload = {
          query: query || undefined,
          role: role || undefined,
          skills: skills,
          min_experience: minExp ? parseInt(minExp, 10) : undefined,
          max_experience: maxExp ? parseInt(maxExp, 10) : undefined,
          location: location || undefined,
          education: education || undefined,
          notice_period: noticePeriod || undefined,
          page: 1,
          limit: 30,
        };

        const res = await fetch(`${API_URL}/api/v1/talent/search`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCandidates(data.data.items || []);
          setTotal(data.data.total || 0);
          if (data.data.remaining_unlocks !== undefined) {
            setRemainingUnlocks(data.data.remaining_unlocks);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching talent pool:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalentPool();
  }, [mode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTalentPool();
  };

  const handleResetFilters = () => {
    setQuery('');
    setRole('');
    setSkillInput('');
    setMinExp('');
    setMaxExp('');
    setLocation('');
    setEducation('');
    setNoticePeriod('');
    fetchTalentPool();
  };

  const handleJdMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) {
      alert('Please paste or type a Job Description first.');
      return;
    }
    setIsMatchingJd(true);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/talent/match-jd`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ jd_text: jdText, limit: 30 }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(data.data.items || []);
        setTotal(data.data.total || 0);
        setParsedJd(data.data.parsed_jd || null);
        if (data.data.remaining_unlocks !== undefined) {
          setRemainingUnlocks(data.data.remaining_unlocks);
        }
      }
    } catch (err) {
      console.error('Error matching JD:', err);
    } finally {
      setIsMatchingJd(false);
      setLoading(false);
    }
  };

  const handleToggleSave = async (cand: CandidateCard) => {
    try {
      if (cand.is_saved) {
        await fetch(`${API_URL}/api/v1/talent/save/${cand.id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
      } else {
        await fetch(`${API_URL}/api/v1/talent/save`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ candidate_id: cand.id }),
        });
      }
      setCandidates(prev =>
        prev.map(c => (c.id === cand.id ? { ...c, is_saved: !c.is_saved } : c))
      );
      if (selectedCandidate && selectedCandidate.id === cand.id) {
        setSelectedCandidate(prev => (prev ? { ...prev, is_saved: !prev.is_saved } : null));
      }
    } catch (err) {
      console.error('Error toggling save candidate:', err);
    }
  };

  const handleUnlockProfile = async (cand: CandidateCard) => {
    if (cand.is_unlocked) return;
    if (!window.confirm(`Unlock full contact info and resume for ${cand.masked_name}? (1 unlock credit will be used)`)) {
      return;
    }
    setIsUnlocking(cand.id);
    try {
      const res = await fetch(`${API_URL}/api/v1/talent/unlock`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ candidate_id: cand.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const unlockedCard = data.data as CandidateCard;
        setCandidates(prev => prev.map(c => (c.id === cand.id ? unlockedCard : c)));
        setSelectedCandidate(unlockedCard);
        setRemainingUnlocks(prev => Math.max(0, prev - 1));
      } else {
        alert(data.message || 'Failed to unlock profile.');
      }
    } catch (err) {
      console.error('Error unlocking candidate profile:', err);
    } finally {
      setIsUnlocking(null);
    }
  };

  const highlightText = (text: string, keywords: string[]) => {
    if (!text || !keywords || keywords.length === 0) return <span>{text}</span>;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sortedKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).filter(Boolean);
    if (escaped.length === 0) return <span>{text}</span>;
    
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = sortedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <mark key={i} style={{ backgroundColor: '#FEF08A', color: '#854D0E', padding: '1px 3px', borderRadius: '4px', fontWeight: 'bold' }}>
              {part}
            </mark>
          ) : (
            part
          );
        })}
      </span>
    );
  };


  const getRequirements = () => {
    if (parsedJd) {
      return {
        title: parsedJd.extracted_title,
        skills: parsedJd.extracted_skills || [],
        minExp: parsedJd.extracted_min_experience || 0,
        location: parsedJd.extracted_location || 'India'
      };
    }
    if (mode === 'filter') {
      return {
        title: role || '',
        skills: skillInput ? skillInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        minExp: minExp ? parseInt(minExp, 10) : 0,
        location: location || ''
      };
    }
    return null;
  };

  const analyzeMatches = (candidate: CandidateCard) => {
    const req = getRequirements();
    if (!req) return null;

    const candSkills = (candidate.skills || []).map(s => s.toLowerCase());
    const reqSkills = (req.skills || []).map(s => s.toLowerCase());

    // Role Match
    let roleStatus: 'strong' | 'partial' | 'missing' = 'missing';
    const reqRoleLower = req.title.toLowerCase();
    const candRoleLower = (candidate.current_role || '').toLowerCase();
    if (reqRoleLower && candRoleLower) {
      if (reqRoleLower.includes(candRoleLower) || candRoleLower.includes(reqRoleLower)) {
        roleStatus = 'strong';
      } else {
        const reqWords = reqRoleLower.split(/\s+/);
        const candWords = candRoleLower.split(/\s+/);
        const wordIntersection = reqWords.filter(w => w.length > 2 && candWords.includes(w));
        if (wordIntersection.length > 0) {
          roleStatus = 'partial';
        }
      }
    } else if (!req.title) {
      roleStatus = 'strong'; // Default/neutral
    }

    // Experience Match
    let expStatus: 'strong' | 'partial' | 'missing' = 'missing';
    const candExp = candidate.experience_years;
    if (req.minExp !== undefined && req.minExp > 0) {
      if (candExp >= req.minExp) {
        expStatus = 'strong';
      } else if (candExp >= req.minExp - 1.5) {
        expStatus = 'partial';
      }
    } else {
      expStatus = 'strong'; // Default/neutral
    }

    // Location Match
    let locStatus: 'strong' | 'partial' | 'missing' = 'missing';
    const reqLocLower = req.location.toLowerCase();
    const candLocLower = (candidate.location_display || '').toLowerCase();
    if (reqLocLower && candLocLower) {
      if (candLocLower.includes(reqLocLower) || reqLocLower.includes(candLocLower)) {
        locStatus = 'strong';
      } else {
        const reqParts = reqLocLower.split(/[\s,]+/);
        const candParts = candLocLower.split(/[\s,]+/);
        const partIntersection = reqParts.filter(p => p.length > 2 && candParts.includes(p));
        if (partIntersection.length > 0) {
          locStatus = 'partial';
        }
      }
    } else if (!req.location) {
      locStatus = 'strong'; // Default/neutral
    }

    // Skills matching lists
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    req.skills.forEach(s => {
      if (candSkills.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))) {
        matchedSkills.push(s);
      } else {
        missingSkills.push(s);
      }
    });

    const candidateMatchedSkills = candidate.skills.filter(cs => 
      reqSkills.some(rs => cs.toLowerCase().includes(rs) || rs.includes(cs.toLowerCase()))
    );
    const candidateOtherSkills = candidate.skills.filter(cs => !candidateMatchedSkills.includes(cs));

    // Dynamic reasons why candidate matches
    const reasons: { text: string; type: 'match' | 'warning' | 'missing' }[] = [];
    if (roleStatus === 'strong') {
      reasons.push({ text: `Target role title alignment is strong: Candidate's role is "${candidate.current_role}".`, type: 'match' });
    } else if (roleStatus === 'partial') {
      reasons.push({ text: `Candidate's experience as "${candidate.current_role}" is a partial match for target title.`, type: 'warning' });
    } else if (req.title) {
      reasons.push({ text: `Current role "${candidate.current_role}" does not match target title "${req.title}".`, type: 'missing' });
    }

    if (expStatus === 'strong') {
      reasons.push({ text: `Experience of ${candidate.total_experience} meets or exceeds required (${req.minExp} Yrs).`, type: 'match' });
    } else if (expStatus === 'partial') {
      reasons.push({ text: `Experience of ${candidate.total_experience} is close to preferred (${req.minExp} Yrs).`, type: 'warning' });
    } else if (req.minExp > 0) {
      reasons.push({ text: `Experience of ${candidate.total_experience} is below the preferred ${req.minExp} Yrs.`, type: 'missing' });
    }

    if (matchedSkills.length > 0) {
      reasons.push({ text: `Matches ${matchedSkills.length} key required technical skills: ${matchedSkills.join(', ')}.`, type: 'match' });
    }
    if (missingSkills.length > 0) {
      reasons.push({ text: `Missing required technical skills: ${missingSkills.join(', ')}.`, type: 'missing' });
    }

    if (locStatus === 'strong') {
      reasons.push({ text: `Candidate location (${candidate.location_display}) aligns with required job locations.`, type: 'match' });
    } else if (locStatus === 'partial') {
      reasons.push({ text: `Candidate resides in ${candidate.location_display}, which is a partial geographical match.`, type: 'warning' });
    } else if (req.location) {
      reasons.push({ text: `Location mismatch: Located in ${candidate.location_display} (Target: ${req.location}).`, type: 'missing' });
    }

    // Overall Match Score
    let score = candidate.ai_match_score;
    if (mode === 'filter') {
      let calculatedScore = 50;
      if (roleStatus === 'strong') calculatedScore += 15;
      else if (roleStatus === 'partial') calculatedScore += 8;

      if (expStatus === 'strong') calculatedScore += 15;
      else if (expStatus === 'partial') calculatedScore += 8;

      if (locStatus === 'strong') calculatedScore += 10;
      else if (locStatus === 'partial') calculatedScore += 5;

      const skillMatchRatio = req.skills.length > 0 ? (matchedSkills.length / req.skills.length) : 1;
      calculatedScore += Math.round(skillMatchRatio * 10);
      score = Math.min(99, calculatedScore + 10);
    }

    return {
      roleStatus,
      expStatus,
      locStatus,
      matchedSkills,
      missingSkills,
      candidateMatchedSkills,
      candidateOtherSkills,
      reasons,
      score,
      reqTitle: req.title,
      reqMinExp: req.minExp,
      reqLocation: req.location
    };
  };


  return (
    <div className="ts-container">
      {/* Header Banner */}
      <div className="ts-header-card">
        <div>
          <h2 className="ts-header-title">⚡ Global Verified Talent Search</h2>
          <div className="ts-header-subtitle">
            Search 50+ verified candidates across GetWorxs, score using AI JD Matcher, and unlock profiles.
          </div>
        </div>
        <div className="ts-stats-group">
          <div className="ts-stat-badge">
            <span>👥 Pool:</span> <strong>{total} Candidates</strong>
          </div>
          <div className="ts-stat-badge">
            <span>🔓 Unlocks Remaining:</span> <strong>{remainingUnlocks}</strong>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="ts-mode-bar">
        <button
          className={`ts-mode-btn ${mode === 'filter' ? 'active' : ''}`}
          onClick={() => setMode('filter')}
        >
          🔍 Multi-Criteria Search
        </button>
        <button
          className={`ts-mode-btn ${mode === 'ai_jd' ? 'active' : ''}`}
          onClick={() => setMode('ai_jd')}
        >
          🤖 AI JD Matcher
        </button>
        <button
          className={`ts-mode-btn ${mode === 'saved' ? 'active' : ''}`}
          onClick={() => setMode('saved')}
        >
          🔖 Saved Candidates
        </button>
      </div>

      {/* Filter Mode Box */}
      {mode === 'filter' && (
        <form className="ts-filter-card" onSubmit={handleSearchSubmit}>
          <div className="ts-filter-grid">
            <div className="ts-filter-group">
              <label className="ts-label">Keywords / Search</label>
              <input
                className="ts-input"
                type="text"
                placeholder="Name, role, skill, university..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Job Title / Role</label>
              <input
                className="ts-input"
                type="text"
                placeholder="e.g. Full Stack Developer"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Skills (comma separated)</label>
              <input
                className="ts-input"
                type="text"
                placeholder="Python, React, MySQL..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Min Exp (Yrs)</label>
              <input
                className="ts-input"
                type="number"
                min="0"
                max="30"
                placeholder="Min 0"
                value={minExp}
                onChange={e => setMinExp(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Max Exp (Yrs)</label>
              <input
                className="ts-input"
                type="number"
                min="0"
                max="30"
                placeholder="Max 20"
                value={maxExp}
                onChange={e => setMaxExp(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Location</label>
              <input
                className="ts-input"
                type="text"
                placeholder="City, State, or Country"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="ts-filter-group">
              <label className="ts-label">Notice Period</label>
              <select
                className="ts-select"
                value={noticePeriod}
                onChange={e => setNoticePeriod(e.target.value)}
              >
                <option value="">All Notice Periods</option>
                <option value="Immediate">Immediate / 15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 12px 4px', fontSize: '12px', color: '#64748B' }}>
            <span style={{ fontWeight: 'bold', color: '#475569' }}>💡 Boolean Search Examples:</span>
            <span 
              onClick={() => setQuery('Java AND ("Spring Boot" OR Microservices) NOT Fresher')}
              style={{ color: '#4F46E5', textDecoration: 'underline', cursor: 'pointer', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}
            >
              Java AND ("Spring Boot" OR Microservices) NOT Fresher
            </span>
            <span 
              onClick={() => setQuery('"Full Stack" AND (React OR Angular) AND Python')}
              style={{ color: '#4F46E5', textDecoration: 'underline', cursor: 'pointer', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}
            >
              "Full Stack" AND (React OR Angular) AND Python
            </span>
            <span 
              onClick={() => setQuery('(AWS OR Azure) NOT GCP')}
              style={{ color: '#4F46E5', textDecoration: 'underline', cursor: 'pointer', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}
            >
              (AWS OR Azure) NOT GCP
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="button" className="ts-btn ts-btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
            <button type="submit" className="ts-btn ts-btn-primary">
              🔍 Search Candidates
            </button>
          </div>
        </form>
      )}

      {/* AI JD Matcher Box */}
      {mode === 'ai_jd' && (
        <form className="ts-jd-card" onSubmit={handleJdMatchSubmit}>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤖 AI Job Description Candidate Matcher</span>
          </div>
          <textarea
            className="ts-jd-textarea"
            placeholder="Paste complete Job Description text here... (e.g. Senior Frontend Engineer with 4+ years React, TypeScript, Tailwind, GraphQL...)"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Extracts required skills, role title, and experience to rank the global candidate pool.
            </span>
            <button type="submit" className="ts-btn ts-btn-primary" disabled={isMatchingJd}>
              {isMatchingJd ? 'Analyzing & Scoring...' : '⚡ Match & Rank Candidates'}
            </button>
          </div>

          {parsedJd && (
            <div className="ts-jd-extracted-banner">
              <div>
                <strong>Parsed Role:</strong> {parsedJd.extracted_title} &nbsp;|&nbsp;
                <strong>Min Experience:</strong> {parsedJd.extracted_min_experience} Yrs
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {parsedJd.extracted_skills.map((sk, i) => (
                  <span key={i} className="ts-match-tag" style={{ background: '#C7D2FE', color: '#1E1B4B' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Candidate Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          Loading candidate pool...
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          No candidate profiles matched your criteria. Try adjusting your filters.
        </div>
      ) : (
        <div className="ts-candidate-grid">
          {candidates.map(cand => (
            <div key={cand.id} className="ts-card">
              {cand.ai_match_score > 0 && (
                <div className="ts-ai-badge">
                  <span>⚡</span> {cand.ai_match_score}% Match
                </div>
              )}

              <div className="ts-card-header">
                <div className="ts-avatar">
                  {cand.name.charAt(0)}
                </div>
                <div style={{ flex: 1, paddingRight: '70px' }}>
                  <h4 className="ts-cand-name">{cand.is_unlocked ? cand.name : cand.masked_name}</h4>
                  <div className="ts-cand-role">{highlightText(cand.current_role || '', cand.boolean_match_keywords || [])}</div>
                  <div className="ts-cand-meta">
                    <span>💼 {cand.total_experience}</span>
                    <span>📍 {highlightText(cand.location_display, cand.boolean_match_keywords || [])}</span>
                  </div>
                </div>
              </div>

              {/* Match Tags & Skills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cand.match_tags.length > 0 && (
                  <div className="ts-match-tags">
                    {cand.match_tags.map((t, idx) => (
                      <span key={idx} className="ts-match-tag">
                        ✓ {t.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="ts-skills-wrap">
                  {cand.skills.slice(0, 6).map((sk, idx) => {
                    const isKeywordMatch = cand.boolean_match_keywords && cand.boolean_match_keywords.some(
                      k => sk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(sk.toLowerCase())
                    );
                    return (
                      <span 
                        key={idx} 
                        className={`ts-skill-chip ${isKeywordMatch ? 'match' : ''}`}
                        style={isKeywordMatch ? { background: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0', fontWeight: 'bold' } : {}}
                      >
                        {highlightText(sk, cand.boolean_match_keywords || [])}
                      </span>
                    );
                  })}
                  {cand.skills.length > 6 && (
                    <span className="ts-skill-chip">+{cand.skills.length - 6} more</span>
                  )}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="ts-card-actions">
                <button
                  className="ts-btn ts-btn-secondary"
                  onClick={() => setSelectedCandidate(cand)}
                >
                  👁️ View Profile
                </button>

                <button
                  className={`ts-btn ${cand.is_saved ? 'ts-btn-primary' : 'ts-btn-secondary'}`}
                  onClick={() => handleToggleSave(cand)}
                >
                  {cand.is_saved ? '❤️ Saved' : '🔖 Save'}
                </button>

                {!cand.is_unlocked ? (
                  <button
                    className="ts-btn ts-btn-unlock"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleUnlockProfile(cand)}
                    disabled={isUnlocking === cand.id}
                  >
                    {isUnlocking === cand.id ? 'Unlocking...' : '🔓 Unlock Contact'}
                  </button>
                ) : (
                  <button className="ts-btn ts-btn-unlocked" style={{ marginLeft: 'auto' }}>
                    ✅ Unlocked
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile Detail Modal */}
      {selectedCandidate && (() => {
        const analysis = analyzeMatches(selectedCandidate);
        return (
          <div className="ac-modal-backdrop" onClick={() => setSelectedCandidate(null)}>
            <div className="ts-modal-card" onClick={e => e.stopPropagation()} style={{ padding: '24px', width: '780px', maxWidth: '95vw' }}>
              
              {/* Naukri Header */}
              <div className="ts-naukri-header">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="ts-avatar" style={{ width: '64px', height: '64px', fontSize: '22px' }}>
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800 }}>
                      {selectedCandidate.is_unlocked ? selectedCandidate.name : selectedCandidate.masked_name}
                    </h3>
                    <div style={{ color: '#6D28D9', fontWeight: 700, fontSize: '14.5px', marginTop: '2px' }}>
                      {selectedCandidate.current_role}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '10px' }}>
                      <span>📍 {selectedCandidate.location_display}</span>
                      <span>•</span>
                      <span>💼 {selectedCandidate.total_experience} Exp</span>
                    </div>
                  </div>
                </div>

                {analysis && (
                  <div className="ts-match-donut">
                    <span className="ts-match-score-num">{analysis.score}%</span>
                    <span className="ts-match-score-label">ATS Match Score</span>
                  </div>
                )}

                <button
                  className="ac-btn-icon"
                  onClick={() => setSelectedCandidate(null)}
                  style={{ fontSize: '18px', cursor: 'pointer', background: 'none', border: 'none', position: 'absolute', right: '20px', top: '20px' }}
                >
                  ✕
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '20px 0 16px' }} />

              {/* AI Job Match Insights Comparison Section */}
              {analysis && (analysis.reqTitle || analysis.reqMinExp > 0 || analysis.reqLocation || analysis.matchedSkills.length > 0) && (
                <div className="ts-analysis-card">
                  <div className="ts-analysis-title">
                    <span>🤖</span> AI JD Match Report & Comparison
                  </div>

                  <div className="ts-grid-comparison">
                    {/* Role Title Comparison */}
                    <div className="ts-comp-item">
                      <div className="ts-comp-label">Target Role</div>
                      <div className="ts-comp-val" title={analysis.reqTitle || 'Any Role'}>
                        {analysis.reqTitle || 'Any Role'}
                      </div>
                      <div className={`ts-badge ${analysis.roleStatus}`}>
                        {analysis.roleStatus === 'strong' ? 'Strong Match' : analysis.roleStatus === 'partial' ? 'Partial Match' : 'Mismatch / Missing'}
                      </div>
                    </div>

                    {/* Experience Comparison */}
                    <div className="ts-comp-item">
                      <div className="ts-comp-label">Required Exp</div>
                      <div className="ts-comp-val">
                        {analysis.reqMinExp > 0 ? `${analysis.reqMinExp}+ Yrs` : 'Any Experience'}
                      </div>
                      <div className={`ts-badge ${analysis.expStatus}`}>
                        {analysis.expStatus === 'strong' ? 'Meets Req' : analysis.expStatus === 'partial' ? 'Close Match' : 'Below Req'}
                      </div>
                    </div>

                    {/* Location Comparison */}
                    <div className="ts-comp-item">
                      <div className="ts-comp-label">Required Loc</div>
                      <div className="ts-comp-val" title={analysis.reqLocation || 'Any Location'}>
                        {analysis.reqLocation || 'Any Location'}
                      </div>
                      <div className={`ts-badge ${analysis.locStatus}`}>
                        {analysis.locStatus === 'strong' ? 'Location Match' : analysis.locStatus === 'partial' ? 'Partial Loc' : 'Mismatch'}
                      </div>
                    </div>
                  </div>

                  {/* Why this candidate matches */}
                  {analysis.reasons.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div className="ts-comp-label" style={{ marginBottom: '8px' }}>Why this candidate matches:</div>
                      <div className="ts-reasons-box">
                        {analysis.reasons.map((reason, idx) => (
                          <div key={idx} className="ts-reason-item">
                            <span className={`ts-reason-bullet ${reason.type}`}>
                              {reason.type === 'match' ? '✓' : reason.type === 'warning' ? '⚠' : '✗'}
                            </span>
                            <span>{reason.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Compatibility Section */}
              <div style={{ marginTop: '20px' }}>
                <div className="ts-skills-section-title">Key Skills Analysis</div>
                <div className="ts-skills-wrap">
                  {/* Matching skills */}
                  {analysis?.candidateMatchedSkills.map((sk, idx) => (
                    <span key={`match-${idx}`} className="ts-skill-badge strong" title="Exact match with Job Description requirement">
                      ✓ {sk}
                    </span>
                  ))}
                  
                  {/* Missing required skills */}
                  {analysis?.missingSkills.map((sk, idx) => (
                    <span key={`missing-${idx}`} className="ts-skill-badge missing" title="Skill required by Job Description but missing from profile">
                      ✗ {sk} (Required)
                    </span>
                  ))}

                  {/* Other skills */}
                  {(analysis ? analysis.candidateOtherSkills : selectedCandidate.skills).map((sk, idx) => (
                    <span key={`other-${idx}`} className="ts-skill-badge other">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profile Details Grid */}
              <div style={{ marginTop: '24px', background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                  <div><strong>Education Level:</strong> {selectedCandidate.highest_qualification || 'Degree'}</div>
                  <div><strong>University/Institute:</strong> {selectedCandidate.university || 'Recognized University'}</div>
                  <div><strong>Expected Compensation:</strong> {selectedCandidate.expected_salary}</div>
                  <div><strong>Notice Period:</strong> {selectedCandidate.notice_period}</div>
                </div>
              </div>

              {/* Unlocked Contact details */}
              <div style={{ marginTop: '20px' }}>
                <div className="ts-label" style={{ marginBottom: '8px' }}>Contact & Resume Details</div>
                {selectedCandidate.is_unlocked ? (
                  <div className="ts-unlocked-box">
                    <div><strong>Email Address:</strong> {selectedCandidate.email}</div>
                    <div><strong>Phone Number:</strong> {selectedCandidate.phone}</div>
                    {selectedCandidate.resume_url && (
                      <div style={{ marginTop: '4px' }}>
                        <a href={selectedCandidate.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📥 Download Candidate Resume PDF
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div><strong>Email:</strong> {selectedCandidate.masked_email}</div>
                      <div><strong>Phone:</strong> {selectedCandidate.masked_phone}</div>
                    </div>
                    <button
                      className="ts-btn ts-btn-unlock"
                      onClick={() => handleUnlockProfile(selectedCandidate)}
                      disabled={isUnlocking === selectedCandidate.id}
                    >
                      🔓 Unlock Contact Info
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <button
                  className={`ts-btn ${selectedCandidate.is_saved ? 'ts-btn-primary' : 'ts-btn-secondary'}`}
                  onClick={() => handleToggleSave(selectedCandidate)}
                  style={{ height: '36px', padding: '0 16px' }}
                >
                  {selectedCandidate.is_saved ? '❤️ Saved' : '🔖 Save Candidate'}
                </button>
                <button className="ts-btn ts-btn-secondary" onClick={() => setSelectedCandidate(null)} style={{ height: '36px', padding: '0 16px' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TalentSearchTab;
