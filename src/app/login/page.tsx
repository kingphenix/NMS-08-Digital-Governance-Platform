'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import mainLogo from '@/assets/nms-new-logo.webp';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200/80 flex items-center justify-center p-2 shadow-apple-sm mx-auto">
            <Image
              src={mainLogo}
              alt="NMS 08 Logo"
              width={56}
              height={56}
              className="w-12 h-auto object-contain"
              priority
            />
          </div>
          <Badge variant="emerald">NMS 08 Portal</Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ex-Boy Member Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Access your profile, dues receipts, welfare claims & voting.
          </p>
        </div>

        <Card variant="glass" className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address or Service No</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="chidi.abubakar@nms08alumni.org or NMS/08/4912"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-1.5 text-slate-600">
                <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                Remember this device
              </label>
              <a href="#" className="text-emerald-700 font-semibold hover:underline">Forgot Password?</a>
            </div>

            <Button
              type="submit"
              variant="emerald"
              className="w-full justify-center text-sm py-3"
              disabled={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Don't have a verified account?{' '}
            <Link href="/register" className="text-emerald-700 font-bold hover:underline">
              Register / Verify Service No
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
