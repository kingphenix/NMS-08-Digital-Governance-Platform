'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Heart, X, ZoomIn } from 'lucide-react';
import { WEDDINGS, formatWeddingDate, type Wedding } from '@/lib/weddings';

export default function EventsPage() {
  const [selected, setSelected] = useState<Wedding | null>(null);

  // Close the invitation viewer with Escape.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg">Class Calendar</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Events & Reunions
        </h1>
        <p className="text-sm text-slate-600">
          Wedding invitations from our set brothers. Ex-Boys are warmly invited to celebrate with
          them — tap any invitation to view the full flyer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WEDDINGS.map((wedding) => (
          <Card
            key={wedding.id}
            hoverEffect
            variant="glass"
            className="overflow-hidden flex flex-col justify-between"
          >
            <div>
              <button
                type="button"
                onClick={() => setSelected(wedding)}
                aria-label={`View the full wedding invitation for ${wedding.couple}`}
                className="relative block w-full h-72 overflow-hidden bg-slate-50 group cursor-zoom-in"
              >
                <Image
                  src={wedding.flyer}
                  alt={`${wedding.couple} wedding invitation`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="emerald">Wedding</Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <ZoomIn className="w-3.5 h-3.5" />
                  View Flyer
                </div>
              </button>

              <div className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 leading-snug flex items-start gap-2">
                  <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  {wedding.couple}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900">
                    {formatWeddingDate(wedding.isoDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Button
                variant="emerald"
                size="sm"
                icon={<ZoomIn className="w-4 h-4" />}
                onClick={() => setSelected(wedding)}
              >
                View Invitation
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.couple} wedding invitation`}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-apple-lg"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {selected.couple}
                </h3>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatWeddingDate(selected.isoDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close invitation"
                className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto bg-slate-100 p-3 sm:p-4">
              <Image
                src={selected.flyer}
                alt={`${selected.couple} wedding invitation flyer`}
                width={selected.flyer.width}
                height={selected.flyer.height}
                className="mx-auto h-auto w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
