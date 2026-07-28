import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  MoveRight
} from 'lucide-react';
import type { Candidate } from './types';

interface PipelineTabProps {
  candidates: Candidate[];
  onUpdateCandidateStage: (candId: string, newStage: Candidate['currentStage']) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

const pipelineStages: { key: Candidate['currentStage']; label: string; color: string }[] = [
  { key: 'applied', label: 'Applied', color: '#64748b' },
  { key: 'screening', label: 'Screening', color: '#0ea5e9' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#8b5cf6' },
  { key: 'interview1', label: 'Interview R1', color: '#a855f7' },
  { key: 'interview2', label: 'Interview R2', color: '#d946ef' },
  { key: 'final', label: 'Final Discussion', color: '#ec4899' },
  { key: 'offer', label: 'Offer Released', color: '#10b981' },
  { key: 'joined', label: 'Joined', color: '#059669' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' }
];

export const PipelineTab: React.FC<PipelineTabProps> = ({
  candidates,
  onUpdateCandidateStage,
  onSelectCandidate
}) => {
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('text/plain', candidateId);
    setDraggedCandidateId(candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e: React.DragEvent, targetStage: Candidate['currentStage']) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    if (candidateId) {
      onUpdateCandidateStage(candidateId, targetStage);
    }
    setDraggedCandidateId(null);
  };

  // Stage Metrics
  const getStageMetrics = (stage: Candidate['currentStage']) => {
    const stageCandidates = candidates.filter(c => c.currentStage === stage);
    const count = stageCandidates.length;
    const avgMatchScore = count > 0 
      ? Math.round(stageCandidates.reduce((acc, c) => acc + c.aiMatchScore, 0) / count) 
      : 0;
    
    return { count, avgMatchScore };
  };

  return (
    <div className="pipeline-workspace font-sans">
      {/* Workspace Header */}
      <div className="pipeline-header">
        <div>
          <h1>Candidate Pipeline</h1>
          <p>Drag and drop candidate cards to update stages, or click on profiles to review comprehensive files.</p>
        </div>
        <div className="pipeline-summary-stats">
          <div className="summary-stat-box">
            <span className="lbl">Active Pipeline</span>
            <span className="val">{candidates.filter(c => c.currentStage !== 'rejected' && c.currentStage !== 'joined').length}</span>
          </div>
          <div className="summary-stat-box">
            <span className="lbl">Offers Extended</span>
            <span className="val green-txt">{candidates.filter(c => c.currentStage === 'offer').length}</span>
          </div>
        </div>
      </div>

      {/* Board Scroll Container */}
      <div className="pipeline-board-container scroll-x">
        <div className="pipeline-board-inner">
          {pipelineStages.map(stage => {
            const stageCands = candidates.filter(c => c.currentStage === stage.key);
            const { count, avgMatchScore } = getStageMetrics(stage.key);

            return (
              <div 
                key={stage.key} 
                className={`pipeline-column ${draggedCandidateId ? 'droppable' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div className="pipeline-col-header" style={{ borderTop: `4px solid ${stage.color}` }}>
                  <div className="stage-title-row">
                    <h3>{stage.label}</h3>
                    <span className="col-count-badge">{count}</span>
                  </div>
                  {count > 0 && (
                    <div className="stage-analytics-pill">
                      <Sparkles size={11} />
                      <span>Avg Match: {avgMatchScore}%</span>
                    </div>
                  )}
                </div>

                {/* Column Card Body */}
                <div className="pipeline-col-cards scroll-y">
                  {stageCands.length > 0 ? (
                    stageCands.map(cand => (
                      <div 
                        key={cand.id} 
                        className="pipeline-cand-card animate-fade-in"
                        draggable
                        onDragStart={(e) => handleDragStart(e, cand.id)}
                        onClick={() => onSelectCandidate(cand)}
                      >
                        <div className="card-top-info">
                          <img src={cand.photoUrl} alt={cand.name} className="cand-avatar" />
                          <div className="meta">
                            <h4>{cand.name}</h4>
                            <span className="company">{cand.currentCompany}</span>
                          </div>
                        </div>

                        <p className="card-designation">{cand.currentDesignation}</p>

                        <div className="card-footer-tags">
                          <span className="exp-pill">{cand.experienceYears} yrs</span>
                          {cand.aiMatchScore >= 90 ? (
                            <span className="score-pill-ai green">
                              <Sparkles size={10} />
                              {cand.aiMatchScore}%
                            </span>
                          ) : (
                            <span className="score-pill-ai purple">
                              <Sparkles size={10} />
                              {cand.aiMatchScore}%
                            </span>
                          )}
                        </div>

                        {/* Drag indicator overlay on hover */}
                        <div className="drag-indicator">
                          <MoveRight size={14} />
                          <span>Hold to drag</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pipeline-column-empty">
                      <Users size={20} />
                      <p>Drag candidate here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
