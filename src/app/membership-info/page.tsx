import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import shieldSvg from '@/assets/shield.svg';
import cardSvg from '@/assets/card.svg';
import medalSvg from '@/assets/medal.svg';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Shield, CreditCard, Heart, Award } from 'lucide-react';

export default function MembershipInfoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg" className="inline-flex items-center gap-2">
          <Image src={shieldSvg} alt="Governance Shield" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
          <span>Governance Guidelines</span>
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Membership & Dues Information
        </h1>
        <p className="text-sm text-slate-600">
          Clear breakdown of membership eligibility, annual dues structure, welfare entitlements, and constitutional rights.
        </p>
      </div>

      {/* Dues Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect variant="glass" className="p-6 space-y-4">
          <Badge variant="emerald" className="inline-flex items-center gap-1.5">
            <Image src={cardSvg} alt="Dues Card" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            <span>Standard Member Dues</span>
          </Badge>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-slate-900">₦150,000</h3>
            <span className="text-xs text-slate-500">Per Annum (2026)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Voting Rights in Set Elections</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Access to Member Directory & Roster</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Certificate & Verified Portal Status</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> AGM Participation & Constitutional Voting</li>
          </ul>

          <Link href="/register" className="block pt-2">
            <Button variant="emerald" className="w-full justify-center">
              Pay Annual Dues
            </Button>
          </Link>
        </Card>

        <Card hoverEffect variant="emerald" className="p-6 space-y-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/30 inline-flex items-center gap-1.5">
            <Image src={medalSvg} alt="Welfare Medal" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            <span>Welfare Fund Levy</span>
          </Badge>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-white">₦50,000</h3>
            <span className="text-xs text-emerald-100">Annual Mandatory Support</span>
          </div>

          <ul className="space-y-2 text-xs text-emerald-100">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Emergency Medical Grants up to ₦1,000,000</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Bereavement Aid & Family Support</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Celebration & Wedding Congratulations Grants</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Business Distress Relief Fund</li>
          </ul>

          <Link href="/dashboard" className="block pt-2">
            <Button variant="glass" className="w-full justify-center text-slate-900 font-bold">
              Access Welfare Portal
            </Button>
          </Link>
        </Card>

        <Card hoverEffect variant="glass" className="p-6 space-y-4">
          <Badge variant="emerald" className="inline-flex items-center gap-1.5">
            <Image src={medalSvg} alt="Reunion Medal" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            <span>Reunion Gala Contribution</span>
          </Badge>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-slate-900">₦30,000</h3>
            <span className="text-xs text-slate-500">Per Event Levy</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Access Pass to Annual Reunion Gala</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complimentary Event Merchandise Kit</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Gala Dinner & Business Networking</li>
          </ul>

          <Link href="/events" className="block pt-2">
            <Button variant="outline" className="w-full justify-center">
              View Events Calendar
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
