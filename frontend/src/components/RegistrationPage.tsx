import React, { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  FileText,
  UserCheck
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';

interface RegistrationPageProps {
  onRegisterSuccess: (userData: any) => void;
  onNavigateLogin: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onRegisterSuccess,
  onNavigateLogin
}) => {
  const [workStatus, setWorkStatus] = useState<'experienced' | 'fresher'>('experienced');
  const [showPassword, setShowPassword] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    currentTitle: '',
    companyName: '',
    experienceYears: '2',
    currentSalary: '',
    highestQualification: 'B.Tech in Computer Science',
    university: '',
    passingYear: '2024',
    city: 'San Francisco',
    whatsappConsent: true
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Weak', color: '#ef4444' };
    if (pass.length < 10) return { label: 'Good', color: '#f59e0b' };
    return { label: 'Strong', color: '#10b981' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onRegisterSuccess({
          name: formData.fullName || 'Job Seeker',
          email: formData.email,
          phone: formData.mobile,
          title: workStatus === 'experienced' ? (formData.currentTitle || 'Software Engineer') : 'Graduate Trainee',
          location: formData.city || 'San Francisco, CA',
          totalExperience: workStatus === 'experienced' ? `${formData.experienceYears} Years` : 'Fresher (0 Yrs)',
          highestQualification: formData.highestQualification,
          university: formData.university || 'University Graduate'
        });
      }, 1200);
    }, 1000);
  };

  const strength = getPasswordStrength(formData.password);

  if (isSuccess) {
    return (
      <div className="widget-box" style={{ maxWidth: '600px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
        <div className="reg-success-icon">
          <CheckCircle2 size={44} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Account Created Successfully!</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
          Welcome to GetWorxs, <strong>{formData.fullName || 'Job Seeker'}</strong>! We are redirecting you to your candidate profile dashboard...
        </p>
        <div style={{ marginTop: '24px' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px', borderTopColor: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="reg-container">
      <div className="reg-layout">
        
        {/* Left Column: Why Register on GetWorxs */}
        <div className="reg-left-banner">
          <div style={{ marginBottom: '28px' }}>
            <GetWorxsLogo size="lg" />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: '1.3' }}>
            Find a job & grow your career with GetWorxs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '28px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div className="company-icon-box" style={{ backgroundColor: 'var(--tag-purple-bg)' }}>
                <Briefcase size={22} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>100k+ Verified Jobs</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.5' }}>
                  Connect with top recruiters from IT software, design, finance, and enterprise companies.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div className="company-icon-box" style={{ backgroundColor: 'var(--tag-cyan-bg)' }}>
                <Sparkles size={22} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>A.I. ATS Resume Optimization</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.5' }}>
                  Get automated resume scores and direct recommendations to pass recruiter screening filters.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div className="company-icon-box" style={{ backgroundColor: 'var(--tag-emerald-bg)' }}>
                <UserCheck size={22} style={{ color: 'var(--color-success)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Direct Hiring & Interview Calls</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.5' }}>
                  Get shortlisted directly by hiring managers with instant job alert match notifications.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', padding: '20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
              "Creating my profile on GetWorxs helped me get 4 interview callbacks and land a $140k/yr hybrid developer role within 2 weeks!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                JD
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Jason Drake</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Lead Engineer @ CloudScale</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Naukri-Style Registration Form */}
        <div className="widget-box" style={{ padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Create your GetWorxs profile
            </h2>
            <button 
              onClick={onNavigateLogin} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
            >
              Already registered? Login
            </button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Search & apply to jobs from India's & Global No.1 Career Portal
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <label className="form-label">
              <span>Full Name *</span>
              <input 
                className="form-input" 
                placeholder="What is your name?"
                value={formData.fullName} 
                onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                required 
              />
            </label>

            <label className="form-label">
              <span>Email ID *</span>
              <input 
                className="form-input" 
                type="email"
                placeholder="We'll send relevant job recommendations here"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </label>

            <label className="form-label">
              <span>Password *</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  className="form-input" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  required 
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength.label && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Password strength:</span>
                  <span style={{ color: strength.color, fontWeight: '700' }}>{strength.label}</span>
                </div>
              )}
            </label>

            <label className="form-label">
              <span>Mobile Number *</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="filter-select" style={{ width: '110px' }}>
                  <option>+91 (IND)</option>
                  <option>+1 (USA)</option>
                  <option>+44 (UK)</option>
                </select>
                <input 
                  className="form-input" 
                  placeholder="Recruiters will contact you on this number"
                  value={formData.mobile} 
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })} 
                  required 
                  style={{ flex: 1 }}
                />
              </div>
            </label>

            {/* Work Status Cards (Experienced vs Fresher) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="form-label">Work Status *</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                <div 
                  onClick={() => setWorkStatus('experienced')}
                  className={`reg-work-card ${workStatus === 'experienced' ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Briefcase size={22} style={{ color: workStatus === 'experienced' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                    {workStatus === 'experienced' && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                  <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    I'm Experienced
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    I have work experience (excluding internships)
                  </span>
                </div>

                <div 
                  onClick={() => setWorkStatus('fresher')}
                  className={`reg-work-card ${workStatus === 'fresher' ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <GraduationCap size={22} style={{ color: workStatus === 'fresher' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                    {workStatus === 'fresher' && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                  <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    I'm a Fresher
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    I am a student / recent college graduate
                  </span>
                </div>

              </div>
            </div>

            {/* Dynamic Status Fields */}
            {workStatus === 'experienced' ? (
              <div className="form-grid" style={{ backgroundColor: 'var(--bg-neutral-light)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <label className="form-label">
                  <span>Current Designation</span>
                  <input className="form-input" placeholder="e.g. Senior Frontend Engineer" value={formData.currentTitle} onChange={e => setFormData({ ...formData, currentTitle: e.target.value })} />
                </label>
                <label className="form-label">
                  <span>Company Name</span>
                  <input className="form-input" placeholder="e.g. Google Nest Solutions" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                </label>
                <label className="form-label">
                  <span>Total Experience</span>
                  <select className="filter-select" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="8+">8+ Years</option>
                  </select>
                </label>
                <label className="form-label">
                  <span>Current CTC (Salary)</span>
                  <input className="form-input" placeholder="e.g. $120,000 / yr" value={formData.currentSalary} onChange={e => setFormData({ ...formData, currentSalary: e.target.value })} />
                </label>
              </div>
            ) : (
              <div className="form-grid" style={{ backgroundColor: 'var(--bg-neutral-light)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <label className="form-label">
                  <span>Highest Qualification</span>
                  <input className="form-input" placeholder="e.g. B.Tech in Computer Science" value={formData.highestQualification} onChange={e => setFormData({ ...formData, highestQualification: e.target.value })} />
                </label>
                <label className="form-label">
                  <span>University / College</span>
                  <input className="form-input" placeholder="e.g. Stanford University" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                </label>
                <label className="form-label">
                  <span>Passing Year</span>
                  <select className="filter-select" value={formData.passingYear} onChange={e => setFormData({ ...formData, passingYear: e.target.value })}>
                    <option value="2026">2026 (Final Year)</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </label>
                <label className="form-label">
                  <span>Current City</span>
                  <input className="form-input" placeholder="e.g. San Francisco" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </label>
              </div>
            )}

            {/* Resume Upload Dropzone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="form-label">Resume Upload</span>
              <label 
                htmlFor="resume-upload-input"
                className="upload-area" 
                style={{ padding: '24px 16px', gap: '8px', cursor: 'pointer', textAlign: 'center' }}
              >
                <UploadCloud size={28} style={{ color: 'var(--color-primary)' }} />
                {resumeFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Upload Resume (PDF, DOC, DOCX)
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Recruiters prefer candidate profiles with updated resumes (Max 2MB)
                    </span>
                  </>
                )}
                <input 
                  id="resume-upload-input" 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            {/* Consent Checkbox */}
            <label className="filter-checkbox-label" style={{ alignItems: 'flex-start', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={formData.whatsappConsent} 
                onChange={e => setFormData({ ...formData, whatsappConsent: e.target.checked })} 
                style={{ marginTop: '3px' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.5' }}>
                Send me important job notifications, recruiter interview calls, and application status alerts on WhatsApp & Email.
              </span>
            </label>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
              style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: 'var(--radius-lg)', marginTop: '8px' }}
            >
              {isSubmitting ? (
                <span className="spinner" />
              ) : (
                <>
                  <span>Register Now</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
              By clicking Register, you agree to GetWorxs Terms & Conditions and Privacy Policy.
            </p>

          </form>

        </div>

      </div>

    </div>
  );
};
