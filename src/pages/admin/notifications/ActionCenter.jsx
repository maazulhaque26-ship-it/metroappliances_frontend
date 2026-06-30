import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle, FiCalendar, FiShoppingCart, FiFileText,
  FiTruck, FiTool, FiUserCheck, FiDollarSign, FiStar,
  FiShield, FiArrowRight,
} from 'react-icons/fi';

const ACTION_ITEMS = [
  { id: 1,  label: 'Pending Approvals',  count: 3,  color: '#7C3AED', icon: FiCheckCircle,  path: '/admin/procurement/purchase-orders'         },
  { id: 2,  label: 'Leave Requests',     count: 5,  color: '#D97706', icon: FiCalendar,      path: '/admin/hr/leave/approvals'                  },
  { id: 3,  label: 'Purchase Orders',    count: 2,  color: '#0891B2', icon: FiShoppingCart,  path: '/admin/procurement/purchase-orders'          },
  { id: 4,  label: 'Invoices Due',       count: 7,  color: '#DC2626', icon: FiFileText,      path: '/admin/accounts-payable/invoices'            },
  { id: 5,  label: 'Pending Dispatch',   count: 4,  color: '#059669', icon: FiTruck,         path: '/admin/logistics/dispatches'                 },
  { id: 6,  label: 'Service Requests',   count: 6,  color: '#EF4444', icon: FiTool,          path: '/admin/service/requests'                    },
  { id: 7,  label: 'Recruitment',        count: 9,  color: '#2563EB', icon: FiUserCheck,     path: '/admin/hr/recruitment/applications'          },
  { id: 8,  label: 'Payroll Approval',   count: 1,  color: '#16A34A', icon: FiDollarSign,    path: '/admin/hr/payroll/runs'                     },
  { id: 9,  label: 'Customer Reviews',   count: 12, color: 'var(--accent)', icon: FiStar,    path: '/admin/reviews'                             },
  { id: 10, label: 'Compliance Tasks',   count: 3,  color: '#6366F1', icon: FiShield,        path: '/admin/tax/compliance'                      },
];

export default function ActionCenter() {
  const total = ACTION_ITEMS.reduce((s, i) => s + i.count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div
        className="px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,122,0,0.02)' }}
      >
        <p
          className="text-[13.5px] font-bold"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
        >
          {total} Items Awaiting Action
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>
          Review, approve, or act on items assigned to you
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {ACTION_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-start gap-3 p-3.5 transition-all group"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.background = `color-mix(in srgb, ${item.color} 4%, var(--card))`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--card)';
                }}
                aria-label={`${item.label}: ${item.count} item${item.count !== 1 ? 's' : ''}`}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${item.color} 20%, transparent)`,
                  }}
                  aria-hidden="true"
                >
                  <Icon size={14} style={{ color: item.color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-semibold leading-snug"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-[20px] font-bold mt-0.5 leading-none"
                    style={{ color: item.color, fontFamily: 'var(--font-numbers)' }}
                  >
                    {item.count}
                  </p>
                </div>

                <FiArrowRight
                  size={11}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--text-5)' }}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
