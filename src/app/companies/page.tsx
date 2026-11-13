'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import tankSvg from '@/assets/tank.svg';
import { useLiveCompanies } from '@/lib/companies';
import {
  WEDDING_COMPANIES,
  WEDDING_GOAL_NGN,
  WEDDING_SEED_CONTRIBUTIONS,
} from '@/lib/wedding-contributions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface WeddingContribution {
  id: string;
  name: string;
  amount: number;
}

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

export default function CompaniesPage() {
  const { companies, totalRegistered, loading } = useLiveCompanies();

  // Starts from the recorded figures, then hydrates with the live totals an
  // administrator keeps up to date from the dashboard.
  const [weddingContributions, setWeddingContributions] = useState<WeddingContribution[]>(
    WEDDING_COMPANIES.map((c) => ({ ...c, amount: WEDDING_SEED_CONTRIBUTIONS[c.id] ?? 0 }))
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/wedding-contributions', { cache: 'no-store' });
        const data = await res.json();
        if (active && data?.ok && Array.isArray(data.contributions)) {
          setWeddingContributions(data.contributions);
        }
      } catch {
        /* fall back to the recorded figures already on screen */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const weddingTotalTarget = WEDDING_GOAL_NGN * weddingContributions.length;
  const weddingTotalContributed = weddingContributions.reduce((sum, c) => sum + c.amount, 0);

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

      {/* WEDDING CONTRIBUTION SECTION */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="amber" size="lg" className="inline-flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>Set Brotherhood Initiative</span>
          </Badge>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Wedding Contribution
          </h2>
          <p className="text-sm text-slate-600">
            Brothers, let us come together to support our coursemate as we celebrate their
            special milestone. Every company&rsquo;s contribution counts towards strengthening
            our bond of brotherhood.
          </p>
        </div>

        <Card variant="glass" className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            {weddingContributions.map((company) => (
              <ProgressBar
                key={company.id}
                value={company.amount}
                max={WEDDING_GOAL_NGN}
                label={company.name}
                sublabel={`${naira(company.amount)} of ${naira(WEDDING_GOAL_NGN)}${
                  company.amount < WEDDING_GOAL_NGN ? ' • Part payment' : ' • Goal reached'
                }`}
                color="amber"
                height="lg"
              />
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200/60 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Set-Wide Contribution Target</p>
                <p className="text-xs text-slate-500">
                  Combined goal across all {weddingContributions.length} companies
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-emerald-800">
                  {naira(weddingTotalContributed)}
                </p>
                <p className="text-xs text-slate-500">of {naira(weddingTotalTarget)} goal</p>
              </div>
            </div>
            <ProgressBar
              value={weddingTotalContributed}
              max={weddingTotalTarget}
              color="emerald"
              height="lg"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
