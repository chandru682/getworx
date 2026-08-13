import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';
import { CompanyOnboardingModal } from './CompanyOnboardingModal';

interface LoginPageProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister
}) => {
  const [selectedRole, _setSelectedRole] = useState<'auto' | 'candidate' | 'recruiter' | 'employer' | 'admin'>('auto');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string>('candidate');

  // Forced First Login Password Change State
  const [showMustChangePasswordModal, setShowMustChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (!emailOrPhone) return;
    setOtpSent(true);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotPassword(false);
      setForgotEmail('');
    }, 3000);
  };

  const determineRole = (userRoleFromBackend?: string) => {
    if (selectedRole !== 'auto') {
      return selectedRole;
    }
    return (userRoleFromBackend || 'candidate').toLowerCase();
  };

  const handleFirstLoginPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangePasswordError('New password and confirm password do not match.');
      return;
    }
    setIsChangingPassword(true);
    setChangePasswordError(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/first-login-change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOrPhone,
          temporary_password: password,
          new_password: newPassword
        })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const user = data.data?.user;
        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;
        const role = determineRole(user?.role);

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', role.toUpperCase());
          localStorage.setItem('getworxs_user_email', user?.email || emailOrPhone);
          localStorage.setItem('getworxs_user_name', user?.name || '');
        }

        setShowMustChangePasswordModal(false);
        setDetectedRole(role);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            email: user?.email || emailOrPhone,
            name: user?.name || emailOrPhone.split('@')[0],
            role: role.toUpperCase()
          });
        }, 1000);
      } else {
        setChangePasswordError(data.error?.message || 'Failed to update password. Ensure your new password meets complexity rules (8+ chars, upper, lower, number, special char).');
      }
    } catch (err) {
      setChangePasswordError('Network error occurred during password update.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password })
      });
      const data = await res.json().catch(() => ({}));

      const errMessage = (data.error?.message || '').toLowerCase();
      const errCode = (data.error?.code || '').toUpperCase();

      if (!res.ok && (errCode === 'MUST_CHANGE_PASSWORD' || errMessage.includes('password change') || errMessage.includes('temporary password'))) {
        setIsSubmitting(false);
        setShowMustChangePasswordModal(true);
        return;
      }

      if (res.ok && data.success) {
        const user = data.data?.user;
        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;

        const role = determineRole(user?.role);

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', role.toUpperCase());
          localStorage.setItem('getworxs_user_email', user?.email || emailOrPhone);
          localStorage.setItem('getworxs_user_name', user?.name || '');
        }

        setDetectedRole(role);
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(data);
        }, 1000);
        return;
      } else {
        setIsSubmitting(false);
        setLoginError(errMessage || data.error?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setLoginError('Network error occurred during login. Please try again.');
    }
  };

  const getRoleBadgeLabel = (r: string) => {
    switch (r) {
      case 'admin': return 'Platform Admin Console';
      case 'recruiter': return 'Recruiter Dashboard';
      case 'employer': return 'Employer Dashboard';
      default: return 'Candidate Dashboard';
    }
  };

  if (isSuccess) {
    return (
      <div className="widget-box" style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
        <div className="reg-success-icon">
          <CheckCircle2 size={44} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Authentication Successful!</h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Role detected: <strong style={{ color: 'var(--color-primary)' }}>{getRoleBadgeLabel(detectedRole)}</strong>
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Redirecting to your dashboard...
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
        
        {/* Left Column: GetWorxs Unified Brand Banner */}
        <div className="reg-left-banner" style={{ top: '80px' }}>
          <div style={{ marginBottom: '24px' }}>
            <GetWorxsLogo size="lg" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.3' }}>
            Welcome to GetWorxs Global Talent Platform
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.6' }}>
            Single secure sign-in portal for Candidates, Employers, Recruiters, and Platform Administrators.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Unified Single Sign-On (SSO) & Role Detection
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <Mail size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Real-time Status Updates & Role Access
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <Lock size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Enterprise Encrypted JWT Authentication
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Login Form */}
        <div className="widget-box" style={{ padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Sign In
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Enter your registered Email or Mobile Number
              </p>
            </div>
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
            
            {loginError && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '13px', fontWeight: '500', marginBottom: '14px' }}>
                {loginError}
              </div>
            )}

            <label className="form-label">
              <span>Email ID / Mobile Number</span>
              <input 
                className="form-input"
                placeholder="e.g. candidate@example.com or +1 555-0192"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                required
              />
            </label>

            {loginMethod === 'password' ? (
              <label className="form-label">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
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
                  <span>Sign In to Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Social Login Dividers & OAuth Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 10px', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => alert('Google Single Sign-On integration coming soon!')}
                className="btn-outline"
                style={{ flex: 1, padding: '9px 12px', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
              >
                <span>🌐 Google</span>
              </button>
              <button
                type="button"
                onClick={() => alert('LinkedIn Jobs OAuth integration coming soon!')}
                className="btn-outline"
                style={{ flex: 1, padding: '9px 12px', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, color: '#0077b5' }}
              >
                <span>in LinkedIn</span>
              </button>
            </div>

            {/* Registration Options Footer */}
            <div style={{ margin: '16px 0 0', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>New User?</span>
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <UserPlus size={14} />
                  <span>Register as Candidate</span>
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px' }}>Reset Your Password</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Enter your registered email address and we'll send you a password reset link.
            </p>

            {forgotSent ? (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                ✓ Password reset link sent! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="form-label">
                  <span>Registered Email</span>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="Enter email address"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-outline" onClick={() => setShowForgotPassword(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Send Reset Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Forced First Login Password Change Modal */}
      {showMustChangePasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'rgba(109, 40, 217, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d28d9'
              }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Password Change Required
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  First login for <strong style={{ color: 'var(--text-primary)' }}>{emailOrPhone}</strong>
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 16px' }}>
              For security reasons, you must change your temporary password before accessing the Employer Dashboard.
            </p>

            {changePasswordError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '12.5px',
                fontWeight: 600,
                marginBottom: 16
              }}>
                ⚠️ {changePasswordError}
              </div>
            )}

            <form onSubmit={handleFirstLoginPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="form-label">
                <span>New Permanent Password</span>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter strong new password (8+ chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                <span>Confirm New Password</span>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <div style={{
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                background: 'var(--bg-neutral-light)',
                padding: '10px 12px',
                borderRadius: '8px',
                lineHeight: '1.4'
              }}>
                🔒 Password must contain 8+ characters, including uppercase, lowercase, number, and special character (!@#$%^&*).
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowMustChangePasswordModal(false)}
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isChangingPassword}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isChangingPassword ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <span>Update Password & Login</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Registration Modal */}
      {showCompanyModal && (
        <CompanyOnboardingModal
          onClose={() => setShowCompanyModal(false)}
          onSave={(data) => {
            alert(`Company profile "${data.name}" registered successfully! Application submitted for Platform Admin review.`);
            setShowCompanyModal(false);
          }}
        />
      )}
    </div>
  );
};

