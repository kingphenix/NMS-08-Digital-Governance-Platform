import React from 'react';
import Image from 'next/image';
import chariotSvg from '@/assets/chariot.svg';
import shieldSvg from '@/assets/shield.svg';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Award, Users, Heart, Target, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="emerald" size="lg" className="inline-flex items-center gap-2">
          <Image src={chariotSvg} alt="Chariot Heritage" width={20} height={20} className="w-5 h-5 object-contain" />
          <span>History & Heritage</span>
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About NMS Class of 2008
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          The Nigerian Military School Zaria (Class of 2008) is a community of leaders, military personnel, tech innovators, legal practitioners, and corporate executives forged under military discipline.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect variant="glass" className="p-6 space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit flex items-center justify-center">
            <Image src={shieldSvg} alt="Discipline Shield" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Unyielding Discipline</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Formed on the parade grounds of Zaria, we uphold military precision, integrity, and ethical leadership in all endeavors.
          </p>
        </Card>

        <Card hoverEffect variant="glass" className="p-6 space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Lifelong Brotherhood</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our welfare scheme provides instant support for medical emergencies, bereavement, celebration, and professional mentorship.
          </p>
        </Card>

        <Card hoverEffect variant="glass" className="p-6 space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Digital Governance</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pioneering modern alumni governance with 100% financial auditability, e-voting, and Supabase security infrastructure.
          </p>
        </Card>
      </div>

      {/* Class Timeline */}
      <Card hoverEffect variant="glass" className="p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-apple-sm">
            <Image src={chariotSvg} alt="Chariot Timeline" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">NMS 08 Journey Timeline</h2>
            <p className="text-xs text-slate-500">From Boy Cadets to Global Leaders</p>
          </div>
        </div>

        <div className="space-y-6 text-xs">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              2003
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Entry into Nigerian Military School Zaria</h4>
              <p className="text-slate-600 mt-1">485 young boys entered the gates of NMS Zaria, undergoing rigorous academic and military indoctrination across 7 companies.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              2008
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Passing Out Parade (POP)</h4>
              <p className="text-slate-600 mt-1">Graduated with high honors, commissioning into armed forces officer academies, universities, and technical institutions worldwide.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              2026
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Digital Platform Launch</h4>
              <p className="text-slate-600 mt-1">Official deployment of the NMS 08 Digital Governance Platform for automated dues, e-elections, and welfare claims.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
