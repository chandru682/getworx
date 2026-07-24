import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';

interface LoginPageProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister
}) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendOtp = () => {
    if (!emailOrPhone) return;
    setOtpSent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          email: emailOrPhone,
          name: emailOrPhone.split('@')[0] || 'Alex Morgan',
          title: 'Senior Full-Stack Engineer'
        });
      }, 1000);
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="widget-box" style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
        <div className="reg-success-icon">
          <CheckCircle2 size={44} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Login Successful!</h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Welcome back to GetWorxs! Redirecting to your candidate dashboard...
        </p>
        <div style={{ marginTop: '20px' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px', borderTopColor: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
      <div className="reg-layout" style={{ gridTemplateColumns: '1fr 1.1fr' }}>
        
        {/* Left Column: GetWorxs Login Identity Banner */}
        <div className="reg-left-banner" style={{ top: '80px' }}>
          <div style={{ marginBottom: '24px' }}>
            <GetWorxsLogo size="lg" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.3' }}>
            Welcome back to India's & Global #1 Job Portal
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Direct Recruiter & HR Calls
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <Mail size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Real-time Application Status Updates
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <Lock size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                100% Encrypted & Confidential Data
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="widget-box" style={{ padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Candidate Login
            </h2>
            <button 
              onClick={onNavigateRegister} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Register for Free
            </button>
          </div>

          {/* Login Method Toggle Pills */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-neutral-light)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            <button 
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`profile-pill-tab ${loginMethod === 'password' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Lock size={14} /> Password
            </button>
            <button 
              type="button"
              onClick={() => setLoginMethod('otp')}
              className={`profile-pill-tab ${loginMethod === 'otp' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Smartphone size={14} /> OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <label className="form-label">
              <span>Email ID / Mobile Number</span>
              <input 
                className="form-input"
                placeholder="Enter registered Email or Mobile"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                required
              />
            </label>

            {loginMethod === 'password' ? (
              <label className="form-label">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Password</span>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Reset password link sent to your registered email address!'); }} style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    className="form-input" 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    className="form-input" 
                    placeholder="Enter 4-digit OTP"
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={handleSendOtp}
                    style={{ fontSize: '13px' }}
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: '600' }}>
                    ✓ OTP sent to your registered mobile number!
                  </span>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: 'var(--radius-lg)', marginTop: '6px' }}
            >
              {isSubmitting ? (
                <span className="spinner" />
              ) : (
                <>
                  <span>Login to Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Social Logins */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR LOGIN WITH</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                style={{ flex: 1, justifyContent: 'center', fontSize: '13px', gap: '6px' }}
              >
                <span>Google</span>
              </button>
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                style={{ flex: 1, justifyContent: 'center', fontSize: '13px', gap: '6px' }}
              >
                <span>LinkedIn</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
