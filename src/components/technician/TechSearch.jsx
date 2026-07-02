import React from 'react';
import { FiBriefcase, FiUser, FiGrid } from 'react-icons/fi';
import PortalSearchPalette from '../shared/PortalSearchPalette';

const PAGES = [
  { label: 'Dashboard', to: '/technician/dashboard', icon: FiGrid,      desc: "Today's summary and KPIs" },
  { label: 'My Jobs',   to: '/technician/jobs',      icon: FiBriefcase, desc: 'Active and completed service jobs' },
  { label: 'Profile',   to: '/technician/profile',   icon: FiUser,      desc: 'Profile, skills and availability' },
];

export default function TechSearch({ open, onClose }) {
  return (
    <PortalSearchPalette
      open={open}
      onClose={onClose}
      pages={PAGES}
      accentColor="#3B82F6"
      placeholder="Search jobs, pages…"
      ariaLabel="Search technician pages"
    />
  );
}
