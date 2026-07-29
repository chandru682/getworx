import React, { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  AlertTriangle, 
  HelpCircle, 
  DollarSign, 
  ShieldCheck,
  Check
} from 'lucide-react';
import type { Candidate, RecruiterJob } from './types';

interface AiMatchTabProps {
  jobs: RecruiterJob[];
  candidates: Candidate[];
  onUpdateCandidate: (candId: string, updates: Partial<Candidate>) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const AiMatchTab: React.FC<AiMatchTabProps> = ({
  jobs,
  candidates,
  onUpdateCandidate,
  onSelectCandidate
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [customJdText, setCustomJdText] = useState('');
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Generate matching metrics dynamically based on chosen job
  const getMatchesForJob = () => {
    if (!selectedJob) return [];

    return candidates
      .map(cand => {
        // Simple logic to compute matching variables based on skills overlap
        const jobReqs = selectedJob.requirements || [];
        const matchingSkills = cand.skills.filter(s => jobReqs.some(req => req.toLowerCase().includes(s.toLowerCase())));
        const missingSkills = jobReqs.filter(req => !cand.skills.some(s => req.toLowerCase().includes(s.toLowerCase())));
        
        // Match calculation
        const skillsScore = jobReqs.length > 0 ? Math.round((matchingSkills.length / jobReqs.length) * 100) : 75;
        let expScore = 80;
        
        // Experience matching
        const jobExpNum = parseInt(selectedJob.experience) || 5;
        if (cand.experienceYears >= jobExpNum) expScore = 100;
        else expScore = Math.round((cand.experienceYears / jobExpNum) * 100);

        // General overall score
        const matchPct = Math.round((skillsScore * 0.6) + (expScore * 0.4));

        // Mock salary recommendation & culture
        const expectedNum = parseInt(cand.expectedSalary.replace(/[^0-9]/g, '')) || 80;
        const budgetNum = parseInt(selectedJob.salaryRange.replace(/[^0-9]/g, '')) || 100;
        const salaryPrediction = expectedNum <= budgetNum 
          ? 'Aligned with current budget guidelines.' 
          : 'Slightly above standard scale ($10k deviation).';

        const cultureMatch = matchPct > 90 ? 95 : matchPct > 80 ? 88 : 78;

        const hiringRecommendation = matchPct >= 90 
          ? 'Strong Recommendation: Candidate possesses the required frontend/backend architecture credentials. Fast-track to interview.'
          : matchPct >= 80 
          ? 'Recommended: Strong skillset but check notice period and expectations in screening round.'
          : 'Neutral: Missing core frameworks. Verify secondary experience.';

        const aiQuestions = [
          `Can you describe your experience implementing architecture that aligns with ${selectedJob.title} requirements?`,
          `How do you handle performance optimization when working with ${matchingSkills[0] || 'core technologies'}?`,
          `How would you manage transitioning code constraints where ${missingSkills[0] || 'missing technologies'} are required?`
        ];

        return {
          candidate: cand,
          matchPercentage: matchPct,
          skillsScore,
          expScore,
          matchingSkills,
          missingSkills,
          salaryPrediction,
          cultureMatch,
          hiringRecommendation,
          aiQuestions
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const matches = getMatchesForJob();
  const currentAnalysis = matches.find(m => m.candidate.id === activeAnalysisId) || matches[0];

  const handleAutoShortlist = (candId: string) => {
    onUpdateCandidate(candId, { currentStage: 'shortlisted' });
    alert('Candidate successfully shortlisted!');
  };

  return (
    <div className="ai-match-workspace font-sans">
      <div className="ai-header">
        <div className="title-row">
          <Sparkles className="ai-pulse-icon" />
          <h1>AI Candidate Match Workspace</h1>
        </div>
        <p>Select an active position or input custom description tags to execute candidate vector compatibility matches.</p>
      </div>

      <div className="ai-workspace-layout">
        
        {/* Left Column: Job Selector & Rankings */}
        <div className="ai-left-column">
          <div className="job-selection-card">
            <h3>Target Job Profile</h3>
            <div className="select-wrapper">
              <Briefcase size={16} />
              <select value={selectedJobId} onChange={(e) => {
                setSelectedJobId(e.target.value);
                setActiveAnalysisId(null);
              }}>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                ))}
              </select>
            </div>

            <div className="custom-jd-entry">
              <label>Or input custom JD text blocks:</label>
              <textarea 
                placeholder="Paste Job Description text here..." 
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                className="font-sans"
              />
              <button className="btn-ai-match font-sans" onClick={() => alert('Custom matching is running!')}>
                <Sparkles size={14} /> Calculate Custom Match
              </button>
            </div>
          </div>

          {/* Candidates Ranking List */}
          <div className="rankings-card">
            <div className="card-header">
              <h3>AI Candidate Rankings</h3>
              <span>{matches.length} Profiles matched</span>
            </div>
            <div className="rankings-list scroll-y max-h-400">
              {matches.map((match, idx) => (
                <div 
                  key={match.candidate.id} 
                  className={`ranking-item ${currentAnalysis?.candidate.id === match.candidate.id ? 'active' : ''}`}
                  onClick={() => setActiveAnalysisId(match.candidate.id)}
                >
                  <div className="rank-num">#{idx + 1}</div>
                  <img src={match.candidate.photoUrl} alt={match.candidate.name} className="avatar-sm" />
                  <div className="info">
                    <h4>{match.candidate.name}</h4>
                    <p>{match.candidate.currentDesignation}</p>
                  </div>
                  <div className="match-val-pill">
                    <span>{match.matchPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights Breakdown */}
        <div className="ai-right-column">
          {currentAnalysis ? (
            <div className="analysis-insights-card animate-slide-up">
              
              {/* Header profile info */}
              <div className="analysis-card-header">
                <div className="profile">
                  <img src={currentAnalysis.candidate.photoUrl} alt={currentAnalysis.candidate.name} className="avatar-lg" />
                  <div>
                    <h2>{currentAnalysis.candidate.name}</h2>
                    <p className="sub">{currentAnalysis.candidate.currentDesignation}</p>
                    <span className="location">{currentAnalysis.candidate.location} • {currentAnalysis.candidate.experienceYears} Years Exp</span>
                  </div>
                </div>
                <div className="match-rings-grid">
                  <div className="match-circle-stat">
                    <strong>{currentAnalysis.matchPercentage}%</strong>
                    <span>Overall Match</span>
                  </div>
                </div>
              </div>

              {/* Insights content scroll */}
              <div className="analysis-details-scroll scroll-y">
                
                {/* Scoring meters */}
                <div className="meters-grid">
                  <div className="meter-box">
                    <span className="lbl">Skills Match</span>
                    <div className="bar-wrapper">
                      <div className="bar-fill purple" style={{ width: `${currentAnalysis.skillsScore}%` }}></div>
                    </div>
                    <strong>{currentAnalysis.skillsScore}%</strong>
                  </div>
                  <div className="meter-box">
                    <span className="lbl">Experience Match</span>
                    <div className="bar-wrapper">
                      <div className="bar-fill blue" style={{ width: `${currentAnalysis.expScore}%` }}></div>
                    </div>
                    <strong>{currentAnalysis.expScore}%</strong>
                  </div>
                  <div className="meter-box">
                    <span className="lbl">Culture Fit Fitment</span>
                    <div className="bar-wrapper">
                      <div className="bar-fill green" style={{ width: `${currentAnalysis.cultureMatch}%` }}></div>
                    </div>
                    <strong>{currentAnalysis.cultureMatch}%</strong>
                  </div>
                </div>

                {/* Skills tags breakdown */}
                <div className="skills-breakdown-box">
                  <div className="skills-group">
                    <h4><ShieldCheck size={14} className="green-txt" /> Matching Skills ({currentAnalysis.matchingSkills.length})</h4>
                    <div className="tags">
                      {currentAnalysis.matchingSkills.map((s, i) => <span key={i} className="skill-pill-green">{s}</span>)}
                    </div>
                  </div>

                  <div className="skills-group">
                    <h4><AlertTriangle size={14} className="orange-txt" /> Missing Skills ({currentAnalysis.missingSkills.length})</h4>
                    <div className="tags">
                      {currentAnalysis.missingSkills.map((s, i) => <span key={i} className="skill-pill-orange">{s}</span>)}
                    </div>
                  </div>
                </div>

                {/* Salary & Culture */}
                <div className="insights-text-grid">
                  <div className="text-insight-item">
                    <h4>AI Salary Insights</h4>
                    <div className="desc">
                      <DollarSign size={16} />
                      <p>Expected: <strong>{currentAnalysis.candidate.expectedSalary}</strong>. {currentAnalysis.salaryPrediction}</p>
                    </div>
                  </div>

                  <div className="text-insight-item">
                    <h4>Culture Match Score</h4>
                    <div className="desc">
                      <ShieldCheck size={16} />
                      <p>Strong match based on team structure profile. Fits high collaboration team environment.</p>
                    </div>
                  </div>
                </div>

                {/* Hiring Recommendation */}
                <div className="recommendation-alert-box">
                  <Sparkles size={18} className="ai-icon" />
                  <div>
                    <h4>Hiring Recommendation</h4>
                    <p>{currentAnalysis.hiringRecommendation}</p>
                  </div>
                </div>

                {/* AI generated interview questions */}
                <div className="ai-questions-box">
                  <h3>AI Interview Question Generator</h3>
                  <div className="questions-list">
                    {currentAnalysis.aiQuestions.map((q, idx) => (
                      <div key={idx} className="q-item">
                        <HelpCircle size={14} />
                        <p>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Actions footer */}
              <div className="analysis-card-footer">
                <button className="btn-secondary-custom font-sans" onClick={() => onSelectCandidate(currentAnalysis.candidate)}>
                  View Complete Profile
                </button>
                {currentAnalysis.candidate.currentStage !== 'shortlisted' ? (
                  <button className="btn-primary-custom font-sans" onClick={() => handleAutoShortlist(currentAnalysis.candidate.id)}>
                    <Check size={16} /> Auto Shortlist Candidate
                  </button>
                ) : (
                  <button className="btn-primary-custom font-sans disabled" disabled>
                    <Check size={16} /> Shortlisted
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="empty-analysis-state">
              <Sparkles size={48} />
              <h3>Select a candidate on the left to run matching</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
