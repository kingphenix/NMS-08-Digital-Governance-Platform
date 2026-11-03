'use client';

import React from 'react';
import Link from 'next/link';
import { useLiveCompanies } from '@/lib/companies';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function CompanyShowcasePreview() {
  const { companies, loading } = useLiveCompanies();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company) => {
          const count = company.totalMembers;
          return (
            <Link
              key={company.id}
              href="/companies"
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-3xl"
            >
              <Card
                hoverEffect
                variant="glass"
                className="h-full p-6 space-y-4 border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 group-hover:shadow-apple-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-full ${company.bgClass} shadow-md border-2 border-white ring-1 ring-slate-200/60 shrink-0`}
                  />
                  <Badge
                    variant={!loading && count > 0 ? 'emerald' : 'outline'}
                    size="sm"
                    className="font-bold text-xs px-2.5 py-0.5"
                  >
                    {loading ? '—' : `${count} Registered`}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic">
                    &ldquo;{company.motto}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Dues Compliance</span>
                  <span className="font-bold text-emerald-700">
                    {loading ? '—' : `${company.duesComplianceRate}%`}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
