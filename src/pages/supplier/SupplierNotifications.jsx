import React, { useState } from 'react';
import { FiBell, FiShoppingBag, FiFileText, FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import SectionHeader from '../../components/shared/SectionHeader';

const SEED = [
  { id: 1, icon: FiShoppingBag, color: '#FF7A00', bg: '#FFF7ED', title: 'New Purchase Order Received',  body: 'PO #PO-2024-0042 has been sent to you for ₹84,500. Acknowledge within 48 hours.',  time: '10 min ago', read: false },
  { id: 2, icon: FiFileText,    color: '#3B82F6', bg: '#EFF6FF', title: 'RFQ Invitation',                body: 'You have been invited to quote on RFQ #RFQ-2024-0018 — Office Stationery Bulk.',   time: '2 hrs ago',  read: false },
  { id: 3, icon: FiAlertCircle, color: '#EF4444', bg: '#FEF2F2', title: 'Delivery Overdue',              body: 'PO #PO-2024-0035 was expected yesterday. Please provide an updated ETA.',           time: '5 hrs ago',  read: true },
  { id: 4, icon: FiCheckCircle, color: '#10B981', bg: '#ECFDF5', title: 'Payment Processed',             body: 'Payment of ₹1,24,500 for Invoice #INV-0029 has been credited to your account.',   time: '1 day ago',  read: true },
  { id: 5, icon: FiShoppingBag, color: '#FF7A00', bg: '#FFF7ED', title: 'PO #PO-2024-0040 Accepted',     body: 'Your acceptance of PO #PO-2024-0040 has been confirmed by the procurement team.',  time: '2 days ago', read: true },
  { id: 6, icon: FiInfo,        color: '#6B7280', bg: '#F9FAFB', title: 'Profile Verification Pending',  body: 'Upload your GST certificate and PAN card to complete supplier verification.',        time: '3 days ago', read: true },
];

export default function SupplierNotifications() {
  const [items, setItems]       = useState(SEED);
  const [filterUnread, setFilterUnread] = useState(false);

  const markAllRead = () => setItems(p => p.map(i => ({ ...i, read: true })));
  const dismiss     = id  => setItems(p => p.filter(i => i.id !== id));
  const unread      = items.filter(i => !i.read).length;
  const displayed   = filterUnread ? items.filter(i => !i.read) : items;

  return (
    <div className="p-6 space-y-5">
      <SectionHeader title="Notifications" subtitle={`${unread} unread`} />

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFilterUnread(false)}
            style={{ padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: !filterUnread ? '#FF7A00' : 'var(--bg,#F3F4F6)', color: !filterUnread ? '#fff' : 'var(--text-4,#374151)' }}>
            All
          </button>
          <button onClick={() => setFilterUnread(true)}
            style={{ padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: filterUnread ? '#FF7A00' : 'var(--bg,#F3F4F6)', color: filterUnread ? '#fff' : 'var(--text-4,#374151)' }}>
            Unread {unread > 0 && `(${unread})`}
          </button>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            style={{ background: 'none', border: 'none', fontSize: 12, color: '#FF7A00', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
          <FiBell size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: 'var(--text-4,#9CA3AF)' }}>No {filterUnread ? 'unread ' : ''}notifications</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="rounded-2xl"
                style={{ display: 'flex', gap: 14, padding: '16px 18px', background: item.read ? 'var(--card,#fff)' : 'rgba(255,122,0,0.04)', border: '1px solid var(--border,#E5E7EB)', borderLeft: item.read ? '1px solid var(--border,#E5E7EB)' : '3px solid #FF7A00' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: item.read ? 500 : 700, color: 'var(--text,#111827)', lineHeight: 1.4 }}>{item.title}</div>
                    <button onClick={() => dismiss(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 0, flexShrink: 0 }}>
                      <FiX size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-4,#6B7280)', marginTop: 4, lineHeight: 1.6 }}>{item.body}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
