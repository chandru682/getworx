import React, { useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import type { Job } from './JobCard';
import { JOB_CATEGORIES, getCleanCategoryName } from '../data/jobCategoriesData';

interface JobPosterProps {
  onPostJob: (newJob: Job) => void;
}

export const JobPoster: React.FC<JobPosterProps> = ({ onPostJob }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('');
  const [workMode, setWorkMode] = useState<'Hybrid' | 'Remote' | 'In-office'>('Remote');
  const [selectedCatId, setSelectedCatId] = useState(JOB_CATEGORIES[0].id);
  const [selectedSubCategory, setSelectedSubCategory] = useState(JOB_CATEGORIES[0].subcategories[0]);
  const [experience, setExperience] = useState('1');
  const [jobType, setJobType] = useState<'Full Time' | 'Part Time' | 'Contract' | 'Internship'>('Full Time');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const currentCategoryObj = JOB_CATEGORIES.find(c => c.id === selectedCatId) || JOB_CATEGORIES[0];
  const cleanCategoryName = getCleanCategoryName(currentCategoryObj.name);

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const catObj = JOB_CATEGORIES.find(c => c.id === catId);
    if (catObj && catObj.subcategories.length > 0) {
      setSelectedSubCategory(catObj.subcategories[0]);
    } else {
      setSelectedSubCategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !budget || !description) return;

    const newJob: Job = {
      id: `posted-${Date.now()}`,
      title,
      clientName: company,
      clientRating: 5.0,
      clientLocation: 'Remote Office',
      budget,
      description,
      tags: [workMode, jobType, cleanCategoryName, selectedSubCategory].filter(Boolean),
      postedTime: 'Just now',
      workMode,
      category: cleanCategoryName,
      subcategory: selectedSubCategory,
      experience: parseInt(experience) || 0,
      jobType
    };

    onPostJob(newJob);
    setSuccess(true);

    // Clear form
    setTitle('');
    setCompany('');
    setBudget('');
    setDescription('');

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="widget-box">
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Employer Job Board Portal</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Post a new career opening across 33 global job sectors. It will immediately show up in the live candidate feed.
        </p>
      </div>

      {success && (
        <div style={{
          backgroundColor: 'var(--color-success-light)',
          border: '1px solid var(--color-success)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>Job opportunity posted successfully! Synced across global listings.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-grid">
          <label className="form-label">
            <span>Job Title</span>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Senior Full-Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            <span>Company Name</span>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Acme Corporation"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="form-label">
            <span>Salary / Budget</span>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. $90,000/yr or $60/hr"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            <span>Work Mode</span>
            <select 
              className="filter-select"
              style={{ padding: '10px 14px' }}
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as any)}
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="In-office">In-office</option>
            </select>
          </label>
        </div>

        {/* 33 Industry Sector Selector & Subcategory Selector */}
        <div className="form-grid">
          <label className="form-label">
            <span>Job Industry (33 Categories)</span>
            <select 
              className="filter-select"
              style={{ padding: '10px 14px' }}
              value={selectedCatId}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {JOB_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            <span>Specialization / Sub-Category</span>
            <select 
              className="filter-select"
              style={{ padding: '10px 14px' }}
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
            >
              {currentCategoryObj.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <label className="form-label">
            <span>Experience Level</span>
            <select 
              className="filter-select"
              style={{ padding: '10px 14px' }}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="0">Fresher (0 Years)</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
              <option value="8">8 Years</option>
              <option value="10">10 Years</option>
              <option value="15">15+ Years</option>
            </select>
          </label>

          <label className="form-label">
            <span>Job Type</span>
            <select 
              className="filter-select"
              style={{ padding: '10px 14px' }}
              value={jobType}
              onChange={(e) => setJobType(e.target.value as any)}
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </label>
        </div>

        <label className="form-label">
          <span>Job Description</span>
          <textarea
            className="widget-textarea"
            placeholder="Outline job responsibilities, required qualifications, and package details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="widget-button">
          <FileText size={16} />
          Publish Opening Now
        </button>
      </form>
    </div>
  );
};
