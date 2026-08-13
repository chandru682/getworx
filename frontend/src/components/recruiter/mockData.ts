import type { Candidate, RecruiterJob, Interview, Task, MessageThread, RecruiterNotification } from './types';

export const mockJobs: RecruiterJob[] = [];
export const mockCandidates: Candidate[] = [];
export const mockInterviews: Interview[] = [];
export const mockTasks: Task[] = [];
export const mockThreads: MessageThread[] = [];
export const mockNotifications: RecruiterNotification[] = [];

export const mockRecruiterProfile = {
  name: 'Recruiter Account',
  designation: 'Talent Acquisition Partner',
  department: 'Technology Recruiting',
  avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%236366f1"/><text x="50" y="55" font-size="40" font-family="sans-serif" fill="white" dominant-baseline="middle" text-anchor="middle">RA</text></svg>',
  performanceScore: 0,
  achievements: [],
  recruiterRank: 'N/A',
  badges: []
};
