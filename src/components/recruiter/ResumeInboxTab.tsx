import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  UserPlus
} from 'lucide-react';
import type { Candidate } from './types';

interface ResumeInboxTabProps {
  onAddCandidate: (newCandidate: Candidate) => void;
  onNavigate: (tab: string) => void;
}

export const ResumeInboxTab: React.FC<ResumeInboxTabProps> = ({
  onAddCandidate,
  onNavigate
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated Parsing Data database
  const mockParsers = [
    {
      name: 'John Doe',
      currentDesignation: 'Staff Backend Architect',
      experienceYears: 11,
      skills: ['Go', 'Node.js', 'Kubernetes', 'Redis', 'PostgreSQL', 'gRPC', 'Distributed Systems'],
      location: 'Seattle, WA',
      currentCompany: 'CloudNexus Inc',
      currentSalary: '$190,000',
      expectedSalary: '$230,000',
      noticePeriod: '30 Days',
      availability: '30 Days' as const,
      resumeScore: 94,
      aiMatchScore: 96,
      email: 'john.doe@cloudnexus.io',
      phone: '+1 (206) 555-0182',
      professionalSummary: 'Expert Systems Architect with 11+ years of backend engineering experience. Specializes in scalable API infrastructures, transactional microservices, and orchestrating massive Kubernetes deployments.',
      education: 'MS in Computer Science - University of Washington',
      atsBreakdown: {
        keywordMatch: '96%',
        formattingScore: '92%',
        structureScore: '95%'
      }
    },
    {
      name: 'Li Wei',
      currentDesignation: 'Senior React Developer',
      experienceYears: 6,
      skills: ['React', 'TypeScript', 'Next.js', 'Redux Toolkit', 'GraphQL', 'Tailwind CSS'],
      location: 'Singapore',
      currentCompany: 'SeaGroup Technology',
      currentSalary: 'SGD 120,000',
      expectedSalary: 'SGD 150,000',
      noticePeriod: 'Immediate',
      availability: 'Immediate' as const,
      resumeScore: 91,
      aiMatchScore: 93,
      email: 'li.wei@techsea.sg',
      phone: '+65 9123 4567',
      professionalSummary: 'Product-focused frontend engineer building clean interfaces with React, Next.js, and state managers. Strong advocate for custom performance tools and automated UI test suites.',
      education: 'BS in Software Engineering - Nanyang Technological University',
      atsBreakdown: {
        keywordMatch: '91%',
        formattingScore: '95%',
        structureScore: '88%'
      }
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (_file: File) => {
    setIsUploading(true);
    setProgress(0);
    setParsedData(null);

    // Simulate upload and OCR scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            // Pick a random parser data set
            const idx = Math.floor(Math.random() * mockParsers.length);
            setParsedData(mockParsers[idx]);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleCreateCandidate = () => {
    if (!parsedData) return;

    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      name: parsedData.name,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', // default avatar
      currentDesignation: parsedData.currentDesignation,
      experienceYears: parsedData.experienceYears,
      skills: parsedData.skills,
      location: parsedData.location,
      currentCompany: parsedData.currentCompany,
      currentSalary: parsedData.currentSalary,
      expectedSalary: parsedData.expectedSalary,
      noticePeriod: parsedData.noticePeriod,
      availability: parsedData.availability,
      resumeScore: parsedData.resumeScore,
      aiMatchScore: parsedData.aiMatchScore,
      currentStage: 'applied',
      email: parsedData.email,
      phone: parsedData.phone,
      professionalSummary: parsedData.professionalSummary,
      experienceTimeline: [
        {
          id: `exp-${Date.now()}-1`,
          role: parsedData.currentDesignation,
          company: parsedData.currentCompany,
          duration: '2023 - Present',
          description: parsedData.professionalSummary
        }
      ],
      education: [
        {
          id: `edu-${Date.now()}-1`,
          degree: parsedData.education.split(' - ')[0],
          school: parsedData.education.split(' - ')[1] || 'Accredited University',
          duration: '2016 - 2020'
        }
      ],
      projects: [],
      certifications: [],
      languages: ['English (Fluent)'],
      resumeUrl: '/resumes/parsed_inbox.pdf',
      socialLinks: {},
      recruiterNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'AI Parser',
          text: `Resume processed automatically via GetWorxs OCR parsing. Extracted ${parsedData.skills.length} skills. Duplicate check clean.`,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          event: 'Created via Resume Inbox OCR',
          time: 'Just Now',
          details: 'ATS compatibility check validated.'
        }
      ],
      documents: [
        { id: `doc-${Date.now()}`, name: 'Resume_Source.pdf', size: '1.4 MB', type: 'pdf' }
      ]
    };

    onAddCandidate(newCand);
    alert(`Successfully parsed and registered "${newCand.name}" in candidate database!`);
    onNavigate('applicants');
  };

  return (
    <div className="resume-inbox-workspace font-sans">
      <div className="inbox-header">
        <h1>Resume Inbox</h1>
        <p>Drop multi-format resumes here to execute high-fidelity OCR scanning, duplicate detection, and skill extraction.</p>
      </div>

      <div className="inbox-main-layout">
        
        {/* Upload Column */}
        <div className="upload-container-column">
          <div 
            className={`drag-upload-box ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {isUploading ? (
              <div className="upload-progress-state">
                <Loader2 size={36} className="spinner-icon-pulse" />
                <h3>Analyzing Document...</h3>
                <p>Executing OCR parsing and formatting models.</p>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span>{progress}%</span>
              </div>
            ) : (
              <div className="upload-idle-state">
                <UploadCloud size={48} className="upload-icon" />
                <h3>Drag & Drop Resume File</h3>
                <p>Supports PDF, DOC, DOCX up to 10MB</p>
                <button className="btn-select-file font-sans">Browse Files</button>
              </div>
            )}
          </div>

          <div className="parsing-info-banner">
            <Sparkles size={16} />
            <p>Our deep OCR engine matches candidate layouts against standard systems to analyze structural formats and remove redundant styling profiles.</p>
          </div>
        </div>

        {/* Parsed Result View */}
        <div className="parsed-output-column">
          {parsedData ? (
            <div className="parsed-data-card animate-slide-up">
              <div className="parsed-card-header">
                <div className="headline">
                  <span className="success-badge"><CheckCircle size={14} /> Parser Success</span>
                  <h2>{parsedData.name}</h2>
                  <p>{parsedData.currentDesignation}</p>
                </div>
                <div className="ats-compatibility-score">
                  <div className="score-ring">
                    <span className="score-num">{parsedData.resumeScore}</span>
                    <span className="score-lbl">ATS Match</span>
                  </div>
                </div>
              </div>

              {/* Data breakdowns */}
              <div className="parsed-details scroll-y">
                
                <div className="parsed-detail-section">
                  <h3>AI Extracted Profile Summary</h3>
                  <p className="summary-text">"{parsedData.professionalSummary}"</p>
                </div>

                <div className="parsed-detail-section">
                  <h3>Skills Detected</h3>
                  <div className="skills-tags">
                    {parsedData.skills.map((s: string, idx: number) => (
                      <span key={idx} className="skill-pill">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="parsed-detail-section-grid">
                  <div>
                    <h4>Experience Details</h4>
                    <p><strong>{parsedData.experienceYears} Years</strong> of experience</p>
                    <span>Current: {parsedData.currentCompany}</span>
                  </div>
                  <div>
                    <h4>Education Details</h4>
                    <p>{parsedData.education}</p>
                  </div>
                </div>

                <div className="parsed-detail-section-grid">
                  <div>
                    <h4>Notice Period</h4>
                    <p>{parsedData.noticePeriod}</p>
                  </div>
                  <div>
                    <h4>Location</h4>
                    <p>{parsedData.location}</p>
                  </div>
                </div>

                <div className="parsed-detail-section">
                  <h3>ATS Structural Breakdown</h3>
                  <div className="ats-breakdowns">
                    <div className="b-item">
                      <span>Keyword Density</span>
                      <strong>{parsedData.atsBreakdown.keywordMatch}</strong>
                    </div>
                    <div className="b-item">
                      <span>Format Index</span>
                      <strong>{parsedData.atsBreakdown.formattingScore}</strong>
                    </div>
                    <div className="b-item">
                      <span>Structure Rating</span>
                      <strong>{parsedData.atsBreakdown.structureScore}</strong>
                    </div>
                  </div>
                </div>

                <div className="duplicate-check-passed">
                  <CheckCircle size={14} className="green-txt" />
                  <span>Duplicate Check: <strong>Passed</strong> (No matching emails found)</span>
                </div>
              </div>

              {/* Register CRM Action */}
              <div className="parsed-card-actions">
                <button className="btn-add-crm font-sans" onClick={handleCreateCandidate}>
                  <UserPlus size={16} />
                  <span>Register Candidate to CRM</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-parsed-state">
              <FileText size={48} />
              <h3>Awaiting Resume File</h3>
              <p>Upload a candidate resume on the left to review OCR outputs, ATS reports, and structure insights.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
