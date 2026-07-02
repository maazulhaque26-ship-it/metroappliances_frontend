import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCreditCard } from 'react-icons/fi';
import supplierAPI   from '../../services/supplierAPI';
import StatusBadge   from '../../components/shared/StatusBadge';
import LoadingState  from '../../components/shared/LoadingState';
import ErrorState    from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useConfirm } from '../../hooks/useModal';
import { toast } from 'react-toastify';

const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = v => `₹${(v || 0).toLocaleString('en-IN')}`;

export default function SupplierOrderDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [po,      setPO]      = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const {
    open: confirmOpen, ask, cancel, confirm: runConfirm,
    loading: confirming, title: confirmTitle, message: confirmMsg,
  } = useConfirm();

  const load = useCallback(() => {
    setLoading(true);
    supplierAPI.get(`/supplier/orders/${id}`)
      .then(r => setPO(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action) => {
    try {
      await supplierAPI.put(`/supplier/orders/${id}/${action}`);
      toast.success(`Order ${action}d`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingState message="Loading order…" />;
  if (error)   return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/supplier/orders')}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg,#F3F4F6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FiArrowLeft size={16} color="var(--text,#374151)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text,#111827)', fontFamily: 'Poppins', margin: 0 }}>
              <span style={{ color: '#FF7A00', fontFamily: 'monospace' }}>{po?.poNumber}</span>
            </h2>
            <StatusBadge status={po?.status} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-4,#6B7280)', marginTop: 3 }}>Created {fmtDate(po?.createdAt)}</p>
        </div>

        {/* Action buttons — preserve all logic */}
        <div style={{ display: 'flex', gap: 8 }}>
          {po?.status === 'sent' && (
            <button
              onClick={() => ask({ title: 'Acknowledge Order', message: 'Acknowledge receipt of this PO?', type: 'info', onConfirm: () => doAction('acknowledge') })}
              style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: '#3B82F6', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Acknowledge
            </button>
          )}
          {po?.status === 'acknowledged' && (
            <>
              <button
                onClick={() => ask({ title: 'Accept Order', message: 'Accept this purchase order?', type: 'info', onConfirm: () => doAction('accept') })}
                style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: '#10B981', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Accept
              </button>
              <button
                onClick={() => ask({ title: 'Reject Order', message: 'Reject this purchase order?', type: 'danger', onConfirm: () => doAction('reject') })}
                style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Order Details</h3>
          {[
            { icon: FiCalendar,   label: 'Expected Delivery', value: fmtDate(po?.expectedDeliveryDate) },
            { icon: FiCreditCard, label: 'Payment Terms',     value: po?.paymentTerms || '—' },
          ].map(r => {
            const Icon = r.icon;
            return (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border,#F3F4F6)', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-4,#6B7280)' }}><Icon size={13} />{r.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text,#111827)' }}>{r.value}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Financial Summary</h3>
          {[
            { label: 'Subtotal', value: fmtCurrency(po?.subtotal),   bold: false, accent: false },
            { label: 'Tax',      value: fmtCurrency(po?.taxAmount),  bold: false, accent: false },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border,#F3F4F6)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-4,#6B7280)' }}>{r.label}</span>
              <span style={{ color: 'var(--text,#111827)' }}>{r.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 15, fontWeight: 700 }}>
            <span style={{ color: 'var(--text,#111827)' }}>Total</span>
            <span style={{ color: '#FF7A00' }}>{fmtCurrency(po?.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text,#111827)', fontFamily: 'Poppins', marginBottom: 14 }}>Order Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border,#E5E7EB)' }}>
                {['Product', 'Qty', 'Unit Price', 'Tax', 'Total'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {po?.items?.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border,#F3F4F6)' }}>
                  <td style={{ padding: '11px 0', color: 'var(--text,#111827)', fontWeight: 500 }}>{item.productName}</td>
                  <td style={{ padding: '11px 0', color: 'var(--text-4,#6B7280)', textAlign: 'center', fontSize: 12 }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: '11px 0', color: 'var(--text-4,#6B7280)', fontSize: 12 }}>{fmtCurrency(item.unitPrice)}</td>
                  <td style={{ padding: '11px 0', color: 'var(--text-4,#6B7280)', fontSize: 12 }}>{item.taxRate}%</td>
                  <td style={{ padding: '11px 0', fontWeight: 700, color: '#10B981' }}>{fmtCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        onConfirm={runConfirm}
        onCancel={cancel}
        loading={confirming}
      />
    </div>
  );
}
