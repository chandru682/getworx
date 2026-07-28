import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronDown,
  Edit,
  Copy,
  Pause,
  Play,
  XCircle,
  Trash2,
  BarChart4
} from 'lucide-react';
import type { RecruiterJob } from './types';

interface JobsTabProps {
  jobs: RecruiterJob[];
  onAddJob: (job: RecruiterJob) => void;
  onUpdateJob: (jobId: string, updates: Partial<RecruiterJob>) => void;
  onDeleteJob: (jobId: string) => void;
  openCreateJobModal: () => void;
  openAiJdGenerator: () => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  openCreateJobModal,
  openAiJdGenerator
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'paused' | 'closed'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'title' | 'applications' | 'postedDate'>('postedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(jobs.map(j => j.department)));

  // Handle Sort Toggle
  const handleSort = (field: 'title' | 'applications' | 'postedDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and Sort Jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchDept = deptFilter === 'all' || job.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'applications') {
        comparison = a.applications - b.applications;
      } else if (sortField === 'postedDate') {
        comparison = a.postedDate.localeCompare(b.postedDate);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Bulk action handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobIds(filteredJobs.map(j => j.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobIds([...selectedJobIds, jobId]);
    } else {
      setSelectedJobIds(selectedJobIds.filter(id => id !== jobId));
    }
  };

  const handleBulkStatusChange = (status: 'active' | 'paused' | 'closed') => {
    selectedJobIds.forEach(id => onUpdateJob(id, { status }));
    setSelectedJobIds([]);
    alert(`Successfully updated status to ${status} for ${selectedJobIds.length} jobs.`);
  };

  const handleDuplicateJob = (job: RecruiterJob) => {
    const duplicatedJob: RecruiterJob = {
      ...job,
      id: `job-${Date.now()}`,
      title: `${job.title} (Copy)`,
      applications: 0,
      shortlisted: 0,
      interviewProgress: 0,
      status: 'draft',
      postedDate: new Date().toISOString().split('T')[0]
    };
    onAddJob(duplicatedJob);
    setActiveMenuId(null);
    alert(`Duplicated "${job.title}" into draft position.`);
  };

  return (
    <div className="jobs-tab-workspace">
      {/* Header section with Stats */}
      <div className="jobs-workspace-header">
        <div>
          <h1>Job Openings</h1>
          <p>Create, manage, and distribute job listings across internal and external boards.</p>
        </div>
        <div className="jobs-header-actions">
          <button className="btn-secondary font-sans" onClick={openAiJdGenerator}>
            <Sparkles size={16} />
            <span>AI Copilot JD</span>
          </button>
          <button className="btn-primary font-sans" onClick={openCreateJobModal}>
            <Plus size={16} />
            <span>Create Job Listing</span>
          </button>
        </div>
      </div>

      {/* Mini stats band */}
      <div className="jobs-stats-row">
        <div className="mini-stat">
          <span className="label">Total Openings</span>
          <span className="value">{jobs.length}</span>
        </div>
        <div className="mini-stat">
          <span className="label">Active</span>
          <span className="value green-txt">{jobs.filter(j => j.status === 'active').length}</span>
        </div>
        <div className="mini-stat">
          <span className="label">Paused</span>
          <span className="value orange-txt">{jobs.filter(j => j.status === 'paused').length}</span>
        </div>
        <div className="mini-stat">
          <span className="label">Drafts</span>
          <span className="value gray-txt">{jobs.filter(j => j.status === 'draft').length}</span>
        </div>
      </div>

      {/* Filters & Control bar */}
      <div className="jobs-controls-bar">
        {/* Search */}
        <div className="search-box-wrapper">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search job title, location, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-sans"
          />
        </div>

        {/* Filters Group */}
        <div className="filters-group">
          <div className="filter-dropdown-wrapper">
            <Filter size={14} className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select font-sans"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Drafts</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="filter-dropdown-wrapper">
            <SlidersHorizontal size={14} className="filter-icon" />
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="filter-select font-sans"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions overlay */}
      {selectedJobIds.length > 0 && (
        <div className="bulk-actions-overlay animate-slide-up">
          <div className="bulk-text">
            <span><strong>{selectedJobIds.length}</strong> jobs selected</span>
          </div>
          <div className="bulk-buttons">
            <button className="bulk-btn font-sans" onClick={() => handleBulkStatusChange('active')}>
              <Play size={14} /> Make Active
            </button>
            <button className="bulk-btn font-sans" onClick={() => handleBulkStatusChange('paused')}>
              <Pause size={14} /> Pause
            </button>
            <button className="bulk-btn font-sans" onClick={() => handleBulkStatusChange('closed')}>
              <XCircle size={14} /> Close
            </button>
            <button className="bulk-btn danger font-sans" onClick={() => {
              if(confirm(`Are you sure you want to delete ${selectedJobIds.length} jobs?`)) {
                selectedJobIds.forEach(id => onDeleteJob(id));
                setSelectedJobIds([]);
              }
            }}>
              <Trash2 size={14} /> Delete
            </button>
            <button className="bulk-close-btn" onClick={() => setSelectedJobIds([])}>Cancel</button>
          </div>
        </div>
      )}

      {/* Jobs Grid/Table */}
      <div className="table-responsive-container">
        {filteredJobs.length > 0 ? (
          <table className="jobs-table font-sans">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th onClick={() => handleSort('title')} className="sortable-header">
                  Job Details <ChevronDown size={12} className={sortField === 'title' ? sortOrder : ''} />
                </th>
                <th>Department</th>
                <th>Experience / Type</th>
                <th onClick={() => handleSort('applications')} className="sortable-header">
                  Applications <ChevronDown size={12} className={sortField === 'applications' ? sortOrder : ''} />
                </th>
                <th>Hiring Pipeline</th>
                <th>Status</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} className={`job-row ${selectedJobIds.includes(job.id) ? 'selected' : ''}`}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedJobIds.includes(job.id)}
                      onChange={(e) => handleSelectJob(job.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="job-meta-cell">
                      <span className="job-row-title">{job.title}</span>
                      <div className="job-sub-meta">
                        <span>{job.location}</span>
                        <span className="separator">•</span>
                        <span>{job.salaryRange}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="dept-tag">{job.department}</span>
                  </td>
                  <td>
                    <div className="job-meta-cell">
                      <span className="job-row-exp">{job.experience}</span>
                      <span className="job-sub-meta">{job.employmentType}</span>
                    </div>
                  </td>
                  <td>
                    <div className="applications-metrics">
                      <span className="total-apps">{job.applications} Applied</span>
                      <span className="shortlisted-apps">{job.shortlisted} Shortlisted</span>
                    </div>
                  </td>
                  <td>
                    <div className="pipeline-mini-visual">
                      <div className="progress-bar-pipeline">
                        <div className="progress-bar-fill green" style={{ width: `${(job.shortlisted / (job.applications || 1)) * 100}%` }}></div>
                        <div className="progress-bar-fill purple" style={{ width: `${(job.interviewProgress / (job.applications || 1)) * 100}%` }}></div>
                      </div>
                      <span className="pipeline-label">{job.interviewProgress} in Interview Stage</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge-pill ${job.status}`}>
                      <CheckCircle2 size={12} />
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="relative-cell">
                    <button className="actions-menu-trigger" onClick={() => setActiveMenuId(activeMenuId === job.id ? null : job.id)}>
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === job.id && (
                      <div className="actions-dropdown-menu font-sans animate-fade-in">
                        <button className="dropdown-action-item" onClick={() => {
                          alert(`Viewing full details for: ${job.title}`);
                          setActiveMenuId(null);
                        }}>
                          <BarChart4 size={14} /> View Details
                        </button>
                        <button className="dropdown-action-item" onClick={() => {
                          const newTitle = prompt('Edit Job Title:', job.title);
                          if(newTitle) onUpdateJob(job.id, { title: newTitle });
                          setActiveMenuId(null);
                        }}>
                          <Edit size={14} /> Edit Title
                        </button>
                        <button className="dropdown-action-item" onClick={() => handleDuplicateJob(job)}>
                          <Copy size={14} /> Duplicate Listing
                        </button>
                        {job.status === 'active' ? (
                          <button className="dropdown-action-item" onClick={() => {
                            onUpdateJob(job.id, { status: 'paused' });
                            setActiveMenuId(null);
                          }}>
                            <Pause size={14} /> Pause Job
                          </button>
                        ) : (
                          <button className="dropdown-action-item" onClick={() => {
                            onUpdateJob(job.id, { status: 'active' });
                            setActiveMenuId(null);
                          }}>
                            <Play size={14} /> Activate Job
                          </button>
                        )}
                        <button className="dropdown-action-item danger" onClick={() => {
                          if (confirm(`Are you sure you want to delete ${job.title}?`)) {
                            onDeleteJob(job.id);
                          }
                          setActiveMenuId(null);
                        }}>
                          <Trash2 size={14} /> Delete Listing
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-table-state">
            <Briefcase size={48} className="empty-icon" />
            <h3>No Jobs Found</h3>
            <p>We couldn't find any job listings matching your search terms or filters.</p>
            <button className="btn-secondary font-sans" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDeptFilter('all');
            }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
