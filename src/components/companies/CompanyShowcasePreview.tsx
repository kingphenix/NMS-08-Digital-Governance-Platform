'use client';

import React from 'react';
import { useLiveCompanies } from '@/lib/companies';
import { Card } from '@/components/ui/Card';

export function CompanyShowcasePreview() {
  const { companies } = useLiveCompanies();
  const previewCompanies = companies.slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {previewCompanies.map((company) => {
        const count = company.totalMembers;
        return (
          <Card key={company.id} hoverEffect variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-7 h-7 rounded-full ${company.bgClass} shadow-md border-2 border-white`} />
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {count} {count === 1 ? 'Member' : 'Members'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
            <p className="text-xs text-slate-500 italic">"{company.motto}"</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Dues Compliance</span>
              <span className="font-bold text-emerald-700">{company.duesComplianceRate}%</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
