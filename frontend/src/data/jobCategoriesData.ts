export interface JobCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'it',
    name: '1. Information Technology (IT)',
    icon: 'Code2',
    subcategories: [
      'Software Development',
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'Mobile App Development',
      'Web Development',
      'DevOps',
      'Cloud Computing',
      'Cyber Security',
      'Networking',
      'System Administration',
      'Database Administration',
      'Data Engineering',
      'Data Science',
      'AI / Machine Learning',
      'Deep Learning',
      'NLP',
      'Computer Vision',
      'Blockchain',
      'Game Development',
      'Embedded Systems',
      'IoT',
      'QA / Testing',
      'Automation Testing',
      'Manual Testing',
      'UI/UX Design',
      'Product Management',
      'Scrum Master',
      'Technical Support',
      'Help Desk'
    ]
  },
  {
    id: 'bfsi',
    name: '2. Banking, Financial Services & Insurance (BFSI)',
    icon: 'Building2',
    subcategories: [
      'Banking',
      'Retail Banking',
      'Corporate Banking',
      'Investment Banking',
      'Finance',
      'Accounting',
      'Auditing',
      'Taxation',
      'Insurance',
      'Wealth Management',
      'Risk Management',
      'Credit Analysis',
      'Loan Processing',
      'Mortgage',
      'Stock Market',
      'Mutual Funds',
      'FinTech'
    ]
  },
  {
    id: 'sales',
    name: '3. Sales',
    icon: 'TrendingUp',
    subcategories: [
      'Field Sales',
      'Inside Sales',
      'B2B Sales',
      'B2C Sales',
      'Corporate Sales',
      'FMCG Sales',
      'Retail Sales',
      'Automobile Sales',
      'Medical Sales',
      'Software Sales',
      'Real Estate Sales',
      'Direct Sales',
      'Channel Sales',
      'Territory Sales',
      'Key Account Management'
    ]
  },
  {
    id: 'marketing',
    name: '4. Marketing',
    icon: 'Target',
    subcategories: [
      'Digital Marketing',
      'SEO',
      'SEM',
      'PPC',
      'Performance Marketing',
      'Social Media Marketing',
      'Brand Management',
      'Content Marketing',
      'Email Marketing',
      'Affiliate Marketing',
      'Influencer Marketing',
      'Product Marketing',
      'Market Research'
    ]
  },
  {
    id: 'hr',
    name: '5. Human Resources',
    icon: 'Users',
    subcategories: [
      'HR Generalist',
      'Talent Acquisition',
      'Recruitment',
      'Payroll',
      'HR Operations',
      'Learning & Development',
      'Employee Relations',
      'HRBP',
      'Compensation & Benefits'
    ]
  },
  {
    id: 'support',
    name: '6. Customer Support',
    icon: 'Headphones',
    subcategories: [
      'Customer Service',
      'Voice Process',
      'Non Voice',
      'Chat Support',
      'Email Support',
      'Helpdesk & Tech Support',
      'Call Center',
      'BPO',
      'KPO'
    ]
  },
  {
    id: 'engineering',
    name: '7. Engineering',
    icon: 'Cpu',
    subcategories: [
      'Mechanical',
      'Electrical',
      'Electronics',
      'Civil',
      'Chemical',
      'Industrial',
      'Production Engineering',
      'Automobile',
      'Aerospace',
      'Marine',
      'Mechatronics'
    ]
  },
  {
    id: 'manufacturing',
    name: '8. Manufacturing',
    icon: 'Factory',
    subcategories: [
      'Plant Production',
      'Quality Control',
      'Manufacturing QA',
      'Plant Operations',
      'Maintenance',
      'CNC',
      'Machine Operator',
      'Assembly',
      'Packaging',
      'Industrial Safety'
    ]
  },
  {
    id: 'construction',
    name: '9. Construction & Infrastructure',
    icon: 'HardHat',
    subcategories: [
      'Site Engineer',
      'Project Engineer',
      'Quantity Surveyor',
      'Architect',
      'Interior Designer',
      'Structural Engineer',
      'MEP',
      'Planning Engineer'
    ]
  },
  {
    id: 'healthcare',
    name: '10. Healthcare',
    icon: 'HeartPulse',
    subcategories: [
      'Doctor',
      'Surgeon',
      'Nurse',
      'Pharmacist',
      'Dentist',
      'Physiotherapist',
      'Lab Technician',
      'Radiologist',
      'Medical Coding',
      'Medical Transcription',
      'Hospital Administration'
    ]
  },
  {
    id: 'pharmaceutical',
    name: '11. Pharmaceutical',
    icon: 'Pill',
    subcategories: [
      'R&D',
      'Clinical Research',
      'Regulatory Affairs',
      'Pharma QA & QC',
      'Drug Safety',
      'Pharma Manufacturing',
      'Medical Representative'
    ]
  },
  {
    id: 'education',
    name: '12. Education',
    icon: 'GraduationCap',
    subcategories: [
      'Teacher',
      'Lecturer',
      'Professor',
      'Principal',
      'Tutor',
      'Trainer',
      'Online Instructor',
      'Education Counselor'
    ]
  },
  {
    id: 'legal',
    name: '13. Legal',
    icon: 'Scale',
    subcategories: [
      'Advocate',
      'Legal Advisor',
      'Corporate Lawyer',
      'Legal Associate',
      'Compliance Officer',
      'Company Secretary'
    ]
  },
  {
    id: 'government',
    name: '14. Government & Public Sector',
    icon: 'Landmark',
    subcategories: [
      'UPSC',
      'SSC',
      'Banking Exams',
      'Railway',
      'Defence',
      'Police',
      'PSU',
      'State Government',
      'Central Government'
    ]
  },
  {
    id: 'logistics',
    name: '15. Logistics & Supply Chain',
    icon: 'Truck',
    subcategories: [
      'Logistics Warehouse',
      'Procurement',
      'Inventory Management',
      'Supply Chain',
      'Shipping',
      'Transportation',
      'Fleet Management',
      'Export',
      'Import'
    ]
  },
  {
    id: 'aviation',
    name: '16. Aviation',
    icon: 'Plane',
    subcategories: [
      'Pilot',
      'Cabin Crew',
      'Ground Staff',
      'Airport Operations',
      'Aircraft Maintenance'
    ]
  },
  {
    id: 'hospitality',
    name: '17. Hospitality',
    icon: 'UtensilsCrossed',
    subcategories: [
      'Hotel Management',
      'Chef',
      'Restaurant',
      'Housekeeping',
      'Front Office',
      'Travel Consultant',
      'Event Management'
    ]
  },
  {
    id: 'media',
    name: '18. Media & Entertainment',
    icon: 'Film',
    subcategories: [
      'Journalism',
      'Video Editing',
      'Photography',
      'Cinematography',
      'Media Visual Design',
      'Animation',
      'VFX',
      'Music',
      'Acting',
      'Radio Broadcasting',
      'TV'
    ]
  },
  {
    id: 'design',
    name: '19. Design & Creative',
    icon: 'Palette',
    subcategories: [
      'Graphic Design',
      'Motion Graphics',
      'UI Design',
      'UX Design',
      'Product Design',
      'Fashion Design',
      'Interior Design',
      'Industrial Design'
    ]
  },
  {
    id: 'retail',
    name: '20. Retail',
    icon: 'ShoppingBag',
    subcategories: [
      'Cashier',
      'Store Manager',
      'Merchandising',
      'Retail Operations',
      'Inventory',
      'Visual Merchandising'
    ]
  },
  {
    id: 'ecommerce',
    name: '21. E-Commerce',
    icon: 'ShoppingCart',
    subcategories: [
      'Marketplace',
      'Catalog Management',
      'Seller Support',
      'E-Com Warehouse & Fulfillment',
      'Fulfillment',
      'Operations'
    ]
  },
  {
    id: 'agriculture',
    name: '22. Agriculture',
    icon: 'Sprout',
    subcategories: [
      'Agronomy',
      'Dairy',
      'Poultry',
      'Fisheries',
      'Horticulture',
      'Food Processing'
    ]
  },
  {
    id: 'realestate',
    name: '23. Real Estate',
    icon: 'Home',
    subcategories: [
      'Property Consultant',
      'CRM',
      'Sales',
      'Documentation',
      'Leasing'
    ]
  },
  {
    id: 'telecom',
    name: '24. Telecom',
    icon: 'Radio',
    subcategories: [
      'Network Engineer',
      'RF Engineer',
      'Telecom Operations',
      'Fiber Engineer'
    ]
  },
  {
    id: 'energy',
    name: '25. Energy & Utilities',
    icon: 'Zap',
    subcategories: [
      'Oil & Gas',
      'Solar',
      'Wind Energy',
      'Power Plant',
      'Electrical Distribution'
    ]
  },
  {
    id: 'security',
    name: '26. Security Services',
    icon: 'Shield',
    subcategories: [
      'Security Guard',
      'CCTV Operator',
      'Fire Safety',
      'Investigation'
    ]
  },
  {
    id: 'rnd',
    name: '27. Research & Development',
    icon: 'FlaskConical',
    subcategories: [
      'Scientific Research',
      'Biotechnology',
      'Nanotechnology',
      'Laboratory Research'
    ]
  },
  {
    id: 'ngo',
    name: '28. NGO / Social Work',
    icon: 'HeartHandshake',
    subcategories: [
      'Program Manager',
      'Social Worker',
      'CSR',
      'Volunteer'
    ]
  },
  {
    id: 'freelance',
    name: '29. Freelance & Remote',
    icon: 'Laptop',
    subcategories: [
      'Freelancer',
      'Remote Developer',
      'Remote Designer',
      'Remote Marketing',
      'Remote Customer Support'
    ]
  },
  {
    id: 'trades',
    name: '30. Skilled Trades',
    icon: 'Wrench',
    subcategories: [
      'Electrician',
      'Plumber',
      'Welder',
      'Carpenter',
      'Fitter',
      'Machinist',
      'Painter',
      'Technician'
    ]
  },
  {
    id: 'delivery',
    name: '31. Delivery & Transportation',
    icon: 'Navigation',
    subcategories: [
      'Driver',
      'Delivery Executive',
      'Courier',
      'Truck Driver',
      'Bike Delivery'
    ]
  },
  {
    id: 'startup',
    name: '32. Startup Jobs',
    icon: 'Rocket',
    subcategories: [
      'Founder Office',
      'Startup Operations',
      'Business Development',
      'Growth',
      'Venture Capital',
      'Incubator'
    ]
  },
  {
    id: 'admin',
    name: '33. Administration',
    icon: 'FolderKanban',
    subcategories: [
      'Office Assistant',
      'Receptionist',
      'Executive Assistant',
      'Office Administration',
      'Data Entry'
    ]
  }
];

// Helper to get category name without index number (e.g. "Information Technology (IT)")
export const getCleanCategoryName = (name: string): string => {
  return name.replace(/^\d+\.\s*/, '');
};
