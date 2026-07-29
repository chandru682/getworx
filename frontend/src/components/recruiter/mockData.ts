import type { Candidate, RecruiterJob, Interview, Task, MessageThread, RecruiterNotification } from './types';

export const mockJobs: RecruiterJob[] = [
  {
    id: 'job-1',
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Bengaluru, India (Hybrid)',
    employmentType: 'Full-time',
    experience: '5-8 years',
    salaryRange: '$60k - $85k',
    applications: 48,
    shortlisted: 12,
    interviewProgress: 4,
    status: 'active',
    postedDate: '2026-07-15',
    description: 'We are looking for a Senior React Developer who will lead our web application team, designing and implementing scalable frontend architectures with top-tier performance.',
    requirements: ['React 18/19', 'TypeScript', 'State management (Redux/Zustand)', 'Performance optimization', 'Web accessibility (WCAG)']
  },
  {
    id: 'job-2',
    title: 'Lead AI Engineer',
    department: 'AI & Data Science',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    experience: '8+ years',
    salaryRange: '$180k - $240k',
    applications: 32,
    shortlisted: 8,
    interviewProgress: 3,
    status: 'active',
    postedDate: '2026-07-20',
    description: 'Lead the development of generative AI pipelines, LLM fine-tuning, and scalable agent architectures for candidate matchmaking algorithms.',
    requirements: ['Python / PyTorch', 'LLMs (GPT-4, Claude, Gemini)', 'Retrieval-Augmented Generation (RAG)', 'Vector DBs (Pinecone/Milvus)', 'Kubernetes & AWS']
  },
  {
    id: 'job-3',
    title: 'HR Business Partner',
    department: 'People Operations',
    location: 'London, UK (Hybrid)',
    employmentType: 'Full-time',
    experience: '4-7 years',
    salaryRange: '£55k - £70k',
    applications: 19,
    shortlisted: 3,
    interviewProgress: 1,
    status: 'active',
    postedDate: '2026-07-22',
    description: 'Work closely with leadership to scale our UK and EU engineering offices, coordinating recruitment and driving culture and employee engagement.',
    requirements: ['CIPD Level 5 or equivalent', 'Talent Acquisition background', 'UK employment law knowledge', 'Employee relations management']
  },
  {
    id: 'job-4',
    title: 'Node.js Developer (Mid-Level)',
    department: 'Engineering',
    location: 'Mumbai, India (In-Office)',
    employmentType: 'Full-time',
    experience: '3-5 years',
    salaryRange: '₹15L - ₹24L',
    applications: 84,
    shortlisted: 15,
    interviewProgress: 6,
    status: 'active',
    postedDate: '2026-07-10',
    description: 'Join our backend squad to build and scale high-throughput REST and GraphQL APIs. Focus on microservices and real-time candidate notifications.',
    requirements: ['Node.js / Express', 'TypeScript', 'PostgreSQL & Redis', 'Docker', 'AWS ECS']
  },
  {
    id: 'job-5',
    title: 'Staff Product Designer',
    department: 'Product Design',
    location: 'Berlin, Germany (Remote)',
    employmentType: 'Full-time',
    experience: '7+ years',
    salaryRange: '€80k - €100k',
    applications: 27,
    shortlisted: 9,
    interviewProgress: 2,
    status: 'paused',
    postedDate: '2026-07-02',
    description: 'Take ownership of the candidate experience and recruiter portal designs, collaborating on UX research and high-fidelity prototypes.',
    requirements: ['Figma expertise', 'Design Systems management', 'UX Research methods', 'Interactive prototyping']
  },
  {
    id: 'job-6',
    title: 'Technical Recruiter',
    department: 'Talent Acquisition',
    location: 'Bengaluru, India (Hybrid)',
    employmentType: 'Full-time',
    experience: '2-4 years',
    salaryRange: '₹8L - ₹12L',
    applications: 112,
    shortlisted: 6,
    interviewProgress: 2,
    status: 'active',
    postedDate: '2026-07-24',
    description: 'We are expanding our internal hiring team. Help us source, screen, and close top engineering talent worldwide.',
    requirements: ['Tech hiring background', 'LinkedIn Recruiter proficiency', 'Excellent written & verbal communication', 'ATS management']
  },
  {
    id: 'job-7',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    location: 'Austin, TX (Hybrid)',
    employmentType: 'Full-time',
    experience: '3-6 years',
    salaryRange: '$90k - $120k',
    applications: 35,
    shortlisted: 4,
    interviewProgress: 0,
    status: 'draft',
    postedDate: '2026-07-27',
    description: 'Establish testing frameworks, write reliable automation scripts, and manage CI/CD test automation runs for our mobile and web apps.',
    requirements: ['Selenium / Playwright', 'Python or TypeScript', 'CI/CD pipeline integration', 'API testing tools']
  },
  {
    id: 'job-8',
    title: 'DevOps Architect',
    department: 'Infrastructure',
    location: 'Toronto, Canada (Remote)',
    employmentType: 'Full-time',
    experience: '8+ years',
    salaryRange: '$140k - $180k',
    applications: 18,
    shortlisted: 2,
    interviewProgress: 1,
    status: 'closed',
    postedDate: '2026-06-15',
    description: 'Architect secure, self-healing, multi-region cloud infrastructure using Terraform, Kubernetes, and AWS automation pipelines.',
    requirements: ['Terraform / CloudFormation', 'Kubernetes (EKS)', 'CI/CD (GitHub Actions/GitLab)', 'Cybersecurity compliance (SOC2)']
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Alex Morgan',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Senior Frontend Engineer',
    experienceYears: 6,
    skills: ['React', 'TypeScript', 'Redux', 'CSS Grid', 'Tailwind', 'Next.js', 'Webpack'],
    location: 'Bengaluru, India',
    currentCompany: 'TechnoLabs Corp',
    currentSalary: '₹22,00,000',
    expectedSalary: '₹30,00,000',
    noticePeriod: 'Immediate',
    availability: 'Immediate',
    resumeScore: 92,
    aiMatchScore: 95,
    currentStage: 'interview2',
    email: 'alex.morgan@email.com',
    phone: '+91 98765 43210',
    professionalSummary: 'Creative and detail-oriented Senior Frontend Developer with 6 years of experience building and optimizing modern responsive web apps. Expert in React and TypeScript architectures with a strong focus on core web vitals and accessible designs.',
    experienceTimeline: [
      {
        id: 'exp-1-1',
        role: 'Senior Frontend Engineer',
        company: 'TechnoLabs Corp',
        duration: '2023 - Present',
        description: 'Led the UI redesign of the main enterprise analytics dashboard. Migrated 4 legacy modules to React 18 & TS, reducing page bundle sizes by 32% and load times by 1.8 seconds.'
      },
      {
        id: 'exp-1-2',
        role: 'Software Engineer',
        company: 'WebSphere Ltd',
        duration: '2020 - 2023',
        description: 'Developed reusable component libraries using React and Styled Components. Integrated GraphQL APIs and handled client-side caching strategies.'
      }
    ],
    education: [
      {
        id: 'edu-1-1',
        degree: 'Bachelor of Technology in Computer Science',
        school: 'National Institute of Technology',
        duration: '2016 - 2020'
      }
    ],
    projects: [
      {
        id: 'proj-1-1',
        title: 'GetWorxs UI Kit',
        description: 'An open-source accessible React design system compliant with WCAG AA guidelines.',
        techStack: ['React', 'CSS Modules', 'Storybook']
      }
    ],
    certifications: ['AWS Certified Developer - Associate', 'Google UX Design Specialization'],
    languages: ['English (Fluent)', 'Hindi (Native)'],
    resumeUrl: '/resumes/alex_morgan_resume.pdf',
    portfolioUrl: 'https://alexmorgan.dev',
    socialLinks: {
      linkedin: 'linkedin.com/in/alexmorgan',
      github: 'github.com/alexm-dev'
    },
    recruiterNotes: [
      {
        id: 'note-1-1',
        author: 'Sarah Connor',
        text: 'Strong frontend fundamentals. Solved the coding test with optimal time complexity and clean design patterns. Candidate is immediate joiner.',
        date: '2026-07-25'
      }
    ],
    activityTimeline: [
      {
        id: 'act-1-1',
        event: 'Interview Round 2 Completed',
        time: 'Today, 10:00 AM',
        details: 'Evaluated by Lead Frontend Architect. Rated 4.5/5.'
      },
      {
        id: 'act-1-2',
        event: 'Sourced by AI Matcher',
        time: '2026-07-20',
        details: 'Identified as a 95% match for Senior React Developer position.'
      }
    ],
    documents: [
      { id: 'doc-1-1', name: 'Resume_Alex_Morgan.pdf', size: '1.2 MB', type: 'pdf' },
      { id: 'doc-1-2', name: 'Offer_Details.pdf', size: '240 KB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-2',
    name: 'David Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Lead Machine Learning Engineer',
    experienceYears: 9,
    skills: ['Python', 'PyTorch', 'Transformers', 'LLMs', 'LangChain', 'Kubernetes', 'FastAPI'],
    location: 'San Francisco, CA',
    currentCompany: 'NeuralFlow AI',
    currentSalary: '$170,000',
    expectedSalary: '$210,000',
    noticePeriod: '30 Days',
    availability: '30 Days',
    resumeScore: 89,
    aiMatchScore: 98,
    currentStage: 'final',
    email: 'david.chen@email.com',
    phone: '+1 (415) 555-0199',
    professionalSummary: 'Staff AI Engineer specializing in LLM applications, reinforcement learning, and productionizing vector search systems. Proven experience running machine learning pipelines at scale serving millions of daily active users.',
    experienceTimeline: [
      {
        id: 'exp-2-1',
        role: 'Lead ML Engineer',
        company: 'NeuralFlow AI',
        duration: '2022 - Present',
        description: 'Spearheaded development of a multi-agent AI customer support agent using RAG and LangGraph, increasing customer query deflection rates by 40%.'
      },
      {
        id: 'exp-2-2',
        role: 'Senior Data Scientist',
        company: 'SearchOptima',
        duration: '2018 - 2022',
        description: 'Optimized search indexing models utilizing custom BERT weights, improving click-through rate by 14% across product query searches.'
      }
    ],
    education: [
      {
        id: 'edu-2-1',
        degree: 'Master of Science in Artificial Intelligence',
        school: 'Stanford University',
        duration: '2016 - 2018'
      }
    ],
    projects: [
      {
        id: 'proj-2-1',
        title: 'OpenAgenticFramework',
        description: 'Lightweight agent execution framework supporting local model hosting and safety guardrails.',
        techStack: ['Python', 'LlamaIndex', 'FastAPI']
      }
    ],
    certifications: ['NVIDIA Deep Learning Institute Specialist'],
    languages: ['English (Fluent)', 'Mandarin (Native)'],
    resumeUrl: '/resumes/david_chen_resume.pdf',
    portfolioUrl: 'https://dchen-ml.ai',
    socialLinks: {
      linkedin: 'linkedin.com/in/dchen-ml',
      github: 'github.com/dchen-ai'
    },
    recruiterNotes: [
      {
        id: 'note-2-1',
        author: 'Robert Lee',
        text: 'Outstanding knowledge of agent architectures. Highly recommended for Lead AI role.',
        date: '2026-07-23'
      }
    ],
    activityTimeline: [
      {
        id: 'act-2-1',
        event: 'Final Technical Round Scheduled',
        time: 'Tomorrow, 2:00 PM',
        details: 'Panel: CTO and VP of AI Engineering.'
      }
    ],
    documents: [
      { id: 'doc-2-1', name: 'David_Chen_Resume.pdf', size: '2.1 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-3',
    name: 'Priya Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Senior Talent Partner',
    experienceYears: 5,
    skills: ['Talent Sourcing', 'LinkedIn Recruiter', 'Compensation Negotiation', 'Workday', 'Employee Engagement'],
    location: 'London, UK',
    currentCompany: 'GlobalTech Hiring',
    currentSalary: '£50,000',
    expectedSalary: '£62,000',
    noticePeriod: '15 Days',
    availability: '15 Days',
    resumeScore: 85,
    aiMatchScore: 91,
    currentStage: 'offer',
    email: 'priya.sharma@email.com',
    phone: '+44 20 7946 0958',
    professionalSummary: 'Result-oriented Technical Recruiter with a rich history of sourcing top engineering talent across the UK and Europe. Passionate about builder-friendly candidate pipelines and modern data-driven TA.',
    experienceTimeline: [
      {
        id: 'exp-3-1',
        role: 'Senior Talent Partner',
        company: 'GlobalTech Hiring',
        duration: '2023 - Present',
        description: 'Successfully placed 30+ engineering roles including Staff and Principal levels. Handled complete candidate onboarding workflows.'
      }
    ],
    education: [
      {
        id: 'edu-3-1',
        degree: 'MA in Human Resource Management',
        school: 'University of Westminster',
        duration: '2019 - 2021'
      }
    ],
    projects: [],
    certifications: ['CIPD Level 5 Associate Diploma'],
    languages: ['English (Fluent)', 'Punjabi (Conversational)'],
    resumeUrl: '/resumes/priya_sharma_resume.pdf',
    socialLinks: {
      linkedin: 'linkedin.com/in/priyasharmata'
    },
    recruiterNotes: [
      {
        id: 'note-3-1',
        author: 'Sarah Connor',
        text: 'Offer has been sent. Candidate is happy with the terms and will sign by end of week.',
        date: '2026-07-26'
      }
    ],
    activityTimeline: [
      {
        id: 'act-3-1',
        event: 'Offer Released',
        time: '2026-07-26',
        details: 'Sent via GetWorxs Recruit portal.'
      }
    ],
    documents: [
      { id: 'doc-3-1', name: 'Priya_Resume.pdf', size: '890 KB', type: 'pdf' },
      { id: 'doc-3-2', name: 'Signed_Offer_Letter.pdf', size: '1.4 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-4',
    name: 'Marcus Aurelius',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Node.js Developer',
    experienceYears: 4,
    skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'PostgreSQL', 'Jest'],
    location: 'Mumbai, India',
    currentCompany: 'WebData Solutions',
    currentSalary: '₹12,00,000',
    expectedSalary: '₹18,00,000',
    noticePeriod: 'Immediate',
    availability: 'Immediate',
    resumeScore: 82,
    aiMatchScore: 88,
    currentStage: 'screening',
    email: 'marcus.a@email.com',
    phone: '+91 91234 56789',
    professionalSummary: 'Backend engineer focused on scalable microservices APIs. Highly proficient in TypeScript development, PostgreSQL queries, and Redis caching layers.',
    experienceTimeline: [
      {
        id: 'exp-4-1',
        role: 'Software Engineer (Backend)',
        company: 'WebData Solutions',
        duration: '2022 - Present',
        description: 'Maintained API routes processing 10k requests per minute. Scaled PostgreSQL schemas using connection pooling and custom indices.'
      }
    ],
    education: [
      {
        id: 'edu-4-1',
        degree: 'Bachelor of Science in Information Technology',
        school: 'University of Mumbai',
        duration: '2018 - 2022'
      }
    ],
    projects: [],
    certifications: [],
    languages: ['English (Fluent)', 'Marathi (Native)'],
    resumeUrl: '/resumes/marcus_resume.pdf',
    socialLinks: {
      github: 'github.com/marcus-backend'
    },
    recruiterNotes: [],
    activityTimeline: [
      {
        id: 'act-4-1',
        event: 'Screening Call Scheduled',
        time: '2026-07-29, 3:30 PM',
        details: 'Assigned to Tech Recruiter Rahul.'
      }
    ],
    documents: [
      { id: 'doc-4-1', name: 'Marcus_Aurelius_Resume.pdf', size: '1.0 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-5',
    name: 'Elena Rostova',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Senior Product Designer',
    experienceYears: 8,
    skills: ['Figma', 'User Research', 'Design Systems', 'UX Prototypes', 'Illustration'],
    location: 'Berlin, Germany',
    currentCompany: 'Kreativ Studio',
    currentSalary: '€72,000',
    expectedSalary: '€85,000',
    noticePeriod: '60 Days',
    availability: '60 Days',
    resumeScore: 90,
    aiMatchScore: 94,
    currentStage: 'shortlisted',
    email: 'elena.rostova@email.com',
    phone: '+49 176 12345678',
    professionalSummary: 'Passionate UX Designer obsessed with pixel-perfection and atomic design principles. Experienced in redesigning complex enterprise web portals and building scalable design components.',
    experienceTimeline: [
      {
        id: 'exp-5-1',
        role: 'Senior Product Designer',
        company: 'Kreativ Studio',
        duration: '2020 - Present',
        description: 'Established the corporate design system in Figma. Coordinated customer interviews that boosted usability scores by 25%.'
      }
    ],
    education: [
      {
        id: 'edu-5-1',
        degree: 'Bachelor of Fine Arts in Graphic Design',
        school: 'Bauhaus-Universität Weimar',
        duration: '2012 - 2016'
      }
    ],
    projects: [],
    certifications: [],
    languages: ['German (Fluent)', 'Russian (Native)', 'English (Fluent)'],
    resumeUrl: '/resumes/elena_design.pdf',
    portfolioUrl: 'https://elenarostova.co',
    socialLinks: {
      linkedin: 'linkedin.com/in/elenarostova'
    },
    recruiterNotes: [
      {
        id: 'note-5-1',
        author: 'Sarah Connor',
        text: 'Stunning design portfolio. Beautiful mobile and dashboard layouts. Shortlisted for Staff Designer.',
        date: '2026-07-24'
      }
    ],
    activityTimeline: [
      {
        id: 'act-5-1',
        event: 'Shortlisted by Recruiter',
        time: '2026-07-24',
        details: 'Added notes about Figma design system.'
      }
    ],
    documents: [
      { id: 'doc-5-1', name: 'Elena_Rostova_Resume.pdf', size: '3.4 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-6',
    name: 'Kenji Sato',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'QA Automation Engineer',
    experienceYears: 5,
    skills: ['Selenium', 'Playwright', 'Python', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Postman'],
    location: 'Tokyo, Japan',
    currentCompany: 'Nippon Systems',
    currentSalary: '¥6,800,000',
    expectedSalary: '¥8,500,000',
    noticePeriod: '30 Days',
    availability: '30 Days',
    resumeScore: 84,
    aiMatchScore: 89,
    currentStage: 'applied',
    email: 'kenji.sato@email.jp',
    phone: '+81 90-1234-5678',
    professionalSummary: 'Detail-oriented QA Automation specialist. Expert in building end-to-end testing suits for React-based single page applications, reporting flaky tests, and integrating CI gates.',
    experienceTimeline: [
      {
        id: 'exp-6-1',
        role: 'QA Engineer',
        company: 'Nippon Systems',
        duration: '2021 - Present',
        description: 'Configured Playwright automation pipelines that cut regression test cycles from 48 hours to 2 hours. Reduced production hotfixes by 15%.'
      }
    ],
    education: [
      {
        id: 'edu-6-1',
        degree: 'Bachelor of Engineering',
        school: 'Waseda University',
        duration: '2016 - 2020'
      }
    ],
    projects: [],
    certifications: ['ISTQB Certified Tester'],
    languages: ['Japanese (Native)', 'English (Fluent)'],
    resumeUrl: '/resumes/kenji_sato_qa.pdf',
    socialLinks: {
      github: 'github.com/kenji-sato-qa'
    },
    recruiterNotes: [],
    activityTimeline: [
      {
        id: 'act-6-1',
        event: 'Applied Online',
        time: 'Yesterday, 8:45 PM',
        details: 'Applied to QA Automation opening via GetWorxs candidate portal.'
      }
    ],
    documents: [
      { id: 'doc-6-1', name: 'Kenji_Sato_Resume.pdf', size: '1.1 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-7',
    name: 'Sarah Jenkins',
    photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Principal DevOps Architect',
    experienceYears: 10,
    skills: ['Kubernetes', 'Terraform', 'Docker', 'AWS', 'Python', 'CI/CD', 'Bash', 'Vault'],
    location: 'Austin, TX',
    currentCompany: 'CloudScale Inc',
    currentSalary: '$180,000',
    expectedSalary: '$220,000',
    noticePeriod: '30 Days',
    availability: '30 Days',
    resumeScore: 94,
    aiMatchScore: 97,
    currentStage: 'interview1',
    email: 'sarah.j@email.com',
    phone: '+1 (512) 555-0145',
    professionalSummary: 'Senior Systems Architect with extensive background managing cloud resources, orchestrating containers, and optimizing server costs. Designed multi-cloud setups for SOC2 compliance.',
    experienceTimeline: [
      {
        id: 'exp-7-1',
        role: 'DevOps Architect',
        company: 'CloudScale Inc',
        duration: '2020 - Present',
        description: 'Designed secure AWS Kubernetes networks. Managed $2M cloud budget, scaling down idle resources to save $350k annually.'
      }
    ],
    education: [
      {
        id: 'edu-7-1',
        degree: 'BS in Computer Science',
        school: 'University of Texas at Austin',
        duration: '2012 - 2016'
      }
    ],
    projects: [],
    certifications: ['AWS Certified Solutions Architect - Professional', 'Certified Kubernetes Administrator (CKA)'],
    languages: ['English (Native)'],
    resumeUrl: '/resumes/sarah_j_devops.pdf',
    socialLinks: {
      linkedin: 'linkedin.com/in/sarahjops',
      github: 'github.com/s-jenkins-ops'
    },
    recruiterNotes: [],
    activityTimeline: [
      {
        id: 'act-7-1',
        event: 'Technical Screen Scheduled',
        time: '2026-07-30, 9:00 AM',
        details: 'Assigned to Infrastructure Lead Bobby.'
      }
    ],
    documents: [
      { id: 'doc-7-1', name: 'Sarah_Jenkins_Resume.pdf', size: '2.5 MB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-8',
    name: 'Carlos Ruiz',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'Full Stack JavaScript Engineer',
    experienceYears: 5,
    skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'Docker', 'GraphQL'],
    location: 'Madrid, Spain',
    currentCompany: 'FinTech Iberia',
    currentSalary: '€48,000',
    expectedSalary: '€58,000',
    noticePeriod: 'Immediate',
    availability: 'Immediate',
    resumeScore: 88,
    aiMatchScore: 92,
    currentStage: 'joined',
    email: 'carlos.ruiz@email.es',
    phone: '+34 612 345 678',
    professionalSummary: 'Full-stack Javascript specialist. Comfortable building clean web modules using React and Node.js with end-to-end type safety.',
    experienceTimeline: [
      {
        id: 'exp-8-1',
        role: 'Full Stack Engineer',
        company: 'FinTech Iberia',
        duration: '2022 - 2026',
        description: 'Managed user-facing trading screens. Integrated REST APIs, optimized SQL execution paths, and maintained Cypress test suites.'
      }
    ],
    education: [
      {
        id: 'edu-8-1',
        degree: 'Degree in Software Engineering',
        school: 'Universidad Politécnica de Madrid',
        duration: '2017 - 2021'
      }
    ],
    projects: [],
    certifications: [],
    languages: ['Spanish (Native)', 'English (Fluent)'],
    resumeUrl: '/resumes/carlos_ruiz_resume.pdf',
    socialLinks: {
      linkedin: 'linkedin.com/in/carlosruizdev'
    },
    recruiterNotes: [
      {
        id: 'note-8-1',
        author: 'Robert Lee',
        text: 'Excellent candidate, signed and successfully onboarded on July 24.',
        date: '2026-07-24'
      }
    ],
    activityTimeline: [
      {
        id: 'act-8-1',
        event: 'Joined Company',
        time: '2026-07-24',
        details: 'Carlos has successfully completed onboarding.'
      }
    ],
    documents: [
      { id: 'doc-8-1', name: 'Carlos_Ruiz_Resume.pdf', size: '1.3 MB', type: 'pdf' },
      { id: 'doc-8-2', name: 'Onboarding_Declaration.pdf', size: '450 KB', type: 'pdf' }
    ]
  },
  {
    id: 'cand-9',
    name: 'Emily Watson',
    photoUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&auto=format&fit=crop&q=80',
    currentDesignation: 'UI Developer',
    experienceYears: 3,
    skills: ['React', 'CSS Flexbox', 'Sass', 'Figma', 'JavaScript', 'HTML5'],
    location: 'London, UK',
    currentCompany: 'Agency Pixel',
    currentSalary: '£38,000',
    expectedSalary: '£46,000',
    noticePeriod: '30 Days',
    availability: '30 Days',
    resumeScore: 78,
    aiMatchScore: 82,
    currentStage: 'rejected',
    email: 'emily.w@email.com',
    phone: '+44 7700 900077',
    professionalSummary: 'UI Developer specializing in HTML5 and responsive CSS implementations. Experienced in converting Figma mockups into interactive React screens.',
    experienceTimeline: [
      {
        id: 'exp-9-1',
        role: 'Frontend UI Dev',
        company: 'Agency Pixel',
        duration: '2023 - Present',
        description: 'Coded responsive product layouts for client web spaces. Handled styling refactors and accessibility testing.'
      }
    ],
    education: [
      {
        id: 'edu-9-1',
        degree: 'BA in Creative Computing',
        school: 'Goldsmiths, University of London',
        duration: '2020 - 2023'
      }
    ],
    projects: [],
    certifications: [],
    languages: ['English (Native)'],
    resumeUrl: '/resumes/emily_w_ui.pdf',
    socialLinks: {},
    recruiterNotes: [
      {
        id: 'note-9-1',
        author: 'Rahul Verma',
        text: 'Lacked deep TypeScript knowledge required for the senior positions. Politely rejected.',
        date: '2026-07-22'
      }
    ],
    activityTimeline: [
      {
        id: 'act-9-1',
        event: 'Application Rejected',
        time: '2026-07-22',
        details: 'Automated rejection email sent.'
      }
    ],
    documents: [
      { id: 'doc-9-1', name: 'Emily_Watson_Resume.pdf', size: '1.8 MB', type: 'pdf' }
    ]
  }
];

export const mockInterviews: Interview[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    candidateName: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: '2026-07-28',
    time: '10:00 AM',
    type: 'React Architecture Screen',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    linkType: 'google',
    panel: ['Sarah Connor', 'Jonathan Vance (Lead UI)'],
    feedback: 'Excellent grasp of React rendering mechanics, concurrent features, and performance tuning. Highly articulate.',
    rating: 5,
    aiSummary: 'Candidate demonstrated exceptional understanding of code modularization, custom hooks, and virtual memory profiles. AI recommendation: Proceed to Offer.',
    status: 'today'
  },
  {
    id: 'int-2',
    candidateId: 'cand-7',
    candidateName: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    date: '2026-07-30',
    time: '09:00 AM',
    type: 'Kubernetes Deep-Dive',
    meetingLink: 'https://zoom.us/j/987654321',
    linkType: 'zoom',
    panel: ['Bobby Axlerod (DevOps)', 'Dave Miller'],
    status: 'upcoming'
  },
  {
    id: 'int-3',
    candidateId: 'cand-2',
    candidateName: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: '2026-07-29',
    time: '02:00 PM',
    type: 'Generative AI Pipeline Assessment',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/1234',
    linkType: 'teams',
    panel: ['Robert Lee (CTO)', 'Lisa Simpson'],
    status: 'upcoming'
  },
  {
    id: 'int-4',
    candidateId: 'cand-5',
    candidateName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    date: '2026-07-27',
    time: '04:00 PM',
    type: 'Portfolio Review',
    meetingLink: 'https://meet.google.com/xyz-pdq-rst',
    linkType: 'google',
    panel: ['Sarah Connor', 'Tina Fey (Creative Dir)'],
    feedback: 'Highly interactive user profiles. Solid grasp of Figma components. Needs minor alignment with product systems.',
    rating: 4,
    aiSummary: 'Strong architectural designer. Demonstrated consistent atomic design principles and user empathy. AI recommendation: Proceed to technical round.',
    status: 'completed'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review Alex Morgan Offer Details',
    priority: 'high',
    dueDate: '2026-07-29',
    candidateName: 'Alex Morgan',
    status: 'todo',
    category: 'Offer Approval'
  },
  {
    id: 'task-2',
    title: 'Conduct Screening Call with Marcus',
    priority: 'medium',
    dueDate: '2026-07-29',
    candidateName: 'Marcus Aurelius',
    status: 'in_progress',
    category: 'Call Candidate'
  },
  {
    id: 'task-3',
    title: 'Draft Senior AI Engineer JD',
    priority: 'low',
    dueDate: '2026-07-31',
    status: 'todo',
    category: 'Review Resume'
  },
  {
    id: 'task-4',
    title: 'Background Verification for Priya',
    priority: 'high',
    dueDate: '2026-07-28',
    candidateName: 'Priya Sharma',
    status: 'completed',
    category: 'Background Verification'
  },
  {
    id: 'task-5',
    title: 'Follow Up with Carlos Ruiz Onboarding Docs',
    priority: 'medium',
    dueDate: '2026-07-28',
    candidateName: 'Carlos Ruiz',
    status: 'completed',
    category: 'Follow Up'
  }
];

export const mockThreads: MessageThread[] = [
  {
    id: 'thread-1',
    type: 'candidate',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Awesome, I am ready for the technical screening tomorrow.',
    time: '10:45 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1-1',
        sender: 'recruiter',
        senderName: 'Sarah Connor',
        text: 'Hi Alex, I have scheduled your React Architecture screening for tomorrow at 10 AM. It will be conducted by Jonathan Vance.',
        time: 'Yesterday, 4:00 PM',
        read: true
      },
      {
        id: 'm1-2',
        sender: 'candidate',
        senderName: 'Alex Morgan',
        text: 'Awesome, I am ready for the technical screening tomorrow. Will it involve coding live, or is it more design-centric?',
        time: 'Today, 10:45 AM',
        read: false
      }
    ]
  },
  {
    id: 'thread-2',
    type: 'employer',
    name: 'CTO Robert Lee',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Let us extend the offer to Priya by EOD.',
    time: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm2-1',
        sender: 'employer',
        senderName: 'Robert Lee',
        text: 'Priya' + "'" + 's final discussion went really well. Let us extend the offer to her by EOD. Can you draft it?',
        time: 'Yesterday, 3:15 PM',
        read: true
      }
    ]
  },
  {
    id: 'thread-3',
    type: 'internal',
    name: 'HR Operations Group',
    avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Rahul: Updated candidate portal configs.',
    time: '2 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm3-1',
        sender: 'internal',
        senderName: 'Rahul Verma',
        text: 'Updated candidate portal configs. The resume parsing OCR endpoint is live now.',
        time: '2 days ago',
        read: true
      }
    ]
  }
];

export const mockNotifications: RecruiterNotification[] = [
  {
    id: 'notif-1',
    type: 'new_applicant',
    title: 'New Applicant Sourced',
    message: 'Alex Morgan applied for Senior React Developer position. AI Score: 95%.',
    time: '2 hours ago',
    read: false,
    category: 'applicant'
  },
  {
    id: 'notif-2',
    type: 'interview_reminder',
    title: 'Upcoming Interview',
    message: 'Technical Screen with Alex Morgan starts in 1 hour.',
    time: '1 hour ago',
    read: false,
    category: 'reminder'
  },
  {
    id: 'notif-3',
    type: 'resume_uploaded',
    title: 'Resume Inbox Uploaded',
    message: 'Parsed resume of Kenji Sato. Extracted skills: Selenium, Playwright.',
    time: 'Yesterday',
    read: true,
    category: 'general'
  },
  {
    id: 'notif-4',
    type: 'offer_accepted',
    title: 'Offer Accepted!',
    message: 'Priya Sharma accepted the HR Business Partner offer.',
    time: 'Yesterday',
    read: true,
    category: 'general'
  },
  {
    id: 'notif-5',
    type: 'ai_recommendation',
    title: 'AI Candidate Match',
    message: 'Top match recommendation generated for Lead AI Engineer: David Chen (98%).',
    time: '3 days ago',
    read: true,
    category: 'ai'
  }
];
export const mockRecruiterProfile = {
  name: 'Sarah Connor',
  designation: 'Principal Talent Acquisition Partner',
  department: 'Global Technology Recruiting',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  performanceScore: 96,
  achievements: [
    'Hired 45+ engineers in 2025',
    'Reduced average time-to-hire by 14 days',
    'Maintained 94% candidate satisfaction score'
  ],
  recruiterRank: '#3 Global',
  badges: ['Elite Closer', 'AI Recruiter Pro', 'Talent Magnet']
};
