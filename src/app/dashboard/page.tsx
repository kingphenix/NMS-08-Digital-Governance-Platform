import React from 'react';
import { MemberDashboard } from '@/components/dashboard/MemberDashboard';

export const metadata = {
  title: 'Member Portal Dashboard | NMS 08 Digital Governance',
  description: 'Ex-Boy personal dashboard for profile, company status, dues receipts, welfare assistance claims, elections voting, and official documents.',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MemberDashboard />
    </div>
  );
}
