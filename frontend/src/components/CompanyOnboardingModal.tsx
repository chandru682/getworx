import React, { useState } from 'react';
import {
  X,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import type { CompanyVerificationData } from './CompanyVerificationStatus';

interface CompanyOnboardingModalProps {
  company?: CompanyVerificationData;
  onClose: () => void;
  onSave: (updatedData: CompanyVerificationData) => void;
}

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({
  company,
  onClose,
  onSave
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: company?.name || '',
    legal_name: company?.legal_name || '',
    industry: company?.industry || 'Software & Technology',
    company_size: company?.company_size || '51-200',
    website: company?.website || '',
    email: company?.email || '',
    phone: company?.phone || '',
    tax_gst_number: company?.tax_gst_number || '',
    business_reg_number: company?.business_reg_number || '',
    year_established: company?.year_established || 2020,
    country: company?.country || 'United States',
    state: company?.state || 'California',
    city: company?.city || 'San Francisco',
    address: company?.address || '',
    postal_code: company?.postal_code || '',
    primary_contact_name: company?.primary_contact_name || '',
    primary_contact_designation: company?.primary_contact_designation || '',
    primary_contact_email: company?.primary_contact_email || '',
    primary_contact_phone: company?.primary_contact_phone || '',
    description: company?.description || '',
    logo_url: company?.logo_url || ''
  });

  const [documents, setDocuments] = useState<{
    document_type: string;
    document_name: string;
    document_url: string;
    is_required: boolean;
    status: string;
  }[]>(
    company?.documents && company.documents.length > 0
      ? company.documents.map(d => ({
          document_type: d.document_type,
          document_name: d.document_name,
          document_url: d.document_url,
          is_required: d.is_required,
          status: d.status || 'uploaded'
        }))
      : [
          {
            document_type: 'registration_certificate',
            document_name: 'Company_Registration_Certificate.pdf',
            document_url: 'https://storage.getworxs.com/docs/reg_cert.pdf',
            is_required: true,
            status: 'uploaded'
          }
        ]
  );

  const [newDocType, setNewDocType] = useState('gst_tax_certificate');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  const handleAddDocument = () => {
    if (!newDocName || !newDocUrl) return;
    setDocuments(prev => [
      ...prev,
      {
        document_type: newDocType,
        document_name: newDocName,
        document_url: newDocUrl,
        is_required: newDocType === 'registration_certificate',
        status: 'uploaded'
      }
    ]);
    setNewDocName('');
    setNewDocUrl('');
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    let accessToken: string | null = localStorage.getItem('getworxs_access_token');
    let regEmail = (formData.primary_contact_email || formData.email || `company_${Date.now()}@getworxs.com`).trim();
    const regPassword = 'Company123!Password';

    // Step 1: Ensure employer user account and JWT token
    if (!accessToken) {
      try {
        let registerRes = await fetch(`${API_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.primary_contact_name || formData.name || 'Company Admin',
            email: regEmail,
            password: regPassword,
            role: 'EMPLOYER'
          })
        });

        // If email already exists, append unique timestamp suffix for employer account creation
        if (registerRes.status === 409) {
          const parts = regEmail.split('@');
          regEmail = `${parts[0]}_${Date.now()}@${parts[1] || 'getworxs.com'}`;
          registerRes = await fetch(`${API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.primary_contact_name || formData.name || 'Company Admin',
              email: regEmail,
              password: regPassword,
              role: 'EMPLOYER'
            })
          });
        }

        // Login to get JWT token
        const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword })
        });
        const loginData = await loginRes.json().catch(() => ({}));
        if (loginRes.ok && loginData.success) {
          accessToken = loginData.data?.access_token || null;
          if (accessToken) {
            localStorage.setItem('getworxs_access_token', accessToken);
          }
        }
      } catch (err: any) {
        console.warn('Authentication helper warning during registration:', err);
      }
    }

    // Step 2: POST company details to /api/v1/companies → saves to companies table in MySQL


    try {
      const companyPayload: any = {
        name: (formData.name || 'Enterprise Company').trim(),
        legal_name: (formData.legal_name || formData.name || 'Enterprise Company Inc.').trim(),
        industry: formData.industry || 'Software & Technology',
        company_size: formData.company_size || '51-200',
        email: (formData.email || regEmail).trim(),
        phone: (formData.phone || '9876543210').trim(),
        country: (formData.country || 'India').trim(),
        state: (formData.state || 'Tamil Nadu').trim(),
        city: (formData.city || 'Chennai').trim(),
        address: (formData.address || 'Not provided').trim(),
        postal_code: (formData.postal_code || '600001').trim(),
        website: formData.website?.trim() || null,
        tax_gst_number: formData.tax_gst_number?.trim() || null,
        business_reg_number: formData.business_reg_number?.trim() || null,
        year_established: formData.year_established ? Number(formData.year_established) : null,
        primary_contact_name: formData.primary_contact_name?.trim() || null,
        primary_contact_designation: formData.primary_contact_designation?.trim() || null,
        primary_contact_email: formData.primary_contact_email?.trim() || null,
        primary_contact_phone: formData.primary_contact_phone?.trim() || null,
        logo_url: formData.logo_url?.trim() || null,
        description: formData.description?.trim() || null,
        branches: [],
        documents: documents.map(d => ({
          document_type: d.document_type,
          document_name: d.document_name,
          document_url: d.document_url,
          is_required: d.is_required
        }))
      };

      const companyRes = await fetch(`${API_URL}/api/v1/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(companyPayload)
      });
      const companyData = await companyRes.json().catch(() => ({}));
      if (companyRes.ok && companyData.success && companyData.data) {
        console.log('✅ Company saved to MySQL database successfully:', companyData.data);
        const savedCompany = companyData.data;

        try {
          const existing = JSON.parse(localStorage.getItem('getworxs_registered_companies') || '[]');
          const filteredList = existing.filter((c: any) => c.id !== savedCompany.id && c.name !== savedCompany.name);
          const nextList = [savedCompany, ...filteredList];
          localStorage.setItem('getworxs_registered_companies', JSON.stringify(nextList));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.warn('Could not save company to local storage cache:', e);
        }

        setIsSubmitting(false);
        onSave(savedCompany);
      } else {
        const msg = companyData.error?.message || companyData.message || companyData.detail || 'Failed to register company.';
        setErrorMessage(`Company Registration Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.warn('Could not save company to backend:', err);
      setErrorMessage(`Error connecting to company service: ${err.message || err}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.05), rgba(79, 70, 229, 0.05))'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={24} color="var(--color-primary)" />
              <span>Enterprise Company Registration</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Provide accurate company and business verification details for Platform Admin review.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{
          padding: '16px 28px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {[
            { step: 1, label: 'Basic Info' },
            { step: 2, label: 'Business & Address' },
            { step: 3, label: 'Primary Contact' },
            { step: 4, label: 'Document Uploads' }
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: activeStep === s.step ? 1 : 0.6
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: activeStep === s.step ? 'var(--color-primary)' : 'var(--border-color)',
                color: activeStep === s.step ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}>
                {s.step}
              </div>
              <span style={{ fontSize: '13px', fontWeight: activeStep === s.step ? 700 : 500, color: 'var(--text-primary)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '10px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {/* STEP 1: BASIC INFORMATION */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Basic Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Legal Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.legal_name}
                    onChange={e => setFormData({ ...formData, legal_name: e.target.value })}
                    placeholder="e.g. Acme Corporation Pvt Ltd"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="form-input"
                  >
                    <option value="Software & Technology">Software & Technology</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Company Size *</label>
                  <select
                    value={formData.company_size}
                    onChange={e => setFormData({ ...formData, company_size: e.target.value })}
                    className="form-input"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="official@company.com"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-01923"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Company Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a brief overview of your business activities..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Next: Business & Address</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS & ADDRESS */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Business Information & Address
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">GST / Tax Number</label>
                  <input
                    type="text"
                    value={formData.tax_gst_number}
                    onChange={e => setFormData({ ...formData, tax_gst_number: e.target.value })}
                    placeholder="GSTIN or Tax Identification"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Business Reg Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_reg_number}
                    onChange={e => setFormData({ ...formData, business_reg_number: e.target.value })}
                    placeholder="EIN / CIN / Reg No"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Year Established *</label>
                  <input
                    type="number"
                    required
                    min="1800"
                    max="2026"
                    value={formData.year_established}
                    onChange={e => setFormData({ ...formData, year_established: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="California"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="500 Howard Street, Suite 400"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="94105"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Next: Primary Contact</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRIMARY CONTACT */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Primary Contact Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.primary_contact_name}
                    onChange={e => setFormData({ ...formData, primary_contact_name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.primary_contact_designation}
                    onChange={e => setFormData({ ...formData, primary_contact_designation: e.target.value })}
                    placeholder="e.g. Head of Talent Acquisition"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.primary_contact_email}
                    onChange={e => setFormData({ ...formData, primary_contact_email: e.target.value })}
                    placeholder="sarah@company.com"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.primary_contact_phone}
                    onChange={e => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                    placeholder="+1-555-0199442"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Company Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://company.com/logo.png"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Next: Document Uploads</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENT UPLOADS */}
          {activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Verification Document Uploads
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '-10px 0 10px' }}>
                Upload official incorporation or business registration certificates for Platform Admin review.
              </p>

              {/* Uploaded Docs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documents.map((doc, idx) => (
                  <div key={idx} style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={20} color="var(--color-primary)" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {doc.document_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          Type: {doc.document_type.replace('_', ' ')} {doc.is_required && '(Required)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Document Form */}
              <div style={{
                padding: '18px',
                borderRadius: '14px',
                border: '1px dashed var(--border-color)',
                background: 'rgba(109, 40, 217, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Add Document Attachment
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Document Type</label>
                    <select
                      value={newDocType}
                      onChange={e => setNewDocType(e.target.value)}
                      className="form-input"
                    >
                      <option value="registration_certificate">Company Reg Certificate (Required)</option>
                      <option value="gst_tax_certificate">GST / Tax Certificate</option>
                      <option value="business_license">Business License</option>
                      <option value="company_logo">Company Logo</option>
                      <option value="supporting_document">Supporting Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">File Name</label>
                    <input
                      type="text"
                      value={newDocName}
                      onChange={e => setNewDocName(e.target.value)}
                      placeholder="Certificate_2026.pdf"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Document URL / Path</label>
                    <input
                      type="text"
                      value={newDocUrl}
                      onChange={e => setNewDocUrl(e.target.value)}
                      placeholder="https://storage.com/doc.pdf"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="btn btn-outline"
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    + Add Attachment
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 28px' }}
                >
                  <CheckCircle2 size={18} />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application for Approval'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
