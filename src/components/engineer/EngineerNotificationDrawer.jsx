import React from 'react';
import { FiAlertCircle, FiInfo, FiCheckCircle, FiClock } from 'react-icons/fi';
import PortalNotificationDrawer from '../shared/PortalNotificationDrawer';

const SEED = [
  { id: 1, type: 'urgent',  icon: FiAlertCircle, color: '#EF4444', bg: '#FEF2F2', title: 'Urgent Installation Assigned', body: 'High priority request #IR-0091 requires immediate attention.', time: '5m ago', read: false },
  { id: 2, type: 'info',    icon: FiInfo,        color: '#059669', bg: '#ECFDF5', title: 'Installation Rescheduled',     body: 'Request #IR-0087 rescheduled to tomorrow 11:00 AM.', time: '1h ago',  read: false },
  { id: 3, type: 'success', icon: FiCheckCircle, color: '#10B981', bg: '#ECFDF5', title: 'Installation Completed',       body: 'Request #IR-0083 marked complete. Customer rated 5 stars.', time: '3h ago', read: true },
  { id: 4, type: 'info',    icon: FiClock,       color: '#6B7280', bg: '#F9FAFB', title: 'Reminder',                     body: 'You have 3 installations scheduled for tomorrow.', time: '5h ago', read: true },
];

export default function EngineerNotificationDrawer({ open, onClose }) {
  return (
    <PortalNotificationDrawer
      open={open}
      onClose={onClose}
      initialItems={SEED}
      accentColor="#059669"
    />
  );
}
