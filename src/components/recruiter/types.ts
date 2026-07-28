export interface RecruiterJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experience: string;
  salaryRange: string;
  applications: number;
  shortlisted: number;
  interviewProgress: number;
  status: 'active' | 'draft' | 'paused' | 'closed';
  postedDate: string;
  description?: string;
  requirements?: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  duration: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface ActivityItem {
  id: string;
  event: string;
  time: string;
  details?: string;
  icon?: string;
}

export interface RecruiterNote {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Candidate {
  id: string;
  name: string;
  photoUrl: string;
  currentDesignation: string;
  experienceYears: number;
  skills: string[];
  location: string;
  currentCompany: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  availability: 'Immediate' | '15 Days' | '30 Days' | '60 Days' | '90 Days';
  resumeScore: number; // 0-100
  aiMatchScore: number; // 0-100
  currentStage: 'applied' | 'screening' | 'shortlisted' | 'interview1' | 'interview2' | 'final' | 'offer' | 'joined' | 'rejected';
  
  // Profile details
  email: string;
  phone: string;
  professionalSummary: string;
  experienceTimeline: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  languages: string[];
  resumeUrl: string;
  portfolioUrl?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  recruiterNotes: RecruiterNote[];
  activityTimeline: ActivityItem[];
  documents: { id: string; name: string; size: string; type: string }[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  avatar: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: string; // e.g. Technical Round 1
  meetingLink: string;
  linkType: 'google' | 'teams' | 'zoom';
  panel: string[];
  feedback?: string;
  rating?: number; // 1-5 stars
  aiSummary?: string;
  status: 'upcoming' | 'today' | 'completed' | 'cancelled';
}

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  candidateName?: string;
  status: 'todo' | 'in_progress' | 'completed';
  category: 'Review Resume' | 'Call Candidate' | 'Schedule Interview' | 'Follow Up' | 'Offer Approval' | 'Background Verification';
}

export interface Message {
  id: string;
  sender: 'recruiter' | 'candidate' | 'employer' | 'internal';
  senderName: string;
  text: string;
  time: string;
  read: boolean;
  voiceNoteUrl?: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface MessageThread {
  id: string;
  type: 'candidate' | 'employer' | 'internal';
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: Message[];
}

export interface RecruiterNotification {
  id: string;
  type: 'new_applicant' | 'interview_reminder' | 'resume_uploaded' | 'offer_accepted' | 'task_reminder' | 'ai_recommendation';
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'ai' | 'reminder' | 'applicant' | 'general';
}
