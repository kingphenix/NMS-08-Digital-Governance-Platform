'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import militaryManSvg from '@/assets/military-man.svg';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [memberInfo, setMemberInfo] = useState<{ name: string; nms: string } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setVerificationError('No password reset token was provided. Please check the link from your email.');
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => null);

        if (!active) return;
        if (res.ok && data?.ok && data?.valid) {
          setTokenValid(true);
          setMemberInfo({ name: data.name, nms: data.nms });
        } else {
          setTokenValid(false);
          setVerificationError(data?.error || 'This password reset link is invalid or has expired. Please request a new one.');
        }
      } catch {
        if (active) {
          setTokenValid(false);
          setVerificationError('Could not verify reset token. Please check your internet connection and try again.');
        }
      } finally {
        if (active) setVerifying(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setFormError(data?.message || 'Failed to reset password. Please try again or request a new reset link.');
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3500);
    } catch {
      setFormError('Network error occurred. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card variant="glass" className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Verifying Security Token...</h2>
        <p className="text-xs text-slate-500">Checking the authenticity and validity of your reset link.</p>
      </Card>
    );
  }

  if (resetSuccess) {
    return (
      <Card variant="glass" className="p-8 text-center space-y-6 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-apple-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Password Reset Complete!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your password has been successfully updated and your security token has been invalidated.
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          Redirecting you to the member sign-in page in a few seconds...
        </div>
        <Link href="/login?reset=success">
          <Button variant="emerald" className="w-full justify-center">
            Proceed to Sign In Now
          </Button>
        </Link>
      </Card>
    );
  }

  if (!tokenValid) {
    return (
      <Card variant="glass" className="p-8 text-center space-y-6 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto shadow-apple-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Reset Link Invalid or Expired</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {verificationError || 'This password reset link is invalid, has expired, or has already been used.'}
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Link href="/login?forgot=1">
            <Button variant="emerald" className="w-full justify-center">
              Request a New Reset Link
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full justify-center text-xs">
              Return to Member Sign In
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-8 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <Badge variant="emerald" className="inline-flex items-center gap-1.5 px-3 py-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Verification Passed</span>
        </Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Set New Password
        </h2>
        {memberInfo && (
          <p className="text-xs text-slate-600">
            Resetting credentials for <span className="font-bold text-slate-800">{memberInfo.name}</span>{' '}
            (<span className="text-emerald-700 font-semibold">{memberInfo.nms}</span>)
          </p>
        )}
      </div>

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <p className="font-medium">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-11 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters long</p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[10px] text-rose-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          variant="emerald"
          className="w-full justify-center text-sm py-3 mt-2"
          disabled={submitting}
          icon={<KeyRound className="w-4 h-4" />}
        >
          {submitting ? 'Updating Password...' : 'Save New Password'}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Remembered your password?{' '}
        <Link href="/login" className="text-emerald-700 font-bold hover:underline">
          Return to Sign In
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
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
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account Security Recovery</span>
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security Credential Reset
          </h1>
          <p className="text-xs text-slate-500">
            NMS Class of 2008 Digital Governance Platform
          </p>
        </div>

        <Suspense fallback={
          <Card variant="glass" className="p-8 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-base font-bold text-slate-800">Loading Password Recovery...</h2>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
