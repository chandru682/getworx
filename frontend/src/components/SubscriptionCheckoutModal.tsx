import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode
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
}

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  currency: CurrencyCode;
  onPaymentSuccess: (subscriptionData: any) => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  currency,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'invoice'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Authorized Company Representative');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const price = currency === 'INR' ? plan.price_inr : plan.price_usd;
  const formattedPrice = currency === 'INR'
    ? `₹${price.toLocaleString('en-IN')}`
    : `$${price.toLocaleString('en-US')}`;

  const tax = Math.round(price * 0.18);
  const totalAmount = price + tax;
  const formattedTotal = currency === 'INR'
    ? `₹${totalAmount.toLocaleString('en-IN')}`
    : `$${totalAmount.toLocaleString('en-US')}`;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');

    try {
      const res = await fetch(`${API_URL}/api/v1/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          plan_code: plan.plan_code,
          payment_method: paymentMethod === 'card' ? 'Credit Card' : paymentMethod.toUpperCase(),
          currency: currency,
          card_number_last4: cardNumber.slice(-4) || '4242'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onPaymentSuccess(data.data);
        }, 1200);
      } else {
        setErrorMsg(data.error?.message || data.detail || 'Payment authorization failed. Please check payment details and retry.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
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
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="modal-card shadow-2xl" style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '24px',
        maxWidth: '780px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        color: 'var(--text-primary, #0f172a)'
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Secure Payment Authorization
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0' }}>
              Activate {plan.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              padding: '8px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <CheckCircle2 size={64} style={{ color: '#16a34a', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Payment Approved & Activated!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)' }}>
              Your Employer Subscription ({plan.name}) is now live. Redirecting to your Employer Dashboard...
            </p>
          </div>
        ) : (
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            {/* Form Column */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Select Payment Method</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: paymentMethod === 'card' ? '2px solid #6366f1' : '1px solid var(--border-color, #cbd5e1)',
                    background: paymentMethod === 'card' ? '#f5f3ff' : 'transparent',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CreditCard size={16} style={{ color: '#6366f1' }} />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: paymentMethod === 'upi' ? '2px solid #6366f1' : '1px solid var(--border-color, #cbd5e1)',
                    background: paymentMethod === 'upi' ? '#f5f3ff' : 'transparent',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <QrCode size={16} style={{ color: '#8b5cf6' }} />
                  UPI / NetBanking
                </button>
              </div>

              {errorMsg && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary, #475569)' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary, #475569)' }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary, #475569)' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary, #475569)' }}>
                      Security CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="CVV"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: isProcessing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Lock size={16} />
                  <span>{isProcessing ? 'Authorizing Payment...' : `Authorize & Pay ${formattedTotal}`}</span>
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div style={{
              background: 'var(--bg-secondary, #f8fafc)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px 0', color: '#6366f1' }}>
                  Order Summary
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>{plan.name}</span>
                  <span style={{ fontWeight: '700' }}>{formattedPrice}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                  <span>Estimated Tax (18%)</span>
                  <span>{currency === 'INR' ? `₹${tax.toLocaleString('en-IN')}` : `$${tax.toLocaleString('en-US')}`}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color, #cbd5e1)', margin: '12px 0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#6366f1' }}>{formattedTotal}</span>
                </div>

                <div style={{ marginTop: '16px', background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '12px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>Subscription Includes:</div>
                  <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--text-secondary, #64748b)' }}>
                    <li>{plan.job_posting_limit} Active Job Posts</li>
                    <li>{plan.recruiter_limit} Recruiter Seats</li>
                    <li>{plan.ai_credits} AI Hiring Credits</li>
                    <li>Instant Dashboard Access</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '20px' }}>
                <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                <span>SSL Encrypted & Guaranteed 30-day Money Back</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
