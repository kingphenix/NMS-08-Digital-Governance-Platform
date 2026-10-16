import React from 'react';
import Image from 'next/image';
import tankSvg from '@/assets/tank.svg';
import { COMPANIES_LIST } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Award, Users, Shield } from 'lucide-react';

export default function CompaniesPage() {
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
          Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, and Gulf Companies. Explore commanders, member strength, and dues performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPANIES_LIST.map((company) => (
          <Card key={company.id} hoverEffect variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${company.bgClass} shadow-md border-2 border-white shrink-0`} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{company.totalMembers} Registered Members</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic border-l-2 border-emerald-500 pl-3">
              "{company.motto}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed">
              {company.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Company Commander</span>
                <span className="font-bold text-slate-900">{company.commander}</span>
              </div>
            </div>

            <ProgressBar
              value={company.duesComplianceRate}
              label="Company Dues Compliance"
              color="emerald"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
