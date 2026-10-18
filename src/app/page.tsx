import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import marchImage from '@/assets/march.webp';
import setChairman from '@/assets/set chairman.jpeg';
import militaryManSvg from '@/assets/military-man.svg';
import tankSvg from '@/assets/tank.svg';
import speakerSvg from '@/assets/speaker.svg';
import {
  Shield,
  Award,
  Users,
  CreditCard,
  Heart,
  Vote,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { COMPANIES_LIST, NEWS_LIST, EVENTS_LIST, LEADERSHIP_LIST } from '@/lib/mock-data';

export default function HomePage() {
  const president = LEADERSHIP_LIST[0];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="lg" className="flex items-center gap-2">
                <Image src={mainLogo} alt="NMS Logo" width={24} height={24} className="h-5 w-auto object-contain" />
                Official NMS Class of 2008
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Brotherhood, Discipline & <span className="text-emerald-700">Digital Governance</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Welcome to the official alumni platform for the Nigerian Military School Zaria, Class of 2008. Designed with precision, transparent dues tracking, electronic voting, and brotherhood welfare.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard">
                <Button
                  variant="emerald"
                  size="lg"
                  icon={<Image src={militaryManSvg} alt="Member Portal" width={18} height={18} className="w-4.5 h-4.5 object-contain" />}
                >
                  Enter Member Portal
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" size="lg">
                  Verify Registration
                </Button>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 text-xs">
              <div>
                <span className="font-extrabold text-lg text-slate-900 block">485+</span>
                <span className="text-slate-500 font-medium">Verified Ex-Boys</span>
              </div>
              <div>
                <span className="font-extrabold text-lg text-emerald-700 block">₦24.8M</span>
                <span className="text-slate-500 font-medium">Welfare Reserve</span>
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 block">7</span>
                <span className="text-slate-500 font-medium">Military Companies</span>
              </div>
            </div>
          </div>

          {/* Hero Feature Image Showcase */}
          <div className="lg:col-span-5 self-stretch">
            <Card hoverEffect variant="glass" className="relative p-0 shadow-apple-md overflow-hidden h-full">
              <div className="relative w-full h-full min-h-[500px]">
                <Image
                  src={marchImage}
                  alt="NMS March"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* PRESIDENT'S MESSAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card hoverEffect variant="glass" className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <Image
                src={setChairman}
                alt={president.name}
                width={220}
                height={220}
                className="w-52 h-52 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-apple-md"
              />
            </div>

            <div className="md:col-span-8 space-y-4">
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                Message from the Set Chairman
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                " Building a stronger institution that every member can be proud of."
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "Our predecessor laid an important foundation. My commitment is to build on that foundation by strengthening this institution, improving transparency, and creating opportunities that benefit every member of our Set."
              </p>
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900">{president.name}</h4>
                <p className="text-xs text-slate-500">{president.nmsNo} • {president.company}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* COMPANIES SHOWCASE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="emerald" className="inline-flex items-center gap-1.5">
            <Image src={tankSvg} alt="Military Companies" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            <span>NMS 08 Companies</span>
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            The Seven Military Companies
          </h2>
          <p className="text-sm text-slate-600">
            Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, and Golf — united in excellence and brotherhood.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COMPANIES_LIST.slice(0, 4).map((company) => (
            <Card key={company.id} hoverEffect variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-full ${company.bgClass} shadow-md border-2 border-white`} />
                <span className="text-xs font-bold text-slate-400">{company.totalMembers} Members</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
              <p className="text-xs text-slate-500 italic">"{company.motto}"</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Dues Compliance</span>
                <span className="font-bold text-emerald-700">{company.duesComplianceRate}%</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/companies">
            <Button variant="outline" size="md">
              View All 7 Companies & Roster
            </Button>
          </Link>
        </div>
      </section>

      {/* NEWS & EVENTS SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="emerald" className="inline-flex items-center gap-1.5">
              <Image src={speakerSvg} alt="Latest Updates" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
              <span>Latest Updates</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              News, Announcements & Events
            </h2>
          </div>

          <Link href="/news">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All News
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {NEWS_LIST.slice(0, 2).map((news) => (
            <Card key={news.id} hoverEffect variant="glass" className="lg:col-span-1 p-6 space-y-4">
              <Badge variant="emerald">{news.category}</Badge>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{news.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{news.summary}</p>
              <div className="pt-2 text-[11px] text-slate-400 flex justify-between">
                <span>{news.author}</span>
                <span>{news.date}</span>
              </div>
            </Card>
          ))}

          {/* Upcoming Event Feature */}
          <Card variant="emerald" className="lg:col-span-1 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                Featured Event
              </Badge>
              <h3 className="text-lg font-bold text-white">{EVENTS_LIST[0].title}</h3>
              <p className="text-xs text-emerald-100">{EVENTS_LIST[0].description}</p>
            </div>
            <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-emerald-100">{EVENTS_LIST[0].date}</span>
              <Link href="/events">
                <Button variant="glass" size="sm" className="text-slate-900 font-semibold">
                  Register
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* REGISTRATION CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="emerald" className="p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Are You an Ex-Boy of NMS 08?</h2>
            <p className="text-sm text-emerald-100">
              Verify your NMS number, join your company cell, pay dues seamlessly, and stay connected with your set brothers worldwide.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link href="/register">
                <Button variant="glass" size="lg" className="text-slate-900 font-bold">
                  Register / Claim Account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
