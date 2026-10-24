'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import militaryManSvg from '@/assets/military-man.svg';
import mainLogo from '@/assets/nms-new-logo.webp';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      // The response may not be JSON when the server errors out (e.g. an
      // HTML/text "Internal Server Error" page), so guard the parse.
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        setError(
          data?.message ||
            (res.status >= 500
              ? 'The sign-in service is temporarily unavailable. Please try again in a moment.'
              : 'Authentication failed. Please verify your credentials.')
        );
        return;
      }

      if (data.profile) {
        sessionStorage.setItem('nms08_current_profile', JSON.stringify(data.profile));
        localStorage.setItem('nms08_current_profile', JSON.stringify(data.profile));
        if (data.profile.avatar_url || data.profile.avatarUrl) {
          const avUrl = data.profile.avatar_url || data.profile.avatarUrl;
          localStorage.setItem('nms08_active_avatar', avUrl);
          if (data.profile.nms_number || data.profile.nmsNo) {
            localStorage.setItem(`nms08_avatar_${data.profile.nms_number || data.profile.nmsNo}`, avUrl);
          }
        }
      }
      sessionStorage.setItem('nms08_member_authed', 'true');
      localStorage.setItem('nms08_member_authed', 'true');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 border border-emerald-300/60 flex items-center justify-center p-3 shadow-apple-sm mx-auto">
            <Image
              src={militaryManSvg}
              alt="Ex-Boy Soldier Badge"
              width={42}
              height={42}
              className="w-10 h-10 object-contain text-emerald-900"
              priority
            />
          </div>
          <Badge variant="emerald" className="flex items-center gap-1.5 px-3 py-1">
            <Image src={militaryManSvg} alt="" width={13} height={13} className="w-3.5 h-3.5" />
            <span>Ex-Boy Member Sign In</span>
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ex-Boy Portal Access
          </h1>
          <p className="text-xs text-slate-500">
            Access your profile, dues receipts, welfare claims & voting.
          </p>
        </div>

        <Card variant="glass" className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NMS Service No or Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. NMS/08/6672 or email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Enter your NMS number (e.g. NMS/08/6672) or registered email</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-11 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              icon={<Image src={militaryManSvg} alt="" width={16} height={16} className="w-4 h-4 invert brightness-200" />}
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
