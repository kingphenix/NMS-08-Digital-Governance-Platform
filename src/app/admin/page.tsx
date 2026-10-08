import React from 'react';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export const metadata = {
  title: 'Admin Governance Console | NMS 08 Alumni Association',
  description: 'National Executive Council portal for member verification, dues audit analytics, elections management, and broadcast messaging.',
};

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminDashboard />
    </div>
  );
}
