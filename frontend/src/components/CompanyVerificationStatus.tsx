import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  Edit3,
  Send,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock
} from 'lucide-react';
import { CompanyOnboardingModal } from './CompanyOnboardingModal';

export interface CompanyVerificationData {
  id: number | string;
  name: string;
  legal_name: string;
  company_code: string;
  industry: string;
  company_size: string;
  website?: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postal_code: string;
  tax_gst_number?: string;
  business_reg_number?: string;
  year_established?: number;
  primary_contact_name?: string;
  primary_contact_designation?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  logo_url?: string;
  description?: string;
  approval_status: 'draft' | 'pending_verification' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  submitted_at?: string;
  reviewed_at?: string;
  review_notes?: string;
  rejection_reason?: string;
  is_verified: boolean;
  documents?: {
    id?: number | string;
    document_type: string;
    document_name: string;
    document_url: string;
    is_required: boolean;
    status: string;
    uploaded_at?: string;
  }[];
}

interface CompanyVerificationStatusProps {
  company: CompanyVerificationData;
  onCompanyUpdate?: (updatedCompany: CompanyVerificationData) => void;
}

export const CompanyVerificationStatus: React.FC<CompanyVerificationStatusProps> = ({
  company,
  onCompanyUpdate
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitSuccessMessage, setResubmitSuccessMessage] = useState<string | null>(null);

  const handleResubmit = () => {
    setIsResubmitting(true);
    setTimeout(() => {
      setIsResubmitting(false);
      const updated: CompanyVerificationData = {
        ...company,
        approval_status: 'pending_verification',
        submitted_at: new Date().toISOString(),
        review_notes: undefined,
        rejection_reason: undefined
      };
      setResubmitSuccessMessage('Your application has been resubmitted successfully for Platform Admin review!');
      if (onCompanyUpdate) {
        onCompanyUpdate(updated);
      }
      setTimeout(() => setResubmitSuccessMessage(null), 5000);
    }, 1200);
  };

  const getStatusBadge = () => {
    switch (company.approval_status) {
      case 'pending_verification':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <Clock size={18} className="animate-spin-slow" />
            <span>Pending Verification</span>
          </div>
        );
      case 'under_review':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#6366f1',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <AlertTriangle size={18} />
            <span>Action Required: Changes Requested</span>
          </div>
        );
      case 'rejected':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <XCircle size={18} />
            <span>Registration Rejected</span>
          </div>
        );
      case 'suspended':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(225, 29, 72, 0.12)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#e11d48',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <ShieldAlert size={18} />
            <span>Account Suspended</span>
          </div>
        );
      default:
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(107, 114, 128, 0.12)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <Clock size={18} />
            <span>Draft Application</span>
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header Banner */}
      <div className="widget-box" style={{
        padding: '36px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: company.approval_status === 'under_review' ? 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' :
                      company.approval_status === 'rejected' ? 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)' :
                      'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '16px' }}>
            {getStatusBadge()}
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            margin: '12px 0',
            letterSpacing: '-0.02em'
          }}>
            Company Verification Required
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: '640px',
            margin: '0 auto 24px',
            lineHeight: 1.6
          }}>
            Your company verification is under review. Recruitment features will be available after approval.
          </p>

          {resubmitSuccessMessage && (
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 24px',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={20} />
              <span>{resubmitSuccessMessage}</span>
            </div>
          )}

          {/* SLA Card */}
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                Estimated Review Time
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={18} />
                <span>24–48 Hours</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                Company Code
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                {company.company_code || 'CMP-2026-PENDING'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                Recruitment Features
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} />
                <span>Locked until Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Feedback Box (If Request Changes or Rejected) */}
      {company.approval_status === 'under_review' && company.review_notes && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          borderRadius: '16px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Platform Admin Action Needed
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
                The Platform Admin reviewed your registration and requested updates:
              </p>
              <div style={{
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                borderLeft: '4px solid #6366f1',
                fontSize: '14px',
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                "{company.review_notes}"
              </div>

              <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  <Edit3 size={16} />
                  <span>Update Application & Uploads</span>
                </button>

                <button
                  onClick={handleResubmit}
                  disabled={isResubmitting}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  {isResubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{isResubmitting ? 'Submitting...' : 'Resubmit Application'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {company.approval_status === 'rejected' && company.rejection_reason && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}>
              <XCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Rejection Reason
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Your company registration was not approved for the following reason:
              </p>
              <div style={{
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                borderLeft: '4px solid #ef4444',
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: 1.6
              }}>
                "{company.rejection_reason}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Application Summary Card */}
      <div className="widget-box" style={{ marginTop: '28px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Building2 size={20} color="var(--color-primary)" />
            <span>Submitted Company Profile</span>
          </h2>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px' }}
          >
            <Edit3 size={14} />
            <span>Edit Details</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Basic Info */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Basic Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div><strong>Company Name:</strong> {company.name}</div>
              <div><strong>Legal Name:</strong> {company.legal_name}</div>
              <div><strong>Industry:</strong> {company.industry}</div>
              <div><strong>Company Size:</strong> {company.company_size}</div>
              {company.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="var(--text-muted)" />
                  <a href={company.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business & Address */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Business & Address
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div><strong>GST / Tax ID:</strong> {company.tax_gst_number || 'N/A'}</div>
              <div><strong>Business Reg No:</strong> {company.business_reg_number || 'N/A'}</div>
              <div><strong>Year Established:</strong> {company.year_established || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                <span>{company.address}, {company.city}, {company.state}, {company.country} - {company.postal_code}</span>
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Primary Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div><strong>Full Name:</strong> {company.primary_contact_name || 'N/A'}</div>
              <div><strong>Designation:</strong> {company.primary_contact_designation || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--text-muted)" />
                <span>{company.primary_contact_email || company.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="var(--text-muted)" />
                <span>{company.primary_contact_phone || company.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--color-primary)" />
            <span>Uploaded Verification Documents</span>
          </h4>

          {company.documents && company.documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {company.documents.map((doc, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <FileText size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {doc.document_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {doc.document_type.replace('_', ' ')} {doc.is_required && '(Required)'}
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: '13px' }}>
              No document uploads recorded. Please click <strong>Edit Details</strong> to upload your Company Registration Certificate.
            </div>
          )}
        </div>
      </div>

      {/* Edit Registration Modal */}
      {isEditModalOpen && (
        <CompanyOnboardingModal
          company={company}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedData) => {
            setIsEditModalOpen(false);
            if (onCompanyUpdate) {
              onCompanyUpdate(updatedData);
            }
          }}
        />
      )}
    </div>
  );
};
