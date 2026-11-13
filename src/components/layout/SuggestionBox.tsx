'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, MessageSquarePlus, Send, X } from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  email: '',
  category: 'Other',
  message: '',
  website: '',
};

export function SuggestionBox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const close = () => {
    if (busy) return;
    setOpen(false);
    setError('');
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.message || 'We could not send your suggestion. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('We could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSent(false);
          setError('');
        }}
        className="inline-flex items-center gap-2 text-left hover:text-emerald-400 transition-colors"
      >
        <MessageSquarePlus className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        Suggestion Box
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-box-title"
            aria-describedby="suggestion-box-description"
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-emerald-50 p-2.5 text-emerald-700">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="suggestion-box-title" className="text-lg font-extrabold text-slate-900">
                    Share a Suggestion
                  </h2>
                  <p id="suggestion-box-description" className="mt-1 text-xs leading-relaxed text-slate-500">
                    Help us improve the NMS 08 platform and our alumni community. Suggestions go directly to the administrators.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close suggestion box"
                onClick={close}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {sent ? (
              <div className="px-6 py-12 text-center sm:px-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Thank you for your suggestion</h3>
                <p className="mt-2 text-sm text-slate-500">
                  It has been sent to the NMS 08 administrators for review.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 px-6 py-6 sm:px-8">
                {error && (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                    Your name <span className="font-normal text-slate-400">(optional)</span>
                    <input
                      type="text"
                      maxLength={100}
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                    Email <span className="font-normal text-slate-400">(optional)</span>
                    <input
                      type="email"
                      maxLength={254}
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  >
                    <option>Platform</option>
                    <option>Governance</option>
                    <option>Welfare</option>
                    <option>Events</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
                  Your suggestion
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Tell us what could be improved or what you would like to see..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                  <span className="block text-right font-normal text-slate-400">
                    {form.message.length}/2,000
                  </span>
                </label>

                <label
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                >
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => setForm({ ...form, website: event.target.value })}
                  />
                </label>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {busy ? 'Sending...' : 'Send suggestion'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
