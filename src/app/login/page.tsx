'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, X, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import militaryManSvg from '@/assets/military-man.svg';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Success message after a completed password reset
  const [resetSuccessBanner, setResetSuccessBanner] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setResetSuccessBanner(true);
    }
    if (searchParams.get('forgot') === '1') {
      setShowForgotModal(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

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
      try {
        const localSaved = localStorage.getItem('nms08_registered_members') || sessionStorage.getItem('nms08_registered_members');
        const arr = localSaved ? JSON.parse(localSaved) : [];
        if (Array.isArray(arr) && data.profile) {
          const nmsId = data.profile.nms_number || data.profile.nmsNo;
          const filtered = arr.filter((x) => (x.nms_number || x.nmsNo) !== nmsId);
          filtered.unshift(data.profile);
          localStorage.setItem('nms08_registered_members', JSON.stringify(filtered));
          sessionStorage.setItem('nms08_registered_members', JSON.stringify(filtered));
        }
        window.dispatchEvent(new Event('nms08-members-updated'));
        window.dispatchEvent(new Event('nms08-company-updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      sessionStorage.setItem('nms08_member_authed', 'true');
      localStorage.setItem('nms08_member_authed', 'true');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please provide your NMS number or registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setDevResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setForgotError(data?.message || 'Failed to dispatch reset link. Please try again.');
        return;
      }

      setForgotSuccess(true);
      setForgotSuccessMsg(
        data?.message ||
          'A password reset link has been dispatched to your registered email address. Please check your inbox and spam folder.'
      );
      if (data?.devUrl) {
        setDevResetUrl(data.devUrl);
      }
    } catch {
      setForgotError('Network error occurred. Please check your connection and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotError(null);
    setForgotSuccess(false);
    setDevResetUrl(null);
    if (email.trim()) {
      setForgotIdentifier(email.trim());
    }
    setShowForgotModal(true);
  };

  return (
    <>
      <Card variant="glass" className="p-8 space-y-6">
        {/* Reset Success Banner */}
        {resetSuccessBanner && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">
              Password reset successful! Please sign in with your new credentials.
            </p>
          </div>
        )}

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

          {/* Under-the-password space: Remember Me & Forgot Password Trigger */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              Remember this device
            </label>
            <button
              type="button"
              onClick={openForgotModal}
              className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline transition-colors focus:outline-none"
            >
              Forgot Password?
            </button>
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
          Don&apos;t have a verified account?{' '}
          <Link href="/register" className="text-emerald-700 font-bold hover:underline">
            Register / Verify Service No
          </Link>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-apple-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {!forgotSuccess ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-apple-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Reset Your Password
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your registered NMS Service Number or Email Address. The system will generate a secure, time-limited reset link and dispatch it to your registered email.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <p>{forgotError}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NMS Number or Registered Email <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. NMS/08/6672 or email@example.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      The reset link will only be sent to the official verified email on file.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-center text-xs"
                      onClick={() => setShowForgotModal(false)}
                      disabled={forgotLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="emerald"
                      className="flex-1 justify-center text-xs"
                      disabled={forgotLoading}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      {forgotLoading ? 'Generating Link...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5 text-center py-2 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-apple-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Reset Link Dispatched
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {forgotSuccessMsg}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Security Expiry Notice
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    For your security, this password reset token is time-limited to 60 minutes. Once used, it is permanently invalidated.
                  </p>
                </div>

                {devResetUrl && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-2">
                    <p className="font-bold text-[11px] text-amber-800 uppercase tracking-wide">
                      Developer Testing Shortcut
                    </p>
                    <p className="text-[10px] text-amber-700">
                      In local development mode, you can open the reset page directly:
                    </p>
                    <a
                      href={devResetUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <span>Open Reset Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <Button
                  type="button"
                  variant="emerald"
                  className="w-full justify-center text-xs"
                  onClick={() => setShowForgotModal(false)}
                >
                  Done, Return to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
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
            Access your profile, dues receipts, welfare claims &amp; voting.
          </p>
        </div>

        <Suspense fallback={
          <Card variant="glass" className="p-8 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading sign in portal...</p>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
