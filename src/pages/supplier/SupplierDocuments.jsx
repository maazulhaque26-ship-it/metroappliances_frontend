import React from 'react';
import { FiFile, FiShield, FiCreditCard, FiCheckCircle, FiUpload } from 'react-icons/fi';
import SectionHeader from '../../components/shared/SectionHeader';

const DOC_TYPES = [
  {
    icon: FiShield,      color: '#10B981', bg: '#D1FAE5',
    title: 'GST Certificate',
    desc:  'GSTIN registration certificate for tax compliance verification.',
    status: 'pending',
  },
  {
    icon: FiCreditCard,  color: '#3B82F6', bg: '#DBEAFE',
    title: 'PAN Card',
    desc:  'Permanent Account Number for tax identification.',
    status: 'pending',
  },
  {
    icon: FiFile,        color: '#FF7A00', bg: '#FFF7ED',
    title: 'Company Registration',
    desc:  'Certificate of incorporation or firm registration document.',
    status: 'pending',
  },
  {
    icon: FiCheckCircle, color: '#8B5CF6', bg: '#EDE9FE',
    title: 'Bank Details',
    desc:  'Bank account details for payment processing and verification.',
    status: 'pending',
  },
];

export default function SupplierDocuments() {
  return (
    <div className="p-6 space-y-5">
      <SectionHeader title="Documents" subtitle="Compliance certificates and verifications" />

      {/* Status banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#FFF7ED', border: '1px solid #FDBA74' }}>
        <FiShield size={18} color="#FF7A00" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3412' }}>Document Verification Pending</div>
          <div style={{ fontSize: 12, color: '#C2410C', marginTop: 2 }}>
            Upload required documents below to complete your supplier verification and start receiving purchase orders.
          </div>
        </div>
      </div>

      {/* Document type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {DOC_TYPES.map(doc => {
          const Icon = doc.icon;
          return (
            <div key={doc.title} className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: doc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} color={doc.color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text,#111827)', marginBottom: 6 }}>{doc.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-4,#6B7280)', lineHeight: 1.6, marginBottom: 14 }}>{doc.desc}</div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: doc.bg, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: doc.color }}>
                <FiUpload size={13} /> Upload
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
              </label>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-4,#9CA3AF)', textAlign: 'center' }}>
        Accepted formats: PDF, JPG, PNG · Max file size: 5 MB per document
      </p>
    </div>
  );
}
