import { useState, useEffect } from 'react';
import {
  Check,
  Shield,
  Zap,
  Sparkles,
  Crown,
  Lock,
  ArrowRight,
  X,
  AlertCircle,
  Building2,
  Users,
  FileText
} from 'lucide-react';
import { type CurrencyCode } from '../utils/currency';

interface Plan {
  id?: number;
  plan_code: string;
  name: string;
  description: string;
  price_usd: number;
  price_inr: number;
  duration_days: number;
  job_posting_limit: number;
  recruiter_limit: number;
  resume_views_limit: number;
  ai_credits: number;
  features: string[];
  badge?: string;
}


interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan, currency: CurrencyCode) => void;
  currencyCode?: CurrencyCode;
  reasonMessage?: string;
  isExpired?: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  {
    plan_code: 'starter',
    name: 'Starter Plan',
    description: 'Essential hiring toolset for growing startups & boutique teams.',
    price_usd: 199,
    price_inr: 14999,
    duration_days: 30,
    job_posting_limit: 5,
    recruiter_limit: 2,
    resume_views_limit: 100,
    ai_credits: 500,
    badge: 'Basic',
    features: [
      '5 Active Job Listings',
      '2 Recruiter Seats',
      '100 Candidate Resume Views',
      '500 AI Hiring Credits',
      'Standard Candidate Pipeline',
      'Email Support'
    ]
  },
  {
    plan_code: 'professional',
    name: 'Professional Plan',
    description: 'Complete recruitment suite for mid-sized growth companies.',
    price_usd: 499,
    price_inr: 39999,
    duration_days: 30,
    job_posting_limit: 25,
    recruiter_limit: 10,
    resume_views_limit: 1000,
    ai_credits: 2500,
    badge: 'Most Popular',
    features: [
      '25 Active Job Listings',
      '10 Recruiter Seats',
      '1,000 Candidate Resume Views',
      '2,500 AI Hiring Credits',
      'AI Candidate Matching & Scoring',
      'Global PPP Salary Calculator Access',
      'Priority Email & Live Chat Support'
    ]
  },
  {
    plan_code: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Unlimited scale, dedicated account management & custom workflows.',
    price_usd: 999,
    price_inr: 79999,
    duration_days: 365,
    job_posting_limit: 100,
    recruiter_limit: 50,
    resume_views_limit: 10000,
    ai_credits: 10000,
    badge: 'Best Value',
    features: [
      '100 Active Job Listings',
      'Up to 50 Recruiter Seats',
      '10,000 Candidate Resume Views',
      '10,000 AI Hiring Credits',
      'Dedicated Account Manager',
      'Custom API & ATS Integrations',
      '24/7 SLA Priority Support'
    ]
  }
];

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currencyCode = 'USD',
  reasonMessage,
  isExpired = false
}) => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [currency, setCurrency] = useState<CurrencyCode>(currencyCode);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('professional');

  useEffect(() => {
    setCurrency(currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API_URL}/api/v1/subscriptions/plans`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPlans(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch subscription plans from API, using default fallback plans', err);
    }
  };


  if (!isOpen) return null;

  const formatPrice = (plan: Plan) => {
    if (currency === 'INR') {
      return `₹${plan.price_inr.toLocaleString('en-IN')}`;
    }
    return `$${plan.price_usd.toLocaleString('en-US')}`;
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="modal-card shadow-2xl" style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '24px',
        maxWidth: '1140px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        color: 'var(--text-primary, #0f172a)'
      }}>
        {/* Header Section */}
        <div style={{
          padding: '36px 40px 24px 40px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Crown size={14} /> GetWorxs Employer Suite
            </span>

            {/* Currency Selector Pill */}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '20px',
              padding: '2px'
            }}>
              <button
                onClick={() => setCurrency('USD')}
                style={{
                  padding: '4px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: currency === 'USD' ? '#6366f1' : 'transparent',
                  color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                style={{
                  padding: '4px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: currency === 'INR' ? '#6366f1' : 'transparent',
                  color: currency === 'INR' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                INR (₹)
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0 4px 0', letterSpacing: '-0.5px' }}>
            {isExpired ? 'Renew Your Employer Subscription' : 'Select Your Employer Subscription Plan'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
            {reasonMessage ||
              (isExpired
                ? 'Your previous subscription plan has expired. Choose a renewal plan below to continue posting jobs and accessing global talent.'
                : 'Your employer account has been approved! Choose a subscription plan to activate your Employer Dashboard and start hiring.')}
          </p>

          {reasonMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              <span>{reasonMessage}</span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div style={{ padding: '36px 40px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            alignItems: 'stretch'
          }}>
            {plans.map((plan) => {
              const isPopular = plan.plan_code === 'professional';
              const isSelected = selectedPlanCode === plan.plan_code;

              return (
                <div
                  key={plan.plan_code}
                  onClick={() => setSelectedPlanCode(plan.plan_code)}
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    padding: '28px',
                    border: isPopular || isSelected
                      ? '2px solid #6366f1'
                      : '1px solid var(--border-color, #e2e8f0)',
                    background: isSelected
                      ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(255, 255, 255, 1) 100%)'
                      : 'var(--card-bg, #ffffff)',
                    boxShadow: isPopular || isSelected
                      ? '0 20px 25px -5px rgba(99, 102, 241, 0.15)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {plan.badge && (
                    <span style={{
                      position: 'absolute',
                      top: '-14px',
                      right: '24px',
                      background: isPopular
                        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                        : '#0f172a',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0' }}>
                      {plan.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', minHeight: '36px', margin: '0 0 20px 0' }}>
                      {plan.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '0 0 20px 0' }}>
                      <span style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>
                        {formatPrice(plan)}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', fontWeight: '600' }}>
                        / {plan.duration_days >= 365 ? 'year' : 'month'}
                      </span>
                    </div>

                    {/* Key Metrics Pill Matrix */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      background: 'var(--bg-secondary, #f8fafc)',
                      padding: '12px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} style={{ color: '#6366f1' }} />
                        <span><strong>{plan.job_posting_limit}</strong> Jobs</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} style={{ color: '#8b5cf6' }} />
                        <span><strong>{plan.recruiter_limit}</strong> Recruiters</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} style={{ color: '#06b6d4' }} />
                        <span><strong>{plan.resume_views_limit}</strong> Resumes</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} style={{ color: '#f59e0b' }} />
                        <span><strong>{plan.ai_credits}</strong> AI Credits</span>
                      </div>
                    </div>

                    {/* Feature list */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            borderRadius: '50%',
                            padding: '2px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px'
                          }}>
                            <Check size={12} />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan, currency);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      background: isPopular || isSelected
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        : '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: isPopular ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-secondary, #64748b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} style={{ color: '#16a34a' }} /> 256-bit Bank Grade Encrypted Payment
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} style={{ color: '#6366f1' }} /> Instant Employer Dashboard Activation
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} style={{ color: '#8b5cf6' }} /> Cancel or Change Plans Anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
