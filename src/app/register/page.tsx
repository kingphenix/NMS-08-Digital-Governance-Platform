'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import secondaryLogo from '@/assets/slogo@2x.png';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    nmsNo: '',
    company: 'Alpha Company',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 900);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200/80 flex items-center justify-center p-2 shadow-apple-sm mx-auto">
            <Image
              src={secondaryLogo}
              alt="NMS Crest Logo"
              width={56}
              height={56}
              className="w-12 h-auto object-contain"
              priority
            />
          </div>
          <Badge variant="emerald">Ex-Boy Registration</Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Claim / Register NMS 08 Profile
          </h1>
          <p className="text-xs text-slate-500">
            Submit your military service number for executive committee verification.
          </p>
        </div>

        <Card variant="glass" className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name (Ex-Boy)</label>
              <input
                type="text"
                required
                placeholder="e.g. Chidi E. Abubakar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NMS Service Number</label>
                <input
                  type="text"
                  required
                  placeholder="NMS/08/xxxx"
                  value={form.nmsNo}
                  onChange={(e) => setForm({ ...form, nmsNo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Military Company</label>
                <select
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Alpha Company">Alpha Company</option>
                  <option value="Bravo Company">Bravo Company</option>
                  <option value="Charlie Company">Charlie Company</option>
                  <option value="Delta Company">Delta Company</option>
                  <option value="Echo Company">Echo Company</option>
                  <option value="Foxtrot Company">Foxtrot Company</option>
                  <option value="Gulf Company">Gulf Company</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="your.name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Create Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button
              type="submit"
              variant="emerald"
              className="w-full justify-center text-sm py-3"
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Submitting Registration...' : 'Submit Profile for Verification'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Already verified?{' '}
            <Link href="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
