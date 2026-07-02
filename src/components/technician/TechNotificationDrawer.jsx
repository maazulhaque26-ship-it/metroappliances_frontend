import React from 'react';
import { FiAlertCircle, FiInfo, FiCheckCircle, FiClock } from 'react-icons/fi';
import PortalNotificationDrawer from '../shared/PortalNotificationDrawer';

const SEED = [
  { id: 1, type: 'urgent',  icon: FiAlertCircle, color: '#EF4444', bg: '#FEF2F2', title: 'Urgent Job Assigned', body: 'High priority service ticket #TK-0041 requires immediate attention.', time: '5m ago', read: false },
  { id: 2, type: 'info',    icon: FiInfo,        color: '#3B82F6', bg: '#EFF6FF', title: 'Job Rescheduled',     body: 'Ticket #TK-0038 rescheduled to tomorrow 10:00 AM by admin.', time: '1h ago',  read: false },
  { id: 3, type: 'success', icon: FiCheckCircle, color: '#10B981', bg: '#ECFDF5', title: 'Job Completed',       body: 'Ticket #TK-0035 marked complete. Customer rated 5 stars.', time: '3h ago',  read: true },
  { id: 4, type: 'info',    icon: FiClock,       color: '#6B7280', bg: '#F9FAFB', title: 'Reminder',            body: 'You have 2 active jobs scheduled for this afternoon.', time: '4h ago',  read: true },
];

export default function TechNotificationDrawer({ open, onClose }) {
  return (
    <PortalNotificationDrawer
      open={open}
      onClose={onClose}
      initialItems={SEED}
      accentColor="#3B82F6"
    />
  );
}
