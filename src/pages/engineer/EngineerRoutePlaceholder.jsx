import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiList, FiClock } from 'react-icons/fi';

export default function EngineerRoutePlaceholder() {
  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ maxWidth: 580 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Route Planner</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Optimize your daily route to reach customers faster</p>

        {/* Coming soon card */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 32, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <FiMapPin size={26} color="#059669" />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Maps Integration Coming Soon</h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
            Route optimization with turn-by-turn navigation is reserved for the maps integration phase.
            Installation jobs already carry full address, city, pincode and GPS-ready fields.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/engineer/jobs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: '#059669', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
              <FiList size={15} /> View Jobs
            </Link>
            <button type="button" disabled
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit' }}>
              <FiNavigation size={15} /> Navigate
            </button>
          </div>
        </div>

        {/* Info tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: FiMapPin,    color: '#059669', bg: '#D1FAE5', title: 'Address Fields', desc: 'Full address, city, pincode on every job card' },
            { icon: FiClock,     color: '#F59E0B', bg: '#FEF3C7', title: 'Scheduled Times', desc: 'Each job has a scheduled date and time window' },
            { icon: FiNavigation,color: '#3B82F6', bg: '#DBEAFE', title: 'GPS Ready',       desc: 'Location fields prepared for map overlay' },
            { icon: FiList,      color: '#8B5CF6', bg: '#EDE9FE', title: 'Job Priority',    desc: 'Sort and filter jobs by urgency and area' },
          ].map(t => {
            const Icon = t.icon;
            return (
              <div key={t.title} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon size={16} color={t.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
