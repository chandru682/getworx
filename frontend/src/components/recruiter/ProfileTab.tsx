import React, { useState } from 'react';
import { 
  Award, 
  Lock, 
  Globe, 
  Bell, 
  CheckCircle
} from 'lucide-react';
import { mockRecruiterProfile } from './mockData';

export const ProfileTab: React.FC = () => {
  const [password, setPassword] = useState('*********');
  const [lang, setLang] = useState('en');
  const [prefAppls, setPrefAppls] = useState(true);
  const [prefInterviews, setPrefInterviews] = useState(true);
  const [prefAi, setPrefAi] = useState(true);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Security settings updated successfully!');
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Notification preferences updated successfully!');
  };

  return (
    <div className="profile-tab-workspace font-sans animate-fade-in">
      
      {/* Profile Overview Card */}
      <div className="profile-overview-card">
        <div className="info-main">
          <img src={mockRecruiterProfile.avatar} alt={mockRecruiterProfile.name} className="avatar-xl" />
          <div className="text-details">
            <span className="rank-badge">{mockRecruiterProfile.recruiterRank}</span>
            <h2>{mockRecruiterProfile.name}</h2>
            <p className="title">{mockRecruiterProfile.designation}</p>
            <p className="dept">{mockRecruiterProfile.department}</p>
            
            <div className="badges-row">
              {mockRecruiterProfile.badges.map((b, idx) => (
                <span key={idx} className="badge-pill-item"><Award size={12} /> {b}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-box">
          <div className="score-circle">
            <span className="val">{mockRecruiterProfile.performanceScore}%</span>
            <span className="lbl">Performance KPI</span>
          </div>
        </div>
      </div>

      <div className="profile-details-split">
        
        {/* Left Side: Milestones & Stats */}
        <div className="details-col-left">
          <div className="details-card">
            <h3>Leaderboard Achievements</h3>
            <div className="achievements-list">
              {mockRecruiterProfile.achievements.map((ach, idx) => (
                <div key={idx} className="achievement-item">
                  <CheckCircle size={16} className="green-txt" />
                  <p>{ach}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="details-card">
            <h3>Hiring Metrics Summary</h3>
            <div className="hiring-metrics-mini-list">
              <div className="h-metric">
                <span>Total Placed:</span>
                <strong>84 Candidates</strong>
              </div>
              <div className="h-metric">
                <span>Avg Offer Conversion:</span>
                <strong>92% Acceptance</strong>
              </div>
              <div className="h-metric">
                <span>Talent Source Sourcing:</span>
                <strong>42% AI Referrals</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security & Configurations */}
        <div className="details-col-right">
          
          {/* Security Form */}
          <div className="details-card">
            <div className="card-header-icon">
              <Lock size={16} />
              <h3>Security & Password</h3>
            </div>
            <form onSubmit={handleSaveSecurity}>
              <div className="form-group-custom">
                <label>Change Portal Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="font-sans"
                />
              </div>
              <button type="submit" className="btn-secondary-profile font-sans">Update Password</button>
            </form>
          </div>

          {/* Preferences */}
          <div className="details-card">
            <div className="card-header-icon">
              <Bell size={16} />
              <h3>Notification Preferences</h3>
            </div>
            <form onSubmit={handleSavePrefs}>
              <div className="checkboxes-group">
                <label className="pref-checkbox-label">
                  <input type="checkbox" checked={prefAppls} onChange={(e) => setPrefAppls(e.target.checked)} />
                  <span>Notify on new applicant arrivals</span>
                </label>
                
                <label className="pref-checkbox-label">
                  <input type="checkbox" checked={prefInterviews} onChange={(e) => setPrefInterviews(e.target.checked)} />
                  <span>Send interview calendar reminders</span>
                </label>

                <label className="pref-checkbox-label">
                  <input type="checkbox" checked={prefAi} onChange={(e) => setPrefAi(e.target.checked)} />
                  <span>Allow automated AI recommendation alerts</span>
                </label>
              </div>

              <div className="form-group-custom select-custom">
                <label><Globe size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Portal System Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="font-sans">
                  <option value="en">English (US)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="fr">French (Français)</option>
                </select>
              </div>

              <button type="submit" className="btn-secondary-profile font-sans">Save Preferences</button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
