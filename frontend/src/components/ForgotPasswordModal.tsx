import React, { useState } from 'react';
import { Mail, KeyRound, CheckCircle2, X } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage({ text: 'Reset code & instructions sent to your email address.', type: 'success' });
        setStep('reset');
      } else {
        setMessage({ text: data.error?.message || 'Failed to process password reset request.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Network error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);

    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: otpToken || 'mock_reset_token',
          new_password: newPassword
        })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStep('success');
      } else {
        setMessage({ text: data.error?.message || 'Password reset failed.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Error completing password reset.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', right: 18, top: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(109, 40, 217, 0.1)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <KeyRound size={24} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Reset Password
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Works for Candidate, Employer, Recruiter, and Admin accounts
          </p>
        </div>

        {message && (
          <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, marginBottom: 16, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
            {message.text}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendResetEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Account Email Address:</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13.5 }} 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 800 }}>
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Reset Code / Token:</label>
              <input type="text" required placeholder="Enter 6-digit code..." value={otpToken} onChange={e => setOtpToken(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>New Password:</label>
              <input type="password" required placeholder="Min 8 characters..." value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Confirm New Password:</label>
              <input type="password" required placeholder="Re-enter password..." value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 800 }}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 size={44} style={{ color: '#10b981', marginBottom: 12 }} />
            <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0' }}>Password Reset Complete!</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Your password has been updated successfully. You can now log in with your new credentials.</p>
            <button className="btn-primary" onClick={onClose} style={{ padding: '10px 24px' }}>Close & Sign In</button>
          </div>
        )}

      </div>
    </div>
  );
};
