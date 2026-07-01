import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { essGetMyFeedback, essSubmitFeedback } from '../../services/employeeSelfServiceAPI';

export default function ESSFeedback() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState({ msg: '', ok: true });
  const [form, setForm]           = useState({ toEmployeeId: '', message: '', isAnonymous: false });

  const load = () => {
    setLoading(true);
    essGetMyFeedback()
      .then(r => setFeedbacks(r.data.data || r.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load feedback'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, [token, navigate]);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg: '', ok: true }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      await essSubmitFeedback(form);
      showToast('Feedback submitted successfully!', true);
      setForm({ toEmployeeId: '', message: '', isAnonymous: false });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit feedback', false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>Feedback</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>
          Send feedback to colleagues and view feedback received.
        </p>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{ background: toast.ok ? '#D1FAE5' : '#FEE2E2', color: toast.ok ? '#065F46' : '#991B1B', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}

      {/* Send Feedback form */}
      <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FiMessageSquare size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text,#111)' }}>Send Feedback</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>
              Recipient Employee ID
            </label>
            <input
              type="text"
              value={form.toEmployeeId}
              onChange={e => setForm(f => ({ ...f, toEmployeeId: e.target.value }))}
              placeholder="Enter employee ID"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text,#111)', background: 'var(--card,#fff)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent,#FF7A00)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border,#E5E7EB)'; }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2,#374151)', marginBottom: '6px' }}>
              Message
            </label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write your feedback…"
              rows={4}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', color: 'var(--text,#111)', background: 'var(--card,#fff)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent,#FF7A00)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border,#E5E7EB)'; }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <input
              type="checkbox"
              id="anon"
              checked={form.isAnonymous}
              onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
              style={{ width: '15px', height: '15px', accentColor: 'var(--accent,#FF7A00)', cursor: 'pointer' }}
            />
            <label htmlFor="anon" style={{ fontSize: '13px', color: 'var(--text-2,#4B5563)', cursor: 'pointer' }}>
              Send anonymously
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting || !form.message.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--accent,#FF7A00)', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 20px', fontWeight: 700, fontSize: '13px', cursor: (submitting || !form.message.trim()) ? 'not-allowed' : 'pointer', opacity: (submitting || !form.message.trim()) ? 0.65 : 1, fontFamily: 'inherit' }}
          >
            <FiSend size={14} aria-hidden="true" />
            {submitting ? 'Sending…' : 'Send Feedback'}
          </button>
        </form>
      </div>

      {/* Received Feedback */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Received Feedback ({feedbacks.length})
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-4,#9CA3AF)', fontSize: '13px' }}>Loading…</div>
        ) : error ? (
          <div style={{ color: '#EF4444', fontSize: '13px' }}>{error}</div>
        ) : feedbacks.length === 0 ? (
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FiMessageSquare size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-4,#9CA3AF)' }}>No feedback received yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {feedbacks.map(f => (
              <div key={f._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '6px' }}>
                  {f.isAnonymous ? 'Anonymous' : `${f.fromEmployee?.firstName || ''} ${f.fromEmployee?.lastName || ''}`}
                </div>
                <div style={{ color: 'var(--text-2,#4B5563)', fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>{f.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
                  {f.fbkCode && <span>{f.fbkCode} · </span>}
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
