import React from 'react';
import { FiList, FiUser, FiGrid, FiMapPin } from 'react-icons/fi';
import PortalSearchPalette from '../shared/PortalSearchPalette';

const PAGES = [
  { label: 'Dashboard',        to: '/engineer/dashboard', icon: FiGrid,   desc: "Today's schedule and KPIs" },
  { label: 'My Installations', to: '/engineer/jobs',      icon: FiList,   desc: 'Active and completed installation jobs' },
  { label: 'Route Planner',    to: '/engineer/route',     icon: FiMapPin, desc: 'Route planning and navigation' },
  { label: 'Profile',          to: '/engineer/profile',   icon: FiUser,   desc: 'Profile, skills and availability' },
];

export default function EngineerSearch({ open, onClose }) {
  return (
    <PortalSearchPalette
      open={open}
      onClose={onClose}
      pages={PAGES}
      accentColor="#059669"
      placeholder="Search installations, pages…"
      ariaLabel="Search engineer pages"
    />
  );
}
