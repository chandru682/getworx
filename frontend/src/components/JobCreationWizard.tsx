import { useState, useEffect, useRef } from 'react';
import { Check, X, Sparkles, Eye, Send, FileText, AlertTriangle, ChevronRight } from 'lucide-react';

interface JobCreationWizardProps {
  companyState: any;
  accessStatus: any;
  onJobCreated: () => void;
  onViewPlans?: () => void;
  jobToEdit?: any;
}

interface ScreeningQuestion {
  question_text: string;
  question_type: string;
  options_json?: string;
  is_mandatory: boolean;
  is_knockout: boolean;
  preferred_answer?: string;
  display_order: number;
}

export default function JobCreationWizard({
  companyState,
  accessStatus,
  onJobCreated,
  onViewPlans,
  jobToEdit,
}: JobCreationWizardProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishedJob, setPublishedJob] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Job Details
    title: '',
    department: 'Software Development',
    role: 'Full Stack Developer',
    employment_type: 'Full Time',
    experience_min: 0,
    experience_max: 5,
    work_mode: 'Onsite',
    city: '',
    state: '',
    country: 'India',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    show_salary: true,
    openings: 1,
    priority: 'Medium',
    deadline: '',

    // Step 2: Preferred Candidate
    education: '',
    skills: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    industry_exp: '',
    notice_period: 'Immediate',
    current_location: '',
    relocation_pref: 'Flexible',

    // Step 3: Job Description
    about_company: companyState.description || 'Enterprise Technology & Consulting Services Platform.',
    summary: '',
    responsibilities: '',
    required_skills_text: '',
    preferred_skills_text: '',
    benefits: [] as string[],
    working_hours: '9:00 AM - 6:00 PM',

    // Step 4: Screening Questions
    screening_questions: [] as ScreeningQuestion[],

    // Step 5: Advanced Options
    hiring_manager_name: '',
    hiring_manager_email: '',
    assigned_recruiter_id: '',
    visibility: 'Public',
    internal_job_id: '',
    auto_close_date: '',
    prevent_duplicates: true,
    email_notifications: 'Instant',
  });

  // Custom Screening Question Editor States
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('yes_no');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionMandatory, setNewQuestionMandatory] = useState(true);
  const [newQuestionKnockout, setNewQuestionKnockout] = useState(false);
  const [newQuestionPreferredAnswer, setNewQuestionPreferredAnswer] = useState('');
  const [newQuestionDisplayOrder, setNewQuestionDisplayOrder] = useState(1);

  // Input states for list adding
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  // Pre-fill form state when editing a job
  useEffect(() => {
    if (jobToEdit) {
      // Parse array JSON strings safely
      let parsedSkills: string[] = [];
      let parsedCertifications: string[] = [];
      let parsedLanguages: string[] = [];
      let parsedBenefits: string[] = [];

      try {
        parsedSkills = jobToEdit.skills_json ? JSON.parse(jobToEdit.skills_json) : [];
      } catch (e) {
        parsedSkills = Array.isArray(jobToEdit.skills_json) ? jobToEdit.skills_json : [];
      }

      try {
        parsedCertifications = jobToEdit.certifications_json ? JSON.parse(jobToEdit.certifications_json) : [];
      } catch (e) {
        parsedCertifications = Array.isArray(jobToEdit.certifications_json) ? jobToEdit.certifications_json : [];
      }

      try {
        parsedLanguages = jobToEdit.languages_json ? JSON.parse(jobToEdit.languages_json) : [];
      } catch (e) {
        parsedLanguages = Array.isArray(jobToEdit.languages_json) ? jobToEdit.languages_json : [];
      }

      try {
        parsedBenefits = jobToEdit.benefits_json ? JSON.parse(jobToEdit.benefits_json) : [];
      } catch (e) {
        parsedBenefits = Array.isArray(jobToEdit.benefits_json) ? jobToEdit.benefits_json : [];
      }

      // Map screening questions
      const parsedQuestions = (jobToEdit.screening_questions || []).map((q: any) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options_json: q.options_json,
        is_mandatory: q.is_mandatory,
        is_knockout: q.is_knockout,
        preferred_answer: q.preferred_answer,
        display_order: q.display_order || 1
      }));

      setFormData({
        title: jobToEdit.title || '',
        department: jobToEdit.department || 'Software Development',
        role: jobToEdit.role || 'Full Stack Developer',
        employment_type: jobToEdit.employment_type || 'Full Time',
        experience_min: typeof jobToEdit.experience_min === 'number' ? jobToEdit.experience_min : 0,
        experience_max: typeof jobToEdit.experience_max === 'number' ? jobToEdit.experience_max : 5,
        work_mode: jobToEdit.work_mode || 'Onsite',
        city: jobToEdit.city || '',
        state: jobToEdit.state || '',
        country: jobToEdit.country || 'India',
        salary_min: jobToEdit.salary_min !== null ? String(jobToEdit.salary_min) : '',
        salary_max: jobToEdit.salary_max !== null ? String(jobToEdit.salary_max) : '',
        salary_currency: jobToEdit.salary_currency || 'USD',
        show_salary: jobToEdit.show_salary !== false,
        openings: typeof jobToEdit.openings === 'number' ? jobToEdit.openings : 1,
        priority: jobToEdit.priority || 'Medium',
        deadline: jobToEdit.deadline ? new Date(jobToEdit.deadline).toISOString().split('T')[0] : '',

        education: jobToEdit.education || '',
        skills: parsedSkills,
        certifications: parsedCertifications,
        languages: parsedLanguages,
        industry_exp: jobToEdit.industry_exp || '',
        notice_period: jobToEdit.notice_period || 'Immediate',
        current_location: jobToEdit.current_location || '',
        relocation_pref: jobToEdit.relocation_pref || 'Flexible',

        about_company: jobToEdit.about_company || companyState.description || 'Enterprise Technology & Consulting Services Platform.',
        summary: jobToEdit.summary || '',
        responsibilities: jobToEdit.responsibilities || '',
        required_skills_text: jobToEdit.required_skills || '',
        preferred_skills_text: jobToEdit.preferred_skills || '',
        benefits: parsedBenefits,
        working_hours: jobToEdit.working_hours || '9:00 AM - 6:00 PM',

        screening_questions: parsedQuestions,

        hiring_manager_name: jobToEdit.hiring_manager_name || '',
        hiring_manager_email: jobToEdit.hiring_manager_email || '',
        assigned_recruiter_id: jobToEdit.assigned_recruiter_id ? String(jobToEdit.assigned_recruiter_id) : '',
        visibility: jobToEdit.visibility || 'Public',
        internal_job_id: jobToEdit.internal_job_id || '',
        auto_close_date: jobToEdit.auto_close_date ? new Date(jobToEdit.auto_close_date).toISOString().split('T')[0] : '',
        prevent_duplicates: jobToEdit.prevent_duplicates !== false,
        email_notifications: jobToEdit.email_notifications || 'Instant',
      });
    }
  }, [jobToEdit, companyState]);

  // Load recruiter team from API
  useEffect(() => {
    const fetchRecruiters = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const compName = companyState.name || localStorage.getItem('getworxs_company_name') || '';
      try {
        const token = localStorage.getItem('getworxs_access_token');
        const url = compName
          ? `${API_URL}/api/v1/companies/recruiters?company_name=${encodeURIComponent(compName)}`
          : `${API_URL}/api/v1/companies/recruiters`;
        const res = await fetch(url, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setRecruiters(data.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load recruiters:', err);
      }
    };
    fetchRecruiters();
  }, [companyState.name]);

  // Dynamic Validation before letting user go to next steps
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.title.trim()) return 'Job title is required.';
      if (!formData.department.trim()) return 'Department is required.';
      if (!formData.role.trim()) return 'Role is required.';
      if (!formData.employment_type.trim()) return 'Employment type is required.';
      if (formData.experience_min < 0 || formData.experience_max < formData.experience_min) {
        return 'Invalid experience range.';
      }
      if (!formData.country.trim()) return 'Country is required.';
      if (Number(formData.openings) <= 0) return 'Number of openings must be at least 1.';
    }
    if (step === 3) {
      const textContent = (formData.summary || '').replace(/<[^>]*>/g, '').trim();
      if (!textContent) return 'Job Description is mandatory.';
      if (textContent.length < 50) return 'Job Description is too short. Please provide a description of at least 50 characters.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(activeStep);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setActiveStep(prev => Math.min(prev + 1, 6));
  };

  const handleStepClick = (stepNum: number) => {
    // Validate first step before jumping anywhere else
    const err = validateStep(1);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setActiveStep(stepNum);
  };

  // Add Item Helpers
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const addCert = () => {
    if (certInput.trim() && !formData.certifications.includes(certInput.trim())) {
      setFormData({ ...formData, certifications: [...formData.certifications, certInput.trim()] });
      setCertInput('');
    }
  };

  const addLang = () => {
    if (langInput.trim() && !formData.languages.includes(langInput.trim())) {
      setFormData({ ...formData, languages: [...formData.languages, langInput.trim()] });
      setLangInput('');
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData({ ...formData, benefits: [...formData.benefits, benefitInput.trim()] });
      setBenefitInput('');
    }
  };

  // Custom Screening Question Addition
  const addScreeningQuestion = () => {
    if (!newQuestionText.trim()) return;

    let options_json: string | undefined = undefined;
    if (newQuestionType === 'multiple_choice' && newQuestionOptions.trim()) {
      const opts = newQuestionOptions
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      if (opts.length > 0) {
        options_json = JSON.stringify(opts);
      }
    }

    const newQ: ScreeningQuestion = {
      question_text: newQuestionText.trim(),
      question_type: newQuestionType,
      options_json,
      is_mandatory: newQuestionMandatory,
      is_knockout: newQuestionKnockout,
      preferred_answer: newQuestionPreferredAnswer.trim() || undefined,
      display_order: newQuestionDisplayOrder,
    };

    setFormData({
      ...formData,
      screening_questions: [...formData.screening_questions, newQ],
    });

    setNewQuestionText('');
    setNewQuestionOptions('');
    setNewQuestionMandatory(true);
    setNewQuestionKnockout(false);
    setNewQuestionPreferredAnswer('');
    setNewQuestionDisplayOrder(formData.screening_questions.length + 2);
  };

  // Predefined Suggested Questions
  const addSuggestedQuestion = (text: string, type = 'yes_no', options?: string[]) => {
    const isDup = formData.screening_questions.some(q => q.question_text.toLowerCase() === text.toLowerCase());
    if (isDup) return;

    setFormData({
      ...formData,
      screening_questions: [
        ...formData.screening_questions,
        {
          question_text: text,
          question_type: type,
          options_json: options ? JSON.stringify(options) : undefined,
          is_mandatory: true,
          is_knockout: false,
          preferred_answer: undefined,
          display_order: formData.screening_questions.length + 1,
        },
      ],
    });
  };

  const extractStructuredInfoFromJD = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const sections: { [key: string]: string[] } = {
      skills: [],
      preferred_skills: [],
      responsibilities: [],
      qualifications: [],
      experience: [],
      benefits: [],
    };

    const getSectionKey = (title: string): string | null => {
      const t = title.toLowerCase();
      if (t.includes('preferred skill') || t.includes('nice to have') || t.includes('desirable') || t.includes('plusses')) {
        return 'preferred_skills';
      }
      if (t.includes('required skill') || t.includes('key skill') || t.includes('skills required') || t.includes('must have') || t.includes('skills') || t.includes('requirements')) {
        return 'skills';
      }
      if (t.includes('responsibilities') || t.includes('duties') || t.includes('what you will do') || t.includes('tasks') || t.includes('role')) {
        return 'responsibilities';
      }
      if (t.includes('qualification') || t.includes('education') || t.includes('degree')) {
        return 'qualifications';
      }
      if (t.includes('experience') || t.includes('exp')) {
        return 'experience';
      }
      if (t.includes('benefits') || t.includes('perks') || t.includes('what we offer') || t.includes('compensation')) {
        return 'benefits';
      }
      return null;
    };

    let currentKey: string | null = null;
    const nodes = Array.from(doc.body.childNodes);
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        
        if (/^(h[1-6]|p|strong)$/.test(tagName) && el.textContent?.trim().length && el.textContent.trim().length < 50) {
          const key = getSectionKey(el.textContent.trim());
          if (key) {
            currentKey = key;
            return;
          }
        }

        if (currentKey) {
          if (tagName === 'ul' || tagName === 'ol') {
            const listItems = Array.from(el.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
            sections[currentKey].push(...listItems.filter(Boolean));
          } else if (el.textContent?.trim()) {
            const text = el.textContent.trim();
            if (text.includes('\n') || text.includes('•') || text.includes('-')) {
              const lines = text.split(/[\n•\-]+/).map(l => l.trim()).filter(Boolean);
              sections[currentKey].push(...lines);
            } else {
              sections[currentKey].push(text);
            }
          }
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        if (currentKey) {
          sections[currentKey].push(node.textContent.trim());
        }
      }
    });

    const plainText = doc.body.textContent || '';
    
    const extractWithRegex = (sectionRegex: RegExp, text: string): string[] => {
      const lines = text.split('\n').map(l => l.trim());
      let active = false;
      const result: string[] = [];
      for (const line of lines) {
        if (sectionRegex.test(line)) {
          active = true;
          continue;
        }
        if (active) {
          if (/^(About|Responsibilities|Skills|Qualifications|Experience|Benefits|Working|Location|Salary)/i.test(line)) {
            break;
          }
          if (line) {
            result.push(line.replace(/^[•\-\*0-9\.\s]+/, '').trim());
          }
        }
      }
      return result;
    };

    if (sections.skills.length === 0) {
      sections.skills = extractWithRegex(/(required skills|key skills|requirements|must have)/i, plainText);
    }
    if (sections.preferred_skills.length === 0) {
      sections.preferred_skills = extractWithRegex(/(preferred skills|nice to have)/i, plainText);
    }
    if (sections.responsibilities.length === 0) {
      sections.responsibilities = extractWithRegex(/(responsibilities|duties|what you will do)/i, plainText);
    }
    if (sections.qualifications.length === 0) {
      sections.qualifications = extractWithRegex(/(qualifications|education|degree)/i, plainText);
    }
    if (sections.benefits.length === 0) {
      sections.benefits = extractWithRegex(/(benefits|perks|what we offer)/i, plainText);
    }

    let exp_min = formData.experience_min;
    let exp_max = formData.experience_max;
    const expMatch = plainText.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years|yrs)/i) || plainText.match(/(\d+)\s*\+\s*(?:years|yrs)/i);
    if (expMatch) {
      if (expMatch[2]) {
        exp_min = parseInt(expMatch[1]);
        exp_max = parseInt(expMatch[2]);
      } else {
        exp_min = parseInt(expMatch[1]);
        exp_max = exp_min + 5;
      }
    }

    return {
      skills: sections.skills.map(s => s.replace(/^[•\-\*0-9\.\s]+/, '').trim()).filter(Boolean),
      preferred_skills: sections.preferred_skills.map(s => s.replace(/^[•\-\*0-9\.\s]+/, '').trim()).filter(Boolean),
      responsibilities: sections.responsibilities.join('\n'),
      qualifications: sections.qualifications.join('\n'),
      benefits: sections.benefits.map(b => b.replace(/^[•\-\*0-9\.\s]+/, '').trim()).filter(Boolean),
      experience_min: exp_min,
      experience_max: exp_max,
    };
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy_link');
  };

  const trackShare = (platform: string) => {
    console.log(`[Analytics] Track share click - Platform: ${platform}, Job ID: ${publishedJob?.id}`);
  };

  const handleManualExtract = () => {
    if (!formData.summary) return;
    const extracted = extractStructuredInfoFromJD(formData.summary);
    setFormData(prev => ({
      ...prev,
      education: extracted.qualifications || prev.education,
      responsibilities: extracted.responsibilities || prev.responsibilities,
      required_skills_text: extracted.skills.map(s => `• ${s}`).join('\n') || prev.required_skills_text,
      preferred_skills_text: extracted.preferred_skills.map(s => `• ${s}`).join('\n') || prev.preferred_skills_text,
      benefits: extracted.benefits.length > 0 ? extracted.benefits : prev.benefits,
      experience_min: extracted.experience_min || prev.experience_min,
      experience_max: extracted.experience_max || prev.experience_max,
    }));
  };

  // AI JD Writer Prefill
  const handleAIGenerateJD = () => {
    if (!formData.title) {
      setErrorMsg('Please enter a job title first in Step 1 to generate corresponding JD suggestions.');
      setActiveStep(1);
      return;
    }
    setErrorMsg(null);
    
    const loc = formData.city ? `${formData.city}, ${formData.state || ''}, ${formData.country}` : formData.country;
    const skillsList = formData.skills.length > 0 
      ? formData.skills.map(s => `<li>${s}</li>`).join('\n')
      : `<li>Hands-on expertise in the relevant tech stack.</li>
         <li>Strong problem solving and architectural thinking.</li>`;

    const aiHtml = `<h3>About Company</h3>
<p>${formData.about_company || 'We are a leading global innovation platform building state-of-the-art products and providing premium technology services.'}</p>

<h3>Job Summary</h3>
<p>We are seeking a highly motivated and talented <strong>${formData.title}</strong> to join our <strong>${formData.department}</strong> department. In this role, you will work as a <strong>${formData.role}</strong> on a <strong>${formData.employment_type}</strong> basis in a <strong>${formData.work_mode}</strong> work environment based out of <strong>${loc}</strong>. You will collaborate with cross-functional teams to design, develop, and maintain software features that deliver outstanding user value.</p>

<h3>Core Responsibilities</h3>
<ul>
  <li>Implement high-quality, scalable front-end components and backend microservices.</li>
  <li>Collaborate with product management, design, and QA teams to refine specifications and requirements.</li>
  <li>Write clean, documented, and well-tested code with comprehensive unit testing coverage.</li>
  <li>Participate in agile sprint planning, code reviews, and technical design workshops.</li>
  <li>Optimize applications for maximum loading speed, responsiveness, and accessibility compliance.</li>
</ul>

<h3>Required Qualifications & Education</h3>
<p>Bachelor's degree or higher in Computer Science, Engineering, or a related technical field (or equivalent professional experience).</p>

<h3>Required Skills</h3>
<ul>
  ${skillsList}
  <li>Proficiency with modern version control systems (Git) and CI/CD pipelines.</li>
  <li>Strong communication, collaboration, and peer mentoring skills.</li>
</ul>

<h3>Preferred Skills</h3>
<ul>
  <li>Familiarity with cloud platforms like AWS, Google Cloud, or Microsoft Azure.</li>
  <li>Experience with containerized deployment using Docker or Kubernetes.</li>
  <li>Knowledge of database optimization, custom index tuning, and query analysis.</li>
</ul>

<h3>Required Experience</h3>
<p>Candidates must possess a minimum of ${formData.experience_min} years and up to ${formData.experience_max} years of professional software development experience in a similar role.</p>

<h3>Benefits & Perks</h3>
<ul>
  <li>Comprehensive healthcare coverage including medical and dental insurance.</li>
  <li>Flexible working hours and professional hybrid work options.</li>
  <li>Annual training budget for certifications, conferences, and skill development.</li>
  <li>Regular performance bonuses and retirement program options.</li>
</ul>

<h3>Working Hours</h3>
<p>${formData.working_hours || '9:00 AM - 6:00 PM (Monday to Friday)'}</p>
`;

    setFormData(prev => {
      const nextData = {
        ...prev,
        summary: aiHtml
      };
      
      const extracted = extractStructuredInfoFromJD(aiHtml);
      return {
        ...nextData,
        education: extracted.qualifications || prev.education,
        responsibilities: extracted.responsibilities || prev.responsibilities,
        required_skills_text: extracted.skills.map(s => `• ${s}`).join('\n') || prev.required_skills_text,
        preferred_skills_text: extracted.preferred_skills.map(s => `• ${s}`).join('\n') || prev.preferred_skills_text,
        benefits: extracted.benefits.length > 0 ? extracted.benefits : prev.benefits,
        experience_min: extracted.experience_min || prev.experience_min,
        experience_max: extracted.experience_max || prev.experience_max,
      };
    });
  };

  // Submit Logic
  const handleSubmitJob = async (isDraft: boolean) => {
    setErrorMsg(null);
    if (!isDraft) {
      const firstStepErr = validateStep(1);
      if (firstStepErr) {
        setErrorMsg(`Step 1 Validation Error: ${firstStepErr}`);
        setActiveStep(1);
        return;
      }
      const jdErr = validateStep(3);
      if (jdErr) {
        setErrorMsg(`Step 3 Validation Error: ${jdErr}`);
        setActiveStep(3);
        return;
      }

      // Check access controls
      if (!accessStatus.is_dashboard_unlocked) {
        setErrorMsg(`Job publication locked. Access check failed: ${accessStatus.message || 'Active subscription plan needed.'}`);
        return;
      }
    }

    setIsSubmitting(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');

    // Build Payload
    const payload = {
      title: formData.title || (isDraft ? 'Untitled Draft' : ''),
      department: formData.department || (isDraft ? 'General' : ''),
      role: formData.role || (isDraft ? 'Other' : ''),
      employment_type: formData.employment_type || (isDraft ? 'Full Time' : ''),
      experience_min: Number(formData.experience_min) || 0,
      experience_max: Number(formData.experience_max) || 0,
      work_mode: formData.work_mode || 'Onsite',
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country || 'India',
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      salary_currency: formData.salary_currency || 'USD',
      show_salary: formData.show_salary,
      openings: Number(formData.openings) || 1,
      priority: formData.priority || 'Medium',
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,

      education: formData.education || null,
      skills_json: formData.skills.length > 0 ? JSON.stringify(formData.skills) : null,
      certifications_json: formData.certifications.length > 0 ? JSON.stringify(formData.certifications) : null,
      languages_json: formData.languages.length > 0 ? JSON.stringify(formData.languages) : null,
      industry_exp: formData.industry_exp || null,
      notice_period: formData.notice_period || null,
      current_location: formData.current_location || null,
      relocation_pref: formData.relocation_pref || null,

      about_company: formData.about_company || null,
      summary: formData.summary || null,
      responsibilities: formData.responsibilities || null,
      required_skills: formData.required_skills_text || null,
      preferred_skills: formData.preferred_skills_text || null,
      benefits_json: formData.benefits.length > 0 ? JSON.stringify(formData.benefits) : null,
      working_hours: formData.working_hours || null,

      hiring_manager_name: formData.hiring_manager_name || null,
      hiring_manager_email: formData.hiring_manager_email || null,
      assigned_recruiter_id: formData.assigned_recruiter_id ? Number(formData.assigned_recruiter_id) : null,
      visibility: formData.visibility || 'Public',
      internal_job_id: formData.internal_job_id || null,
      auto_close_date: formData.auto_close_date ? new Date(formData.auto_close_date).toISOString() : null,
      prevent_duplicates: formData.prevent_duplicates,
      email_notifications: formData.email_notifications || 'Instant',

      screening_questions: formData.screening_questions,
    };

    try {
      let endpoint = isDraft ? '/api/v1/jobs/draft' : '/api/v1/jobs';
      let method = 'POST';
      
      if (jobToEdit) {
        endpoint = `/api/v1/jobs/${jobToEdit.id}`;
        method = 'PUT';
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          status: isDraft ? 'draft' : 'active',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (isDraft) {
          alert('Job draft saved successfully!');
          onJobCreated();
        } else {
          setPublishedJob({
            id: data.data.id,
            title: data.data.title,
            companyName: companyState.name || 'Our Company',
            location: data.data.city ? `${data.data.city}, ${data.data.country}` : data.data.country,
            summary: data.data.summary || formData.summary || '',
          });
        }
      } else {
        if (res.status === 403 && !isDraft) {
          setShowLimitModal(true);
        } else {
          setErrorMsg(data.message || `Failed to ${isDraft ? 'save draft' : 'publish job'}.`);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrefillTestData = () => {
    setFormData({
      title: 'Senior Frontend Engineer (React/TypeScript)',
      department: 'Software Development',
      role: 'Front End Developer',
      employment_type: 'Full Time',
      experience_min: 3,
      experience_max: 8,
      work_mode: 'Hybrid',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      salary_min: '1200000',
      salary_max: '1800000',
      salary_currency: 'INR',
      show_salary: true,
      openings: 3,
      priority: 'High',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      education: "Bachelor's Degree in Computer Science or similar",
      skills: ['React', 'TypeScript', 'JavaScript (ES6)', 'HTML5 & CSS3', 'Vite', 'Redux Toolkit'],
      certifications: ['AWS Certified Developer', 'React Advanced Certification'],
      languages: ['English', 'Tamil'],
      industry_exp: 'IT Services / Software Development',
      notice_period: '15 Days or Less',
      current_location: 'Chennai',
      relocation_pref: 'Yes',

      about_company: companyState.description || 'Enterprise Technology & Consulting Services Platform.',
      summary: 'We are seeking a talented Senior Frontend Engineer to build robust, state-of-the-art web applications. You will collaborate closely with UX designers and backend engineers to translate Figma mockups into interactive, high-performance user interfaces.',
      responsibilities: '1. Develop new user-facing features using React.js and TypeScript.\n2. Build reusable component libraries and design system components.\n3. Optimize application performance and load times.\n4. Write clean, modular, and well-tested code.\n5. Conduct code reviews and mentor junior developers.',
      required_skills_text: '- Solid understanding of React.js, hooks, and context APIs.\n- Strong expertise in TypeScript and modern JavaScript.\n- Responsive design using CSS Grid and Flexbox.\n- Familiarity with unit testing tools (Jest, React Testing Library).',
      preferred_skills_text: '- Experience with state management (Redux, Zustand).\n- Knowledge of Next.js or server-side rendering.\n- Experience with CI/CD and deployment pipelines.',
      benefits: ['Medical Insurance', 'Flexible Working Hours', 'Professional Training Allowance', 'Annual Performance Bonus'],
      working_hours: '9:30 AM - 6:30 PM',

      screening_questions: [
        { question_text: 'Do you have at least 3 years of experience building React applications?', question_type: 'yes_no', options_json: undefined, is_mandatory: true, is_knockout: false, preferred_answer: undefined, display_order: 1 },
        { question_text: 'Are you located in or willing to relocate to Chennai?', question_type: 'yes_no', options_json: undefined, is_mandatory: true, is_knockout: false, preferred_answer: undefined, display_order: 2 },
        { question_text: 'What is your current notice period?', question_type: 'paragraph', options_json: undefined, is_mandatory: false, is_knockout: false, preferred_answer: undefined, display_order: 3 }
      ],

      hiring_manager_name: 'Sarah Jenkins',
      hiring_manager_email: 'sjenkins@getworxs.com',
      assigned_recruiter_id: recruiters.length > 0 ? String(recruiters[0].id) : '',
      visibility: 'Public',
      internal_job_id: 'GWX-2026-SRFE',
      auto_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prevent_duplicates: true,
      email_notifications: 'Instant',
    });
    setErrorMsg(null);
  };

  if (publishedJob) {
    const publicUrl = `${window.location.origin}/jobs/${slugify(publishedJob.title)}-${publishedJob.id}`;
    
    return (
      <div className="naukri-wizard-container" style={{ padding: '40px 30px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', maxWidth: '720px', margin: '40px auto' }}>
        <style dangerouslySetInnerHTML={{ __html: successScreenStyle }} />
        
        {/* Top Success Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#ecfdf5',
            border: '2px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#10b981',
            animation: 'pulse 2s infinite'
          }}>
            <Check size={40} />
          </div>
          
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
            Job Published Successfully!
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            Your job posting is now live and accepting candidate applications.
          </p>
        </div>

        {/* Job Details Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Job Posting
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '6px 0 4px 0' }}>
            {publishedJob.title}
          </h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
            <span><strong>Company:</strong> {publishedJob.companyName}</span>
            <span>•</span>
            <span><strong>Location:</strong> {publishedJob.location}</span>
          </div>
          {publishedJob.summary && (
            <p style={{
              fontSize: '13px',
              color: '#475569',
              lineHeight: '1.6',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {publishedJob.summary.replace(/<[^>]*>/g, '')}
            </p>
          )}
        </div>

        {/* Share Link Row */}
        <div style={{
          border: '1px dashed #cbd5e1',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <span style={{
            fontSize: '13px',
            color: '#334155',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {publicUrl}
          </span>
          <button
            type="button"
            className="ed-btn ed-btn-primary ed-btn-sm"
            style={{ flexShrink: 0, background: '#0284c7', padding: '6px 12px', fontSize: '12px' }}
            onClick={() => handleCopyLink(publicUrl)}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Social Share Actions Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Share Job Posting
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px'
          }}>
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this job opening: ${publishedJob.title} at ${publishedJob.companyName}. Apply here: ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn whatsapp"
              onClick={() => trackShare('whatsapp')}
            >
              WhatsApp
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn linkedin"
              onClick={() => trackShare('linkedin')}
            >
              LinkedIn
            </a>

            {/* X */}
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(`We are hiring a ${publishedJob.title} at ${publishedJob.companyName}! Apply here: `)}&url=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn twitter"
              onClick={() => trackShare('x')}
            >
              Share on X
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn facebook"
              onClick={() => trackShare('facebook')}
            >
              Facebook
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${publishedJob.title} at ${publishedJob.companyName}`)}&body=${encodeURIComponent(`Hi,\n\nI wanted to share this job opening for a ${publishedJob.title} at ${publishedJob.companyName} with you.\n\nYou can view more details and apply here: ${publicUrl}\n\nBest regards.`)}`}
              className="share-btn email"
              onClick={() => trackShare('email')}
            >
              Email
            </a>

            {/* Native Share */}
            {navigator.share && (
              <button
                type="button"
                className="share-btn native"
                onClick={() => {
                  trackShare('native');
                  navigator.share({
                    title: publishedJob.title,
                    text: `Apply for ${publishedJob.title} at ${publishedJob.companyName}`,
                    url: publicUrl
                  }).catch(console.error);
                }}
              >
                Device Share
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            className="ed-btn ed-btn-outline"
            onClick={() => window.open(publicUrl, '_blank')}
          >
            View Job
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {navigator.share && (
              <button
                type="button"
                className="ed-btn ed-btn-primary"
                style={{ background: '#0284c7' }}
                onClick={() => {
                  trackShare('native');
                  navigator.share({
                    title: publishedJob.title,
                    text: `Apply for ${publishedJob.title} at ${publishedJob.companyName}`,
                    url: publicUrl
                  }).catch(console.error);
                }}
              >
                Share Job
              </button>
            )}
            <button
              type="button"
              className="ed-btn ed-btn-outline"
              onClick={() => handleCopyLink(publicUrl)}
            >
              Copy Link
            </button>
            <button
              type="button"
              className="ed-btn ed-btn-ghost"
              onClick={() => {
                onJobCreated();
                setPublishedJob(null);
              }}
            >
              Done / Share Later
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div>
      {showLimitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f1f5f9',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fff7ed',
              border: '2px solid #ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertTriangle size={32} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Job Posting Limit Reached
            </h3>
            
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Your current subscription plan has reached its job posting limit. Upgrade your plan to publish this job.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="ed-btn ed-btn-primary"
                style={{ width: '100%', background: '#6366f1', color: '#ffffff', fontWeight: '700', padding: '12px' }}
                onClick={() => {
                  setShowLimitModal(false);
                  onViewPlans?.();
                }}
              >
                View Plans
              </button>
              
              <button
                type="button"
                className="ed-btn ed-btn-outline"
                style={{ width: '100%', border: '1.5px solid #cbd5e1', fontWeight: '700', padding: '12px', background: '#ffffff', cursor: 'pointer' }}
                onClick={() => {
                  setShowLimitModal(false);
                  handleSubmitJob(true); // Save as Draft
                }}
              >
                Save as Draft
              </button>
              
              <button
                type="button"
                className="ed-btn ed-btn-ghost"
                style={{ width: '100%', color: '#64748b', fontWeight: '700', padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowLimitModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '13.5px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '1200px',
          margin: '0 auto 20px auto'
        }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="naukri-post-container" style={{ margin: '0 auto', maxWidth: '1200px' }}>
        {/* Sidebar Nav */}
          <aside className="naukri-sidebar" style={{ flex: '1 1 280px', maxWidth: '340px' }}>
            <div className="naukri-sidebar-header">
              <h2 className="naukri-sidebar-title">{jobToEdit ? 'Edit Job Posting' : 'Create Job Posting'}</h2>
              <span className="naukri-hot-badge">ATS Pipeline</span>
            </div>

            <div className="naukri-step-list">
              {[
                { step: 1, label: 'Job Details' },
                { step: 2, label: 'Candidate Details' },
                { step: 3, label: 'Full Job Description' },
                { step: 4, label: 'Screening Questions' },
                { step: 5, label: 'Advanced Options' },
                { step: 6, label: 'Preview' },
              ].map(s => (
                <div
                  key={s.step}
                  className={`naukri-step-item ${activeStep === s.step ? 'active' : ''} ${activeStep > s.step ? 'completed' : ''}`}
                  onClick={() => handleStepClick(s.step)}
                >
                  <div className="naukri-step-dot">
                    {activeStep > s.step ? <Check size={12} /> : s.step}
                  </div>
                  <span className="naukri-step-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="naukri-webinar-card" style={{ marginTop: '20px' }}>
              <span className="naukri-webinar-title">Auto-Save Draft Active</span>
              <p className="naukri-webinar-desc">You can save this progress as a draft and finish it later.</p>
              <button
                type="button"
                className="naukri-webinar-link"
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                onClick={() => handleSubmitJob(true)}
              >
                <span>Save progress draft</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="naukri-webinar-card" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderColor: '#bae6fd' }}>
              <span className="naukri-webinar-title" style={{ color: '#0369a1' }}>Testing Assistant</span>
              <p className="naukri-webinar-desc" style={{ color: '#0284c7' }}>Instantly populate all steps with premium test data for quick validation.</p>
              <button
                type="button"
                className="naukri-webinar-link"
                style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#0284c7' }}
                onClick={handlePrefillTestData}
              >
                <span>Prefill Test Data</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </aside>

          {/* Form Content panel */}
          <div className="naukri-form-wrapper" style={{ flex: '2 1 600px', minWidth: '320px' }}>
            <div className="naukri-form-card" style={{ padding: '30px' }}>
              
              {/* Step 1: Job Details */}
              {activeStep === 1 && (
                <div>
                  <h3 className="naukri-form-section-title">Step 1 – Job Details</h3>
                  
                  <div className="ed-form-group">
                    <label className="ed-label">Job Title *</label>
                    <input
                      type="text"
                      className="ed-input"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Department *</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. Engineering"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Role *</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. Frontend Developer"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Employment Type *</label>
                      <select
                        className="ed-select"
                        value={formData.employment_type}
                        onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                      >
                        <option>Full Time</option>
                        <option>Part Time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                        <option>Temporary</option>
                      </select>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Work Mode *</label>
                      <select
                        className="ed-select"
                        value={formData.work_mode}
                        onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
                      >
                        <option>Onsite</option>
                        <option>Hybrid</option>
                        <option>Remote</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Experience Range (Years) *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          className="ed-input"
                          placeholder="Min"
                          style={{ width: '80px' }}
                          value={formData.experience_min}
                          onChange={e => setFormData({ ...formData, experience_min: Number(e.target.value) })}
                        />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                        <input
                          type="number"
                          className="ed-input"
                          placeholder="Max"
                          style={{ width: '80px' }}
                          value={formData.experience_max}
                          onChange={e => setFormData({ ...formData, experience_max: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Location (City, State, Country) *</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="City"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="State"
                          value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value })}
                        />
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="Country"
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Salary Range & Currency</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          className="ed-select"
                          style={{ width: '80px' }}
                          value={formData.salary_currency}
                          onChange={e => setFormData({ ...formData, salary_currency: e.target.value })}
                        >
                          <option>USD</option>
                          <option>INR</option>
                          <option>EUR</option>
                          <option>GBP</option>
                        </select>
                        <input
                          type="number"
                          className="ed-input"
                          placeholder="Min Salary"
                          value={formData.salary_min}
                          onChange={e => setFormData({ ...formData, salary_min: e.target.value })}
                        />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                        <input
                          type="number"
                          className="ed-input"
                          placeholder="Max Salary"
                          value={formData.salary_max}
                          onChange={e => setFormData({ ...formData, salary_max: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <input
                          type="checkbox"
                          id="show-salary"
                          checked={formData.show_salary}
                          onChange={e => setFormData({ ...formData, show_salary: e.target.checked })}
                        />
                        <label htmlFor="show-salary" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                          Show salary on public posting
                        </label>
                      </div>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Openings & Priority</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>No. Openings</span>
                          <input
                            type="number"
                            className="ed-input"
                            value={formData.openings}
                            onChange={e => setFormData({ ...formData, openings: Number(e.target.value) })}
                          />
                        </div>
              
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Step 2: Preferred Candidate */}
              {activeStep === 2 && (
                <div>
                  <h3 className="naukri-form-section-title">Step 2 – Preferred Candidate</h3>

                  <div className="ed-form-group">
                    <label className="ed-label">Education / Qualification</label>
                    <input
                      type="text"
                      className="ed-input"
                      placeholder="e.g. B.Tech/B.E. in Computer Science, MCA"
                      value={formData.education}
                      onChange={e => setFormData({ ...formData, education: e.target.value })}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label className="ed-label">Key Skills *</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="Add key technologies, e.g. React"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <button type="button" className="ed-btn ed-btn-outline" onClick={addSkill}>Add</button>
                    </div>
                    
                    <div className="naukri-selected-tags">
                      {formData.skills.map(s => (
                        <span key={s} className="naukri-tag-pill">
                          <span>{s}</span>
                          <button type="button" className="naukri-tag-remove" onClick={() => setFormData({ ...formData, skills: formData.skills.filter(i => i !== s) })}><X size={10} /></button>
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Suggested Skills (Click to add):</div>
                   
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Certifications</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="e.g. AWS Certified Solutions Architect"
                          value={certInput}
                          onChange={e => setCertInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())}
                        />
                        <button type="button" className="ed-btn ed-btn-outline" onClick={addCert}>Add</button>
                      </div>
                      <div className="naukri-selected-tags">
                        {formData.certifications.map(c => (
                          <span key={c} className="naukri-tag-pill" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>
                            <span>{c}</span>
                            <button type="button" className="naukri-tag-remove" onClick={() => setFormData({ ...formData, certifications: formData.certifications.filter(i => i !== c) })}><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Languages</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="e.g. English"
                          value={langInput}
                          onChange={e => setLangInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLang())}
                        />
                        <button type="button" className="ed-btn ed-btn-outline" onClick={addLang}>Add</button>
                      </div>
                      <div className="naukri-selected-tags">
                        {formData.languages.map(l => (
                          <span key={l} className="naukri-tag-pill" style={{ background: '#f5f3ff', color: '#5b21b6', borderColor: '#ddd6fe' }}>
                            <span>{l}</span>
                            <button type="button" className="naukri-tag-remove" onClick={() => setFormData({ ...formData, languages: formData.languages.filter(i => i !== l) })}><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Preferred Industry Exp.</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. FinTech, SaaS, E-Commerce"
                        value={formData.industry_exp}
                        onChange={e => setFormData({ ...formData, industry_exp: e.target.value })}
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Preferred Notice Period</label>
                      <select
                        className="ed-select"
                        value={formData.notice_period}
                        onChange={e => setFormData({ ...formData, notice_period: e.target.value })}
                      >
                        <option>Immediate</option>
                        <option>15 Days</option>
                        <option>30 Days</option>
                        <option>60 Days</option>
                        <option>90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Preferred Location</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. Chennai, Bangalore"
                        value={formData.current_location}
                        onChange={e => setFormData({ ...formData, current_location: e.target.value })}
                      />
                    </div>

                   
                  </div>
                </div>
              )}

              {/* Step 3: Job Description */}
              {activeStep === 3 && (
                <div>
                  <style dangerouslySetInnerHTML={{ __html: editorStyle }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="naukri-form-section-title" style={{ margin: 0 }}>Step 3 – Full Job Description</h3>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="ed-btn ed-btn-outline ed-btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', borderColor: '#0284c7' }}
                        onClick={handleAIGenerateJD}
                      >
                        <Sparkles size={14} />
                        <span>Write with AI</span>
                      </button>
                      <button
                        type="button"
                        className="ed-btn ed-btn-outline ed-btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', borderColor: '#059669' }}
                        onClick={handleManualExtract}
                      >
                        <FileText size={14} />
                        <span>Extract Details</span>
                      </button>
                      <button
                        type="button"
                        className="ed-btn ed-btn-outline ed-btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => {
                          const err = validateStep(3);
                          if (err) {
                            setErrorMsg(err);
                            return;
                          }
                          setErrorMsg(null);
                          setActiveStep(6);
                        }}
                      >
                        <Eye size={14} />
                        <span>Preview JD</span>
                      </button>
                    </div>
                  </div>

                  <div className="ed-form-group">
                    <label className="ed-label">About Company (Prefilled)</label>
                    <textarea
                      className="ed-input"
                      rows={2}
                      value={formData.about_company}
                      onChange={e => setFormData({ ...formData, about_company: e.target.value })}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label className="ed-label">Job Description Editor *</label>
                    <RichTextEditor
                      value={formData.summary}
                      onChange={(val) => {
                        setFormData(prev => ({ ...prev, summary: val }));
                      }}
                      placeholder="Paste or type the complete Job Description here..."
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      Pasting formatted text or using the AI button will automatically trigger structured detail extraction.
                    </div>
                  </div>

                  {/* Structured Details Review Block */}
                  <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      Review Extracted Details
                    </h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                      These details are extracted from the Job Description above and will be stored as searchable metadata. Please verify and refine them.
                    </p>

                    <div className="extracted-grid">
                      {/* Responsibilities */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Core Responsibilities</span>
                        </div>
                        <textarea
                          className="ed-input"
                          rows={4}
                          style={{ fontSize: '13px' }}
                          value={formData.responsibilities}
                          onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                          placeholder="Extracted responsibilities..."
                        />
                      </div>

                      {/* Required Skills */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Required Skills (One per line)</span>
                        </div>
                        <textarea
                          className="ed-input"
                          rows={4}
                          style={{ fontSize: '13px' }}
                          value={formData.required_skills_text}
                          onChange={e => setFormData({ ...formData, required_skills_text: e.target.value })}
                          placeholder="Extracted required skills..."
                        />
                      </div>

                      {/* Preferred Skills */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Preferred Skills (One per line)</span>
                        </div>
                        <textarea
                          className="ed-input"
                          rows={4}
                          style={{ fontSize: '13px' }}
                          value={formData.preferred_skills_text}
                          onChange={e => setFormData({ ...formData, preferred_skills_text: e.target.value })}
                          placeholder="Extracted preferred skills..."
                        />
                      </div>

                      {/* Qualifications */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Qualifications & Education</span>
                        </div>
                        <textarea
                          className="ed-input"
                          rows={4}
                          style={{ fontSize: '13px' }}
                          value={formData.education}
                          onChange={e => setFormData({ ...formData, education: e.target.value })}
                          placeholder="Extracted qualifications..."
                        />
                      </div>

                      {/* Experience */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Experience Range (Years)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                          <input
                            type="number"
                            className="ed-input"
                            style={{ width: '80px', fontSize: '13px' }}
                            value={formData.experience_min}
                            onChange={e => setFormData({ ...formData, experience_min: Number(e.target.value) })}
                          />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                          <input
                            type="number"
                            className="ed-input"
                            style={{ width: '80px', fontSize: '13px' }}
                            value={formData.experience_max}
                            onChange={e => setFormData({ ...formData, experience_max: Number(e.target.value) })}
                          />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>Years</span>
                        </div>
                      </div>

                      {/* Benefits & Perks */}
                      <div className="extracted-card">
                        <div className="extracted-card-title">
                          <Check size={14} color="#059669" />
                          <span>Benefits & Perks</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            className="ed-input"
                            style={{ fontSize: '13px' }}
                            placeholder="Add benefit..."
                            value={benefitInput}
                            onChange={e => setBenefitInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                          />
                          <button type="button" className="ed-btn ed-btn-outline ed-btn-sm" onClick={addBenefit}>Add</button>
                        </div>
                        <div className="naukri-selected-tags">
                          {formData.benefits.map(b => (
                            <span key={b} className="naukri-tag-pill" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7' }}>
                              <span>{b}</span>
                              <button type="button" className="naukri-tag-remove" onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter(i => i !== b) })}><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* Step 4: Screening Questions */}
              {activeStep === 4 && (
                <div>
                  <h3 className="naukri-form-section-title">Step 4 – Screening Questions</h3>
                  
                  {/* Selected Questions List */}
                  <div style={{ marginBottom: '24px' }}>
                    <label className="ed-label" style={{ display: 'block', marginBottom: '8px' }}>Active Screening Questions ({formData.screening_questions.length})</label>
                    {formData.screening_questions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {formData.screening_questions.map((q, idx) => (
                          <div key={idx} style={{
                            padding: '12px 16px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#1e293b' }}>
                                {q.question_text}
                                {q.is_mandatory && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                              </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                Type: {q.question_type.replace('_', ' ')}
                                {q.options_json ? ` • Options: ${JSON.parse(q.options_json).join(', ')}` : ''}
                                {q.is_knockout ? ` • Knockout` : ''}
                                {q.preferred_answer ? ` • Preferred: ${q.preferred_answer}` : ''}
                                {` • Order: ${q.display_order ?? idx + 1}`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, screening_questions: formData.screening_questions.filter((_, i) => i !== idx) })}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        No screening questions configured. Add some below to filter top candidates automatically!
                      </div>
                    )}
                  </div>

                  {/* Add Custom Question Form */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800' }}>Add Custom Question</h4>
                    
                    <div className="ed-form-group">
                      <label className="ed-label" style={{ fontSize: '11.5px' }}>Question Text</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. Do you have experience deploying applications to AWS?"
                        value={newQuestionText}
                        onChange={e => setNewQuestionText(e.target.value)}
                      />
                    </div>

                    <div className="grid-2">
                      <div className="ed-form-group">
                        <label className="ed-label" style={{ fontSize: '11.5px' }}>Response Type</label>
                        <select
                          className="ed-select"
                          value={newQuestionType}
                          onChange={e => setNewQuestionType(e.target.value)}
                        >
                          <option value="yes_no">Yes / No</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="paragraph">Paragraph Text</option>
                          <option value="file_upload">File Upload</option>
                        </select>
                      </div>

                      <div className="ed-form-group">
                        <label className="ed-label" style={{ fontSize: '11.5px' }}>Settings</label>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}>
                            <input
                              type="checkbox"
                              id="new-mandatory"
                              checked={newQuestionMandatory}
                              onChange={e => setNewQuestionMandatory(e.target.checked)}
                            />
                            <label htmlFor="new-mandatory" style={{ fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                              Mandatory
                            </label>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}>
                            <input
                              type="checkbox"
                              id="new-knockout"
                              checked={newQuestionKnockout}
                              onChange={e => setNewQuestionKnockout(e.target.checked)}
                            />
                            <label htmlFor="new-knockout" style={{ fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                              Knockout Question
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {newQuestionKnockout && (
                      <div className="ed-form-group">
                        <label className="ed-label" style={{ fontSize: '11.5px' }}>Preferred Answer</label>
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="e.g. Yes or Immediate"
                          value={newQuestionPreferredAnswer}
                          onChange={e => setNewQuestionPreferredAnswer(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="ed-form-group">
                      <label className="ed-label" style={{ fontSize: '11.5px' }}>Display Order</label>
                      <input
                        type="number"
                        className="ed-input"
                        min={0}
                        value={newQuestionDisplayOrder}
                        onChange={e => setNewQuestionDisplayOrder(Number(e.target.value))}
                      />
                    </div>

                    {newQuestionType === 'multiple_choice' && (
                      <div className="ed-form-group">
                        <label className="ed-label" style={{ fontSize: '11.5px' }}>Options (Comma-separated)</label>
                        <input
                          type="text"
                          className="ed-input"
                          placeholder="e.g. AWS, Azure, GCP, On-Premise"
                          value={newQuestionOptions}
                          onChange={e => setNewQuestionOptions(e.target.value)}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      className="ed-btn ed-btn-primary ed-btn-sm"
                      style={{ background: '#0284c7' }}
                      onClick={addScreeningQuestion}
                    >
                      + Append Question
                    </button>
                  </div>

                  {/* Predefined Quick Questions */}
                  <div>
                    <label className="ed-label" style={{ display: 'block', marginBottom: '8px' }}>Suggested ATS Screening Questions (Click to Add):</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="naukri-question-pill"
                        onClick={() => addSuggestedQuestion('Are you willing to work from our Chennai office?', 'yes_no')}
                      >
                        + Onsite Location Check
                      </button>
                      <button
                        type="button"
                        className="naukri-question-pill"
                        onClick={() => addSuggestedQuestion('What is your current notice period?', 'multiple_choice', ['Immediate', '15 Days', '30 Days', '60 Days or more'])}
                      >
                        + Notice Period Check
                      </button>
                      <button
                        type="button"
                        className="naukri-question-pill"
                        onClick={() => addSuggestedQuestion('Upload your official academic transcript', 'file_upload')}
                      >
                        + Transcript Upload
                      </button>
                      <button
                        type="button"
                        className="naukri-question-pill"
                        onClick={() => addSuggestedQuestion('Please describe your experience scaling PostgreSQL databases', 'paragraph')}
                      >
                        + Database Scale Paragraph
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Step 5: Advanced Options */}
              {activeStep === 5 && (
                <div>
                  <h3 className="naukri-form-section-title">Step 5 – Advanced Options</h3>

                 
                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Assigned Recruiter</label>
                      <select
                        className="ed-select"
                        value={formData.assigned_recruiter_id}
                        onChange={e => setFormData({ ...formData, assigned_recruiter_id: e.target.value })}
                      >
                        <option value="">-- Select Recruiter --</option>
                        {recruiters.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.recruiter_name} ({r.recruiter_email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Visibility</label>
                      <select
                        className="ed-select"
                        value={formData.visibility}
                        onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                      >
                        <option>Public</option>
                        <option>Internal Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Internal Job ID</label>
                      <input
                        type="text"
                        className="ed-input"
                        placeholder="e.g. ATH-982-JD"
                        value={formData.internal_job_id}
                        onChange={e => setFormData({ ...formData, internal_job_id: e.target.value })}
                      />
                    </div>

                    <div className="ed-form-group">
                      <label className="ed-label">Auto Close Date</label>
                      <input
                        type="date"
                        className="ed-input"
                        value={formData.auto_close_date}
                        onChange={e => setFormData({ ...formData, auto_close_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="ed-form-group">
                      <label className="ed-label">Application Receipt Rules</label>
                      <select
                        className="ed-select"
                        value={formData.email_notifications}
                        onChange={e => setFormData({ ...formData, email_notifications: e.target.value })}
                      >
                        <option>Instant</option>
                        <option>Daily Summary</option>
                        <option>None</option>
                      </select>
                    </div>

                    <div className="ed-form-group" style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          id="prevent-duplicates"
                          checked={formData.prevent_duplicates}
                          onChange={e => setFormData({ ...formData, prevent_duplicates: e.target.checked })}
                        />
                        <label htmlFor="prevent-duplicates" style={{ fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                          Prevent Duplicate Candidate Applications
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions Box */}
                  <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Ready to review?</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Preview your job details layout or save a draft.</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="ed-btn ed-btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setActiveStep(6)}
                      >
                        <Eye size={15} />
                        <span>Preview posting</span>
                      </button>
                      <button
                        type="button"
                        className="ed-btn ed-btn-ghost"
                        style={{ color: '#0284c7' }}
                        onClick={() => handleSubmitJob(true)}
                        disabled={isSubmitting}
                      >
                        Save progress draft
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Preview */}
              {activeStep === 6 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="naukri-form-section-title" style={{ margin: 0 }}>Step 6 – Candidate Preview</h3>
                    <button
                      type="button"
                      className="ed-btn ed-btn-outline ed-btn-sm"
                      onClick={() => handleSubmitJob(true)}
                      disabled={isSubmitting}
                    >
                      Save Draft
                    </button>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: '#f0fdf4',
                        color: '#166534',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        marginBottom: '10px'
                      }}>
                        {formData.work_mode} • {formData.employment_type}
                      </span>
                      
                      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                        {formData.title || 'Job Position'}
                      </h1>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569' }}>
                        <span><strong>Dept:</strong> {formData.department}</span>
                        <span>•</span>
                        <span><strong>Exp:</strong> {formData.experience_min} - {formData.experience_max} Years</span>
                        <span>•</span>
                        <span><strong>Location:</strong> {formData.city ? `${formData.city}, ${formData.state}` : formData.country}</span>
                        {formData.show_salary && (formData.salary_min || formData.salary_max) && (
                          <>
                            <span>•</span>
                            <span><strong>Salary:</strong> {formData.salary_currency === 'USD' ? '$' : '₹'}{formData.salary_min} - {formData.salary_currency === 'USD' ? '$' : '₹'}{formData.salary_max}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* JD Render */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Description</h4>
                        {/<[a-z][\s\S]*>/i.test(formData.summary) ? (
                          <div dangerouslySetInnerHTML={{ __html: formData.summary }} style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }} />
                        ) : (
                          <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{formData.summary}</div>
                        )}
                      </div>

                      {/* Key Skills Tags */}
                      {formData.skills.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Skills</h4>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {formData.skills.map(s => (
                              <span key={s} style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Screening Questions Count */}
                      {formData.screening_questions.length > 0 && (
                        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>
                            <FileText size={15} color="#0284c7" />
                            <span>{formData.screening_questions.length} Pre-Screening Questions Configured</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                            Candidates must answer these mandatory questions before submitting their application to the hiring manager.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="naukri-footer-bar" style={{ marginTop: '30px' }}>
                {activeStep > 1 && (
                  <button
                    type="button"
                    className="ed-btn ed-btn-outline"
                    onClick={() => setActiveStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}

                {activeStep < 6 ? (
                  <button
                    type="button"
                    className="ed-btn ed-btn-primary"
                    style={{ background: '#0284c7' }}
                    onClick={handleNext}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ed-btn ed-btn-primary"
                    style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleSubmitJob(false)}
                    disabled={isSubmitting}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Publishing...' : 'Publish Job Posting'}</span>
                  </button>
                )}
              </div>

            </div>
          </div>

      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 30px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Job Posting Live Preview</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>This is how candidate applicant portal will show the vacancy.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '30px' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px', marginBottom: '24px' }}>
                <span style={{
                  padding: '4px 10px',
                  background: '#f0fdf4',
                  color: '#166534',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  {formData.work_mode} • {formData.employment_type}
                </span>
                
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                  {formData.title || 'Senior Software Engineer'}
                </h1>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13.5px', color: '#475569' }}>
                  <span><strong>Dept:</strong> {formData.department}</span>
                  <span>•</span>
                  <span><strong>Exp:</strong> {formData.experience_min} - {formData.experience_max} Years</span>
                  <span>•</span>
                  <span><strong>Location:</strong> {formData.city ? `${formData.city}, ${formData.state}` : formData.country}</span>
                  {formData.show_salary && (formData.salary_min || formData.salary_max) && (
                    <>
                      <span>•</span>
                      <span><strong>Salary:</strong> {formData.salary_currency === 'USD' ? '$' : '₹'}{formData.salary_min} - {formData.salary_currency === 'USD' ? '$' : '₹'}{formData.salary_max}</span>
                    </>
                  )}
                </div>
              </div>

              {/* JD Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* About Company */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Company</h4>
                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{formData.about_company}</p>
                </div>

                {/* Job Summary */}
                {formData.summary && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Summary</h4>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{formData.summary}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {formData.responsibilities && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Responsibilities</h4>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{formData.responsibilities}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {formData.required_skills_text && (
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</h4>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{formData.required_skills_text}</p>
                    </div>
                  )}
                  {formData.preferred_skills_text && (
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Skills</h4>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{formData.preferred_skills_text}</p>
                    </div>
                  )}
                </div>

                {/* Key Skills Tags */}
                {formData.skills.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate Key Skills</h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {formData.skills.map(s => (
                        <span key={s} style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screening questions count */}
                {formData.screening_questions.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13.5px', color: '#1e293b' }}>
                      <FileText size={16} color="#0284c7" />
                      <span>{formData.screening_questions.length} Pre-Screening Questions Configured</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      Candidates must answer these mandatory questions before submitting their application to the hiring manager.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                type="button"
                className="ed-btn ed-btn-outline"
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="ed-btn ed-btn-primary"
                style={{ background: '#059669' }}
                onClick={() => {
                  setShowPreviewModal(false);
                  handleSubmitJob(false);
                }}
                disabled={isSubmitting}
              >
                Publish posting now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ─── Sub-components and Styles for Rich-Text Editor ─────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from props only if it differs from innerHTML to avoid cursor reset
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  return (
    <div className="jd-rich-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button type="button" onClick={() => executeCommand('bold')} className="toolbar-btn" style={{ fontWeight: 'bold' }}>B</button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<h3>')} className="toolbar-btn">H3</button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<p>')} className="toolbar-btn">P</button>
        <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="toolbar-btn">• List</button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} className="toolbar-btn">1. List</button>
        
        {/* Line spacing dropdown */}
        <select 
          onChange={(e) => {
            if (editorRef.current) {
              editorRef.current.style.lineHeight = e.target.value;
            }
          }}
          className="toolbar-select" 
        >
          <option value="1.5">Line Spacing: 1.5</option>
          <option value="1.2">Line Spacing: 1.2</option>
          <option value="1.8">Line Spacing: 1.8</option>
          <option value="2.0">Line Spacing: 2.0</option>
        </select>
      </div>
      
      {/* Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="editor-content-area"
        data-placeholder={placeholder}
      />
    </div>
  );
}

const editorStyle = `
  .jd-rich-editor {
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: border-color 0.2s;
  }
  .jd-rich-editor:focus-within {
    border-color: #3b82f6;
  }
  .editor-toolbar {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-wrap: wrap;
    align-items: center;
  }
  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
  }
  .toolbar-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
  .toolbar-select {
    height: 32px;
    padding: 4px 8px;
    font-size: 13px;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
  }
  .editor-content-area {
    min-height: 280px;
    max-height: 500px;
    overflow-y: auto;
    padding: 16px 20px;
    outline: none;
    line-height: 1.5;
    font-size: 14.5px;
    color: #334155;
  }
  .editor-content-area:empty:before {
    content: attr(data-placeholder);
    color: #94a3b8;
    cursor: text;
  }
  .editor-content-area h3 {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  .editor-content-area p {
    margin-top: 0;
    margin-bottom: 12px;
  }
  .editor-content-area ul, .editor-content-area ol {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 20px;
  }
  .editor-content-area li {
    margin-bottom: 4px;
  }
  .extracted-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 20px;
  }
  @media (min-width: 768px) {
    .extracted-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .extracted-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }
  .extracted-card-title {
    font-size: 13px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
`;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const successScreenStyle = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid #e2e8f0;
    color: #334155;
    background: #ffffff;
  }
  .share-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  .share-btn.whatsapp {
    color: #25d366;
    border-color: #d2f8e1;
    background: #f0fdf4;
  }
  .share-btn.whatsapp:hover {
    background: #dcfce7;
  }
  .share-btn.linkedin {
    color: #0077b5;
    border-color: #dbeafe;
    background: #eff6ff;
  }
  .share-btn.linkedin:hover {
    background: #dbeafe;
  }
  .share-btn.twitter {
    color: #1da1f2;
    border-color: #e0f2fe;
    background: #f0f9ff;
  }
  .share-btn.twitter:hover {
    background: #e0f2fe;
  }
  .share-btn.facebook {
    color: #1877f2;
    border-color: #e0f2fe;
    background: #f0f9ff;
  }
  .share-btn.facebook:hover {
    background: #e0f2fe;
  }
  .share-btn.email {
    color: #475569;
    border-color: #e2e8f0;
    background: #f8fafc;
  }
  .share-btn.email:hover {
    background: #f1f5f9;
  }
  .share-btn.native {
    color: #0284c7;
    border-color: #e0f2fe;
    background: #f0f9ff;
  }
  .share-btn.native:hover {
    background: #e0f2fe;
  }
`;
