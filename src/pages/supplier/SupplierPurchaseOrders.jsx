import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import supplierAPI   from '../../services/supplierAPI';
import DataTable     from '../../components/shared/DataTable';
import Pagination    from '../../components/shared/Pagination';
import StatusBadge   from '../../components/shared/StatusBadge';
import SectionHeader from '../../components/shared/SectionHeader';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { useFilters }    from '../../hooks/useFilters';
import { useConfirm }    from '../../hooks/useModal';
import { toast } from 'react-toastify';

const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const fmtCurrency = v => `₹${(v || 0).toLocaleString('en-IN')}`;

const STATUS_OPTS = [
  { label: 'All',          value: '' },
  { label: 'Sent',         value: 'sent' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Accepted',     value: 'supplier_accepted' },
  { label: 'Rejected',     value: 'supplier_rejected' },
  { label: 'Completed',    value: 'completed' },
];

export default function SupplierPurchaseOrders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const { page, limit, setPage } = usePagination();
  const { filters, setFilter }   = useFilters({ status: '' });
  const {
    open: confirmOpen, ask, cancel, confirm: runConfirm,
    loading: confirming, title: confirmTitle, message: confirmMsg,
  } = useConfirm();

  const load = useCallback(() => {
    setLoading(true);
    supplierAPI.get('/supplier/orders', { params: { status: filters.status, page, limit } })
      .then(r => { setOrders(r.data.data || []); setTotal(r.data.pagination?.total || 0); })
      .catch(e => toast.error(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  }, [filters.status, page, limit]);

  React.useEffect(() => { load(); }, [load]);

  const doAction = async (id, action) => {
    try {
      await supplierAPI.put(`/supplier/orders/${id}/${action}`);
      toast.success(`Order ${action}d`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const filtered = search.trim()
    ? orders.filter(o => o.poNumber?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  const columns = [
    {
      header: 'PO #', accessor: 'poNumber',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#FF7A00' }}>{r.poNumber}</span>,
    },
    {
      header: 'Amount', accessor: 'totalAmount',
      render: r => <span style={{ fontWeight: 700, color: 'var(--text,#111827)' }}>{fmtCurrency(r.totalAmount)}</span>,
    },
    {
      header: 'Expected', accessor: 'expectedDeliveryDate',
      render: r => <span style={{ fontSize: 12, color: 'var(--text-4,#6B7280)' }}>{fmtDate(r.expectedDeliveryDate)}</span>,
    },
    {
      header: 'Status', accessor: 'status',
      render: r => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions', accessor: '_id',
      render: r => (
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          {r.status === 'sent' && (
            <button
              onClick={() => ask({ title: 'Acknowledge Order', message: 'Acknowledge receipt of this PO?', type: 'info', onConfirm: () => doAction(r._id, 'acknowledge') })}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff', background: '#3B82F6', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Acknowledge
            </button>
          )}
          {r.status === 'acknowledged' && (
            <>
              <button
                onClick={() => ask({ title: 'Accept Order', message: 'Accept this purchase order?', type: 'info', onConfirm: () => doAction(r._id, 'accept') })}
                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff', background: '#10B981', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Accept
              </button>
              <button
                onClick={() => ask({ title: 'Reject Order', message: 'Reject this purchase order?', type: 'danger', onConfirm: () => doAction(r._id, 'reject') })}
                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <SectionHeader title="Purchase Orders" subtitle={`${total} order${total !== 1 ? 's' : ''}`} />

      {/* Search + Status filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FiSearch size={13} color="#9CA3AF" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PO number…"
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border,#E5E7EB)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: 'var(--text,#111827)', background: 'var(--card,#fff)', outline: 'none', minWidth: 200 }} />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <FiFilter size={13} color="#9CA3AF" />
          {STATUS_OPTS.map(opt => (
            <button key={opt.value} onClick={() => { setFilter('status', opt.value); setPage(1); }}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: filters.status === opt.value ? '#FF7A00' : 'var(--bg,#F3F4F6)',
                color:      filters.status === opt.value ? '#fff'    : 'var(--text-4,#374151)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={r => navigate(`/supplier/orders/${r._id}`)}
        emptyMessage="No purchase orders found"
      />
      <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />

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
