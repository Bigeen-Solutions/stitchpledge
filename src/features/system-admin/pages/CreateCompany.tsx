import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCompany } from '../hooks/useCompanies'
import { VerificationEmailSentNotice } from '../components/VerificationEmailSentNotice'
import type { CreateCompanyDTO, CompanyProvisionResult } from '../types'

export function CreateCompany() {
  const navigate = useNavigate()
  const createCompany = useCreateCompany()

  const [form, setForm] = useState<CreateCompanyDTO>({
    companyName: '',
    ownerEmail: '',
    ownerFullName: '',
    subscriptionTier: 'TRIAL',
    trialEndsAt: '',
    country: 'Nigeria',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [provision, setProvision] = useState<CompanyProvisionResult | null>(null)

  const set = (key: keyof CreateCompanyDTO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.subscriptionTier === 'TRIAL' && !form.trialEndsAt) {
      setError('Trial End Date is required when subscription tier is TRIAL.')
      return
    }

    const dto: CreateCompanyDTO = {
      ...form,
      trialEndsAt: form.trialEndsAt || undefined,
      notes: form.notes || undefined,
    }

    createCompany.mutate(dto, {
      onSuccess: (result) => setProvision(result),
      onError: (err: any) => setError(err.response?.data?.message || 'Failed to create company.'),
    })
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.875rem', marginBottom: '16px', padding: 0 }}
      >
        ← Back
      </button>

      <h1 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
        Create Company
      </h1>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2',
          border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem', marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Field label="Company Name *">
          <input required type="text" value={form.companyName} onChange={set('companyName')} placeholder="Acme Tailors" style={inputStyle} />
        </Field>

        <Field label="Owner Email *">
          <input required type="email" value={form.ownerEmail} onChange={set('ownerEmail')} placeholder="owner@acme.com" style={inputStyle} />
        </Field>

        <Field label="Owner Full Name *">
          <input required type="text" value={form.ownerFullName} onChange={set('ownerFullName')} placeholder="Jane Doe" style={inputStyle} />
        </Field>

        <Field label="Subscription Tier *">
          <select required value={form.subscriptionTier} onChange={set('subscriptionTier')} style={inputStyle}>
            <option value="TRIAL">Trial</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>
        </Field>

        {form.subscriptionTier === 'TRIAL' && (
          <Field label="Trial End Date *">
            <input
              required
              type="date"
              value={form.trialEndsAt}
              onChange={set('trialEndsAt')}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </Field>
        )}

        <Field label="Country *">
          <input required type="text" value={form.country} onChange={set('country')} placeholder="Nigeria" style={inputStyle} />
        </Field>

        <Field label="Notes">
          <textarea rows={3} value={form.notes} onChange={set('notes')} placeholder="Internal notes..." style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
              backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCompany.isPending}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              backgroundColor: '#1e293b', color: 'white', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            {createCompany.isPending ? 'Creating...' : 'Create Company'}
          </button>
        </div>
      </form>

      {provision && (
        <VerificationEmailSentNotice
          ownerEmail={provision.ownerUser.email}
          onDismiss={() => {
            setProvision(null)
            navigate(`/system-admin/companies/${provision.company.id}`)
          }}
        />
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
