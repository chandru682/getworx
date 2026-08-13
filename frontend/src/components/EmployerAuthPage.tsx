import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Users, 
  Zap, 
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileCheck,
  Bell,
  CreditCard,
  Check,
  Video,
  Calendar,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';
import { CompanyOnboardingModal } from './CompanyOnboardingModal';

interface EmployerAuthPageProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateCandidateLogin?: () => void;
}

export const EmployerAuthPage: React.FC<EmployerAuthPageProps> = ({
  onLoginSuccess
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demo Request Form State (All 12 Fields)
  const [demoForm, setDemoForm] = useState({
    company_name: '',
    contact_person: '',
    official_email: '',
    mobile_number: '',
    company_size: '1-10 employees',
    industry: 'Technology & Software',
    number_of_recruiters: '1-5 recruiters',
    expected_hiring_volume: '1-10 hires/month',
    hiring_requirements: '',
    preferred_demo_date: '',
    preferred_demo_time: '10:00 AM',
    additional_message: ''
  });
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoErrorMessage, setDemoErrorMessage] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Footer Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleEmployerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const user = data.data?.user;
        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', user?.role || 'EMPLOYER');
          localStorage.setItem('getworxs_user_email', user?.email || email);
          localStorage.setItem('getworxs_user_name', user?.name || '');
        }

        setShowLoginModal(false);
        onLoginSuccess(data);
      } else {
        setErrorMessage(data.error?.message || 'Invalid email or password. Please verify your employer credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred during employer login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDemo(true);
    setDemoErrorMessage(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/demos/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoForm)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setDemoSubmitted(true);
      } else {
        setDemoErrorMessage(data.error?.message || 'Failed to submit demo request. Please check required fields.');
      }
    } catch (err: any) {
      setDemoErrorMessage(err?.message || 'Network error occurred while submitting demo request.');
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  const stats = [
    { value: '250K+', label: 'Verified Talent', icon: <Users size={22} style={{ color: '#8B5CF6' }} /> },
    { value: '1,000+', label: 'Active Enterprise Hubs', icon: <Building2 size={22} style={{ color: '#6D28D9' }} /> },
    { value: '12K+', label: 'Jobs Published', icon: <Zap size={22} style={{ color: '#38BDF8' }} /> },
    { value: '96%', label: 'Hiring Success Velocity', icon: <TrendingUp size={22} style={{ color: '#10B981' }} /> }
  ];

  const features = [
    {
      title: 'AI Candidate Vector Match',
      desc: 'Smart semantic scoring algorithms analyze talent profiles based on skills, tech stack, and verified experience.',
      bg: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
      icon: <Sparkles size={22} color="#ffffff" />
    },
    {
      title: 'ATS Resume Parser Suite',
      desc: 'Automated PDF/Docx resume extraction benchmarking candidates against global enterprise ATS standards.',
      bg: 'linear-gradient(135deg, #059669, #10B981)',
      icon: <FileCheck size={22} color="#ffffff" />
    },
    {
      title: 'Recruiter Quota Management',
      desc: 'Invite internal recruiters, delegate seat access, set posting limits, and monitor team hiring velocity.',
      bg: 'linear-gradient(135deg, #D97706, #F59E0B)',
      icon: <Users size={22} color="#ffffff" />
    },
    {
      title: 'Video Technical Interviews',
      desc: 'Asynchronous and live technical video interview modules with automated transcript transcript scoring.',
      bg: 'linear-gradient(135deg, #2563EB, #38BDF8)',
      icon: <Video size={22} color="#ffffff" />
    },
    {
      title: 'Calendar & Timezone Sync',
      desc: 'Automated calendar integration, timezone alignment, and instant self-scheduling candidate links.',
      bg: 'linear-gradient(135deg, #E11D48, #FB7185)',
      icon: <Calendar size={22} color="#ffffff" />
    },
    {
      title: 'Hiring Analytics Console',
      desc: 'Real-time pipeline drop-off charts, candidate match distribution metrics, and cost-per-hire insights.',
      bg: 'linear-gradient(135deg, #7C3AED, #C084FC)',
      icon: <BarChart3 size={22} color="#ffffff" />
    },
    {
      title: 'B2B Corporate Invoicing',
      desc: 'Flexible subscription plans billed transparently in Indian Rupees (INR - ₹) with Razorpay support.',
      bg: 'linear-gradient(135deg, #0284C7, #38BDF8)',
      icon: <CreditCard size={22} color="#ffffff" />
    },
    {
      title: 'Real-time Notifications',
      desc: 'Instant web, email, and Slack webhook alerts for applicant stage updates and offer acceptances.',
      bg: 'linear-gradient(135deg, #DC2626, #F87171)',
      icon: <Bell size={22} color="#ffffff" />
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter Plan',
      price: '₹14,999',
      period: '/month',
      desc: 'Perfect for growing startups hiring initial engineering team leads.',
      isFeatured: false,
      features: [
        '5 Active Job Postings',
        '2 Recruiter Team Seats',
        'Basic AI Candidate Matching',
        'Standard ATS Resume Parsing',
        'Email Support'
      ]
    },
    {
      name: 'Professional Plan',
      price: '₹49,999',
      period: '/month',
      desc: 'Designed for scaling tech enterprises and active hiring hubs.',
      isFeatured: true,
      badge: 'MOST POPULAR',
      features: [
        '25 Active Job Postings',
        '10 Recruiter Team Seats',
        'Advanced AI Match Scoring (95%+)',
        'Full ATS Resume Parser Suite',
        'Recruiter Quota Management',
        'Dedicated Account Manager',
        'Slack Webhook Integration'
      ]
    },
    {
      name: 'Enterprise Plan',
      price: '₹1,49,999',
      period: '/month',
      desc: 'Custom corporate suite with unlimited seats, API access, and EOR.',
      isFeatured: false,
      features: [
        'Unlimited Job Postings',
        'Unlimited Recruiter Seats',
        'Custom AI Model Fine-tuning',
        'Global EOR & Visa Assistance',
        'Custom ATS Integration API',
        '24/7 Priority Phone & SLA Support',
        'Custom Billing & Quotations'
      ]
    }
  ];

  const faqs = [
    {
      q: 'Can our company evaluate GetWorxs via Demo before purchasing?',
      a: 'Yes! Companies are not forced to buy immediately. You can click "Request a Demo" to schedule a personalized 1-on-1 walkthrough with our technical engineering team before subscribing.'
    },
    {
      q: 'How long does it take for a Sales Rep to contact us after a Demo Request?',
      a: 'Our B2B Enterprise team contacts all submitted demo requests within 2 to 4 business hours to confirm your preferred date, time, and meeting link.'
    },
    {
      q: 'How does GetWorxs compare to traditional job portals?',
      a: 'Unlike traditional job boards that flood your inbox with unvetted applicants, GetWorxs uses AI matching to pre-score candidates against your job requirements before you ever review them.'
    },
    {
      q: 'What payment methods and billing cycles are supported?',
      a: 'We support Credit Cards, Net Banking, Razorpay, Corporate Wire Transfers, and custom Purchase Order (PO) invoicing billed natively in Indian Rupees (INR - ₹).'
    },
    {
      q: 'Can Employer Admins assign job posting quotas to individual recruiters?',
      a: 'Yes, Employer Admins can delegate seats and assign precise job posting quotas to each recruiter on their team.'
    }
  ];

  return (
    <div style={{ background: '#F8FAFC', color: '#0F172A', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* ═══════════════════════════════════════════════════
         SECTION 1: STICKY GLASS NAVBAR
      ═══════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '14px 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <GetWorxsLogo size="md" />

            <nav style={{ display: 'flex', gap: 22, alignItems: 'center' }} className="hide-mobile">
              <button 
                onClick={() => setShowDemoModal(true)} 
                style={{ background: 'none', border: 'none', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Request Demo
              </button>
              <a href="#features" style={{ textDecoration: 'none', color: '#475569', fontSize: 14, fontWeight: 600 }}>Features</a>
              <a href="#pricing" style={{ textDecoration: 'none', color: '#475569', fontSize: 14, fontWeight: 600 }}>Pricing</a>
              <a href="#faqs" style={{ textDecoration: 'none', color: '#475569', fontSize: 14, fontWeight: 600 }}>FAQ</a>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(109, 40, 217, 0.1)', color: '#6D28D9' }}>
                For Employers
              </span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 14,
                fontWeight: 700,
                color: '#0F172A',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Login
            </button>

            <button 
              onClick={() => setShowCompanyModal(true)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #6D28D9',
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 14,
                fontWeight: 700,
                color: '#6D28D9',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Register Company
            </button>

            {/* PRIMARY SALES CTA */}
            <button 
              onClick={() => setShowDemoModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                border: 'none',
                borderRadius: 12,
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 10px 20px -5px rgba(109, 40, 217, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Request a Demo
            </button>
          </div>

        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
         SECTION 2: HERO (PRIMARY CTA: REQUEST A DEMO)
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: '70px 0 80px', maxWidth: '1280px', margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: 50, alignItems: 'center' }}>
          
          {/* Left Column */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(109, 40, 217, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: 30,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: '#6D28D9',
              marginBottom: 20
            }}>
              <Sparkles size={15} style={{ color: '#8B5CF6' }} /> Enterprise AI Recruitment Platform
            </div>

            <h1 style={{
              fontSize: 52,
              fontWeight: 900,
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
              margin: '0 0 20px 0',
              color: '#0F172A'
            }}>
              Evaluate GetWorxs <span style={{
                background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Before You Subscribe</span>
            </h1>

            <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.6, margin: '0 0 28px 0', maxWidth: 540 }}>
              Request a live 1-on-1 platform walkthrough with our engineering team. Explore AI candidate match scoring, recruiter portals, and corporate B2B pricing tailored to your hiring volume.
            </p>

            {/* Subtitle Badges */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
              {['Live 1-on-1 Demo', 'No Upfront Purchase Needed', 'Custom Invoicing in INR (₹)', 'Flexible B2B Tiers'].map((b, i) => (
                <span key={i} style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)'
                }}>
                  ✓ {b}
                </span>
              ))}
            </div>

            {/* Dual Primary CTAs */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {/* Primary Sales CTA: Request a Demo */}
              <button 
                onClick={() => setShowDemoModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px 36px',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 15px 25px -5px rgba(109, 40, 217, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <Calendar size={20} /> Request a Demo <ArrowRight size={18} />
              </button>

              {/* Secondary CTA: Register Company */}
              <button 
                onClick={() => setShowCompanyModal(true)}
                style={{
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 14,
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Building2 size={18} /> Register Company
              </button>
            </div>
          </div>

          {/* Right Column: Interactive B2B Dashboard Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: 350,
              height: 350,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(248, 250, 252, 0) 70%)',
              borderRadius: '50%',
              zIndex: 0
            }} />

            <div style={{
              position: 'relative',
              zIndex: 1,
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
              padding: 28
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800 }}>
                    GW
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>GetWorxs B2B Demo Console</h4>
                    <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>● Live Evaluation Workspace</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowDemoModal(true)}
                  style={{ background: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Schedule Now
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Top Candidate Score</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#6D28D9', margin: '4px 0' }}>98.4%</div>
                  <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>✓ AI Vector Match</span>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Demo Availability</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '6px 0' }}>Mon – Fri</div>
                  <span style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700 }}>⚡ 1-on-1 Product Engineer</span>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', borderRadius: 16, padding: 18, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  <Sparkles size={16} color="#6D28D9" /> Product Evaluation Guarantee
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                  No payment or credit card is required to book a demo. Experience full platform features before choosing a plan.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS BANNER */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '36px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         SECTION 3: FEATURES GRID
      ═══════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '90px 0', maxWidth: '1280px', margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Suite</span>
          <h2 style={{ fontSize: 38, fontWeight: 900, margin: '8px 0 16px', color: '#0F172A' }}>Everything You Need to Hire Top Talent</h2>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 620, margin: '0 auto' }}>
            Built for modern engineering and corporate hiring teams seeking high precision, team collaboration, and automated screening workflows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {features.map((feat, idx) => (
            <div 
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                padding: 24,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s, boxShadow 0.2s'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: feat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A' }}>{feat.title}</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55, margin: 0 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         SECTION 5: PRICING SECTION (INR ₹)
      ═══════════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '90px 0', maxWidth: '1280px', margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>B2B Corporate Pricing (INR ₹)</span>
          <h2 style={{ fontSize: 38, fontWeight: 900, margin: '8px 0 16px', color: '#0F172A' }}>Flexible Tiers Billed in Indian Rupees</h2>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 600, margin: '0 auto' }}>
            Choose a plan after evaluating GetWorxs in your product demo. Custom GST invoicing & corporate quotations available.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30, alignItems: 'stretch' }}>
          {pricingPlans.map((plan, idx) => (
            <div 
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: plan.isFeatured ? '2px solid #6D28D9' : '1px solid #E2E8F0',
                padding: 32,
                boxShadow: plan.isFeatured ? '0 20px 40px -10px rgba(109, 40, 217, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {plan.badge && (
                <span style={{
                  position: 'absolute',
                  top: -14,
                  right: 28,
                  background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderRadius: 20,
                  letterSpacing: '0.05em'
                }}>
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A' }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: '0 0 24px 0', minHeight: 40 }}>{plan.desc}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#0F172A' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>{plan.period}</span>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20, marginBottom: 28 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                    Included Features:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155', fontWeight: 600 }}>
                        <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowDemoModal(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  background: plan.isFeatured ? 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)' : '#FFFFFF',
                  color: plan.isFeatured ? '#FFFFFF' : '#0F172A',
                  border: plan.isFeatured ? 'none' : '1px solid #CBD5E1',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: plan.isFeatured ? '0 10px 20px -5px rgba(109, 40, 217, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Request Demo & Quote
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         SECTION 6: FAQ ACCORDION
      ═══════════════════════════════════════════════════ */}
      <section id="faqs" style={{ background: '#FFFFFF', padding: '90px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions & Answers</span>
            <h2 style={{ fontSize: 36, fontWeight: 900, margin: '8px 0 14px', color: '#0F172A' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: 15, color: '#475569' }}>Everything you need to know about requesting a demo and onboarding your hiring team.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp size={20} color="#6D28D9" /> : <ChevronDown size={20} color="#64748B" />}
                </button>
                {openFaqIndex === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: 14.5, color: '#475569', lineHeight: 1.6, borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         SECTION 7: RICH ENTERPRISE SAAS FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer style={{ background: '#090D16', color: '#94A3B8', padding: '80px 0 40px', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: 40, marginBottom: 60 }}>
            
            {/* Col 1: Brand Info */}
            <div>
              <div style={{ marginBottom: 18 }}>
                <GetWorxsLogo size="md" />
              </div>
              <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, margin: '0 0 20px 0', maxWidth: 300 }}>
                Next-generation AI recruitment platform powering B2B hiring, ATS resume scoring, recruiter portals, and candidate vector matching.
              </p>
              <div style={{ display: 'flex', gap: 10, color: '#CBD5E1', fontSize: 12, fontWeight: 700 }}>
                <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 6, border: '1px solid #334155' }}>ISO 27001</span>
                <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 6, border: '1px solid #334155' }}>SOC2 Type II</span>
                <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 6, border: '1px solid #334155' }}>GST Compliant</span>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 18px 0' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <li><button onClick={() => setShowDemoModal(true)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 13.5 }}>Request Demo</button></li>
                <li><a href="#features" style={{ textDecoration: 'none', color: '#94A3B8' }}>AI Candidate Matching</a></li>
                <li><a href="#features" style={{ textDecoration: 'none', color: '#94A3B8' }}>ATS Resume Parser</a></li>
                <li><a href="#pricing" style={{ textDecoration: 'none', color: '#94A3B8' }}>Pricing Tiers (INR)</a></li>
              </ul>
            </div>

            {/* Col 3: Solutions */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 18px 0' }}>Solutions</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <li><a href="#features" style={{ textDecoration: 'none', color: '#94A3B8' }}>Enterprise Tech Hiring</a></li>
                <li><a href="#features" style={{ textDecoration: 'none', color: '#94A3B8' }}>Staffing & Recruitment</a></li>
                <li><a href="#pricing" style={{ textDecoration: 'none', color: '#94A3B8' }}>B2B Custom Quotations</a></li>
                <li><a href="#faqs" style={{ textDecoration: 'none', color: '#94A3B8' }}>Evaluation FAQ</a></li>
              </ul>
            </div>

            {/* Col 4: Corporate Contact */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 18px 0' }}>Corporate HQ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#94A3B8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} /> Bengaluru Tech Park, KA, India
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} /> enterprise@getworxs.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} /> +91 80 4567 8900
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} /> Global B2B Operations
                </div>
              </div>
            </div>

            {/* Col 5: Newsletter */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 18px 0' }}>Stay Updated</h4>
              <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '0 0 14px 0' }}>Get quarterly recruitment trends and product releases.</p>
              
              {newsletterSubmitted ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  ✓ Subscribed to Enterprise Insights!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="official@company.com" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0F172A', color: '#FFF', fontSize: 13, outline: 'none' }}
                  />
                  <button type="submit" style={{ padding: '10px', borderRadius: 10, background: '#6D28D9', color: '#FFF', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                    Subscribe
                  </button>
                </form>
              )}
            </div>

          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: 13 }}>
            <div>
              © 2026 GetWorxs Enterprise Tech Inc. All rights reserved. B2B Sales & Demo Platform.
            </div>
            <div style={{ display: 'flex', gap: 20, color: '#64748B' }}>
              <a href="#privacy" style={{ textDecoration: 'none', color: '#64748B' }}>Privacy Policy</a>
              <a href="#terms" style={{ textDecoration: 'none', color: '#64748B' }}>Terms of Service</a>
              <a href="#security" style={{ textDecoration: 'none', color: '#64748B' }}>Security Standards</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════
         DEMO REQUEST FORM MODAL (All 12 Requested Fields)
      ═══════════════════════════════════════════════════ */}
      {showDemoModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowDemoModal(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 720,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              padding: 32,
              margin: '0 auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 18, marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0F172A' }}>Request a GetWorxs Product Demo</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>Evaluate GetWorxs hiring platform with a live product specialist before subscribing.</p>
              </div>
              <button 
                onClick={() => { setShowDemoModal(false); setDemoSubmitted(false); }}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {demoSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>Demo Request Submitted!</h3>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#6D28D9', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
                  "Thank you. Our team will contact you to schedule your demo."
                </p>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>
                  Our enterprise sales specialist will send calendar invites to <strong>{demoForm.official_email}</strong> within 2-4 business hours.
                </p>
                <button 
                  onClick={() => { setShowDemoModal(false); setDemoSubmitted(false); }}
                  style={{ padding: '12px 30px', borderRadius: 99, background: '#6D28D9', color: '#FFF', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {demoErrorMessage && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, fontWeight: 600 }}>
                    {demoErrorMessage}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Company Name *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Acme Tech Solutions"
                      value={demoForm.company_name}
                      onChange={(e) => setDemoForm({ ...demoForm, company_name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Contact Person *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={demoForm.contact_person}
                      onChange={(e) => setDemoForm({ ...demoForm, contact_person: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Official Business Email *
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. rajesh@acmetechnology.com"
                      value={demoForm.official_email}
                      onChange={(e) => setDemoForm({ ...demoForm, official_email: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Mobile Number *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={demoForm.mobile_number}
                      onChange={(e) => setDemoForm({ ...demoForm, mobile_number: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Company Size
                    </label>
                    <select
                      value={demoForm.company_size}
                      onChange={(e) => setDemoForm({ ...demoForm, company_size: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#FFF', boxSizing: 'border-box' }}
                    >
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="500+ employees">500+ Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Industry
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Software & FinTech"
                      value={demoForm.industry}
                      onChange={(e) => setDemoForm({ ...demoForm, industry: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Number of Recruiters
                    </label>
                    <select
                      value={demoForm.number_of_recruiters}
                      onChange={(e) => setDemoForm({ ...demoForm, number_of_recruiters: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#FFF', boxSizing: 'border-box' }}
                    >
                      <option value="1-5 recruiters">1-5 recruiters</option>
                      <option value="6-15 recruiters">6-15 recruiters</option>
                      <option value="15+ recruiters">15+ recruiters</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Expected Hiring Volume
                    </label>
                    <select
                      value={demoForm.expected_hiring_volume}
                      onChange={(e) => setDemoForm({ ...demoForm, expected_hiring_volume: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#FFF', boxSizing: 'border-box' }}
                    >
                      <option value="1-10 hires/month">1-10 hires/month</option>
                      <option value="11-30 hires/month">11-30 hires/month</option>
                      <option value="30+ hires/month">30+ hires/month</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Preferred Demo Date
                    </label>
                    <input 
                      type="date"
                      value={demoForm.preferred_demo_date}
                      onChange={(e) => setDemoForm({ ...demoForm, preferred_demo_date: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Preferred Demo Time
                    </label>
                    <select
                      value={demoForm.preferred_demo_time}
                      onChange={(e) => setDemoForm({ ...demoForm, preferred_demo_time: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', background: '#FFF', boxSizing: 'border-box' }}
                    >
                      <option value="10:00 AM">10:00 AM IST</option>
                      <option value="02:00 PM">02:00 PM IST</option>
                      <option value="04:30 PM">04:30 PM IST</option>
                      <option value="07:00 PM">07:00 PM IST (US EST Friendly)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Hiring Requirements & Roles Needed
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Hiring 5 Senior Full Stack Software Engineers and 2 DevOps Specialists..."
                    value={demoForm.hiring_requirements}
                    onChange={(e) => setDemoForm({ ...demoForm, hiring_requirements: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Additional Message or Specific Evaluation Focus
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Any specific AI features, ATS integrations, or team onboarding questions..."
                    value={demoForm.additional_message}
                    onChange={(e) => setDemoForm({ ...demoForm, additional_message: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #E2E8F0', paddingTop: 18, marginTop: 6 }}>
                  <button 
                    type="button"
                    onClick={() => setShowDemoModal(false)}
                    style={{ padding: '10px 22px', borderRadius: 99, background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingDemo}
                    style={{ padding: '10px 28px', borderRadius: 99, background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)', color: '#FFF', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)' }}
                  >
                    {isSubmittingDemo ? 'Submitting...' : 'Submit Demo Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              padding: 32,
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <GetWorxsLogo size="lg" />
              <h3 style={{ margin: '14px 0 4px', fontSize: 20, fontWeight: 900, color: '#0F172A' }}>Employer Portal Login</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Sign in to manage jobs, recruiters & AI scoring</p>
            </div>

            <form onSubmit={handleEmployerLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {errorMessage && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
                  {errorMessage}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Email</label>
                <input 
                  type="email"
                  required
                  placeholder="employer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                style={{ marginTop: 8, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)', color: '#FFF', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In to Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPANY REGISTRATION MODAL */}
      {showCompanyModal && (
        <CompanyOnboardingModal 
          onClose={() => setShowCompanyModal(false)} 
          onSave={() => setShowCompanyModal(false)}
        />
      )}

    </div>
  );
};
