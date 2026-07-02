import React, { useState } from 'react';
import { FiX, FiBell, FiShoppingBag, FiInfo, FiCheckCircle, FiAlertCircle, FiFileText } from 'react-icons/fi';

const SEED = [
  { id: 1, icon: FiShoppingBag, color: '#FF7A00', bg: '#FFF7ED', title: 'New Purchase Order',         body: 'PO #PO-2024-0042 has been sent to you. Please acknowledge within 48 hours.', time: '10m ago', read: false },
  { id: 2, icon: FiFileText,    color: '#3B82F6', bg: '#EFF6FF', title: 'RFQ Invitation',              body: 'You have been invited to quote on RFQ #RFQ-2024-0018 — Office Stationery Bulk.',  time: '2h ago',  read: false },
  { id: 3, icon: FiAlertCircle, color: '#EF4444', bg: '#FEF2F2', title: 'Delivery Overdue',            body: 'PO #PO-2024-0035 expected delivery was yesterday. Please update ETA.',            time: '5h ago',  read: true },
  { id: 4, icon: FiCheckCircle, color: '#10B981', bg: '#ECFDF5', title: 'Payment Processed',           body: 'Payment of ₹1,24,500 for Invoice #INV-0029 has been processed.',                 time: '1d ago',  read: true },
  { id: 5, icon: FiInfo,        color: '#6B7280', bg: '#F9FAFB', title: 'Profile Verification Pending', body: 'Upload your GST certificate to complete supplier verification.',                  time: '2d ago',  read: true },
];

export default function SupplierNotificationDrawer({ open, onClose }) {
  const [items, setItems] = useState(SEED);

  const markAllRead = () => setItems(p => p.map(i => ({ ...i, read: true })));
  const dismiss     = id  => setItems(p => p.filter(i => i.id !== id));
  const unread = items.filter(i => !i.read).length;

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1500 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 400, maxWidth: '100vw', background: 'var(--card,#fff)', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', zIndex: 1501, display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, sans-serif', borderLeft: '1px solid var(--border,#E5E7EB)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBell size={18} color="#FF7A00" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text,#111827)' }}>Notifications</span>
            {unread > 0 && (
              <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{unread}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 12, color: '#FF7A00', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3AF' }}>
              <FiBell size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No notifications</p>
            </div>
          ) : items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border,#F3F4F6)', background: item.read ? 'transparent' : 'rgba(255,122,0,0.03)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={item.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: item.read ? 500 : 700, color: 'var(--text,#111827)', lineHeight: 1.3 }}>{item.title}</div>
                    <button onClick={() => dismiss(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 0, flexShrink: 0 }}>
                      <FiX size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-4,#6B7280)', marginTop: 3, lineHeight: 1.5 }}>{item.body}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
