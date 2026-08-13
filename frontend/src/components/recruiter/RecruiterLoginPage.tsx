import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound 
} from 'lucide-react';
import { GetWorxsLogo } from '../GetWorxsLogo';

interface RecruiterLoginPageProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateHome: () => void;
}

export const RecruiterLoginPage: React.FC<RecruiterLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forced password change state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);

  const handleRecruiterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));

      const errMessage = (data.error?.message || '').toLowerCase();
      const errCode = (data.error?.code || '').toUpperCase();

      if (!res.ok && (errCode === 'MUST_CHANGE_PASSWORD' || errMessage.includes('password change') || errMessage.includes('temporary password'))) {
        setMustChangePassword(true);
        setIsSubmitting(false);
        return;
      }

      if (res.ok && data.success) {
        const user = data.data?.user;
        if (user?.role && user.role !== 'RECRUITER') {
          setLoginError(`Account registered as ${user.role}. Please use appropriate portal login.`);
          setIsSubmitting(false);
          return;
        }

        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', 'RECRUITER');
          localStorage.setItem('getworxs_user_email', user?.email || email);
          localStorage.setItem('getworxs_user_name', user?.name || '');
        }

        onLoginSuccess(data);
      } else {
        setLoginError(data.error?.message || 'Invalid recruiter email or password.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Network error during recruiter authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangeError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    setChangeError(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/first-login-change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          temporary_password: password,
          new_password: newPassword
        })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', 'RECRUITER');
          localStorage.setItem('getworxs_user_email', email);
        }

        setMustChangePassword(false);
        onLoginSuccess(data);
      } else {
        setChangeError(data.error?.message || 'Password update failed. Password must be 8+ chars with uppercase, lowercase, number, and special char.');
      }
    } catch (err: any) {
      setChangeError(err?.message || 'Error updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', width: '100%', margin: '60px auto', padding: '0 20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', marginBottom: 14 }}>
          <GetWorxsLogo size="lg" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Recruiter Seat Authentication
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
          Invitation-based portal for company recruiter team members
        </p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-md)' }}>
        
        {/* Notice Banner */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(109, 40, 217, 0.08)', border: '1px solid rgba(109, 40, 217, 0.2)', padding: '10px 14px', borderRadius: 8, fontSize: 12.5, color: '#6d28d9', fontWeight: 600, marginBottom: 20 }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <div>Recruiters are invited by Employer Admins. Public self-registration is disabled.</div>
        </div>

        {mustChangePassword ? (
          <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <KeyRound size={32} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '8px 0 4px 0' }}>Update Temporary Password</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>You are logging in with a temporary password for the first time.</p>
            </div>

            {changeError && (
              <div style={{ padding: '10px 14px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 12.5, fontWeight: 600 }}>
                {changeError}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>New Strong Password:</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Confirm New Password:</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 800, marginTop: 8 }}>
              {isSubmitting ? 'Updating Password...' : 'Save New Password & Access Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecruiterLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {loginError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 12.5, fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>Recruiter Email Address:</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  required 
                  placeholder="recruiter@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>Password / Temporary Key:</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  placeholder="••••••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary" 
              style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#6d28d9' }}
            >
              {isSubmitting ? 'Authenticating...' : <>Access Recruiter Workspace <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer', fontWeight: 600 }}>
            ← Return to Public Homepage
          </button>
        </div>

      </div>
    </div>
  );
};
