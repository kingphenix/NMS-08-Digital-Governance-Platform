'use client';

import React from 'react';
import Image from 'next/image';
import tankSvg from '@/assets/tank.svg';
import { useLiveCompanies } from '@/lib/companies';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function CompaniesPage() {
  const { companies, totalRegistered, loading } = useLiveCompanies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg" className="inline-flex items-center gap-2">
          <Image src={tankSvg} alt="Military Companies" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
          <span>Military Company Units</span>
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          The 7 Companies of NMS 08
        </h1>
        <p className="text-sm text-slate-600">
          Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, and Golf Companies. Explore company
          leadership, real registered member strength (
          {loading ? (
            <span className="inline-block w-6 h-3 bg-slate-200 rounded animate-pulse align-middle" />
          ) : (
            totalRegistered
          )}{' '}
          registered Ex-Boys), and dues performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => {
          const count = company.totalMembers;
          return (
            <Card key={company.id} hoverEffect variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${company.bgClass} shadow-md border-2 border-white shrink-0`} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-600">
                        {loading ? (
                          <span className="inline-block w-20 h-3 bg-slate-200 rounded animate-pulse align-middle" />
                        ) : (
                          `${count} ${count === 1 ? 'Registered Member' : 'Registered Members'}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant={!loading && count > 0 ? 'emerald' : 'outline'} size="sm">
                  {loading ? '—' : count > 0 ? `${count} Active` : '0 Active'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 italic border-l-2 border-emerald-500 pl-3">
                &ldquo;{company.motto}&rdquo;
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {company.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Company Representative</span>
                  <span className="font-bold text-slate-900">{company.representative || company.commander}</span>
                </div>
                {company.secondInCommand && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Second-in-Command (2IC)</span>
                    <span className="font-semibold text-slate-700">{company.secondInCommand}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Current Registered Roster</span>
                  <span className="font-bold text-emerald-800">
                    {loading ? (
                      <span className="inline-block w-12 h-3 bg-slate-200 rounded animate-pulse align-middle" />
                    ) : (
                      `${count} ${count === 1 ? 'Ex-Boy' : 'Ex-Boys'}`
                    )}
                  </span>
                </div>
              </div>

              <ProgressBar
                value={loading ? 0 : company.duesComplianceRate}
                label="Company Dues Compliance"
                sublabel={
                  loading
                    ? 'Loading...'
                    : count > 0
                    ? `${company.duesComplianceRate}% of registered members compliant`
                    : 'No registered dues recorded yet'
                }
                color="emerald"
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
