import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert 
} from 'lucide-react';
import { GetWorxsLogo } from '../GetWorxsLogo';

interface AdminLoginPageProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
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

      if (res.ok && data.success) {
        const user = data.data?.user;
        const role = (user?.role || '').toUpperCase();
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'PLATFORM_ADMIN') {
          setLoginError('Access Denied: Account does not possess Super Admin permissions.');
          setIsSubmitting(false);
          return;
        }

        const accessToken = data.data?.access_token;
        const refreshToken = data.data?.refresh_token;

        if (accessToken) {
          localStorage.setItem('getworxs_access_token', accessToken);
          localStorage.setItem('getworxs_refresh_token', refreshToken || '');
          localStorage.setItem('getworxs_user_role', 'ADMIN');
          localStorage.setItem('getworxs_user_email', user?.email || email);
          localStorage.setItem('getworxs_user_name', user?.name || '');
        }

        onLoginSuccess(data);
      } else {
        setLoginError(data.error?.message || 'Invalid Super Admin credentials or locked account.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 14 }}>
            <GetWorxsLogo size="lg" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            Platform Admin Console Login
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Restricted System Access & Governance Control Center
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#991b1b', fontWeight: 700, marginBottom: 20 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <div>Warning: All administrative activities are audited and logged.</div>
          </div>

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {loginError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontSize: 12.5, fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>Admin Email:</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  required 
                  placeholder="admin@getworxs.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>Master Password:</label>
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
              style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#0F172A' }}
            >
              {isSubmitting ? 'Verifying Super Admin Credentials...' : <>Unlock Platform Console <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              ← Return to Main Website
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
