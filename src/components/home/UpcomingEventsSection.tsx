'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WEDDINGS, formatWeddingDate } from '@/lib/weddings';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  category: string;
  image_url?: string | null;
  flyer_static?: any;
  organizer?: string;
  is_featured?: boolean;
}

const WEDDING_FLYERS: Record<string, any> = {};
for (const w of WEDDINGS) {
  WEDDING_FLYERS[w.id] = w.flyer;
}

export function UpcomingEventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error('Error fetching upcoming events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter only upcoming events (dates today or in the future)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayKey = `${year}-${month}-${day}`;

    return events
      .filter((e) => {
        if (!e.event_date) return false;
        // Check if event date is today or later
        return e.event_date >= todayKey;
      })
      .map((e) => ({
        ...e,
        flyer_static: WEDDING_FLYERS[(e as any).flyer_static_id || e.id] || e.flyer_static,
      }))
      .sort((a, b) => (a.event_date || '').localeCompare(b.event_date || ''));
  }, [events]);

  const total = upcomingEvents.length;
  const isCarousel = total > 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, total - 3) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= total - 3 ? 0 : prev + 1));
  };

  const visibleEvents = useMemo(() => {
    if (!isCarousel) return upcomingEvents;
    // Show 3 items starting from currentIndex
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(upcomingEvents[(currentIndex + i) % total]);
    }
    return items;
  }, [upcomingEvents, isCarousel, currentIndex, total]);

  const getCategoryBadgeVariant = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'wedding':
        return 'rose';
      case 'reunion':
        return 'emerald';
      case 'meeting':
        return 'blue';
      default:
        return 'emerald';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" className="inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Alumni Calendar</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Upcoming Set Events &amp; Weddings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed celebrations, meetings, and gatherings across the brotherhood
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCarousel && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="h-8 w-8 p-0 rounded-xl hover:bg-white"
                aria-label="Previous events"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </Button>
              <span className="text-[11px] font-bold text-slate-600 px-2">
                {currentIndex + 1}–{Math.min(currentIndex + 3, total)} / {total}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0 rounded-xl hover:bg-white"
                aria-label="Next events"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </Button>
            </div>
          )}

          <Link href="/events">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Events Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-slate-100/80 animate-pulse border border-slate-200/50"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <Card variant="glass" className="p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Upcoming Events Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no upcoming events or weddings scheduled. New alumni gatherings and celebrations will appear here as soon as they are announced.
          </p>
          <div className="pt-2">
            <Link href="/events">
              <Button variant="outline" size="sm">
                Check Past Events Calendar
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleEvents.map((evt, idx) => {
            const hasFlyer = Boolean(evt.flyer_static || evt.image_url);
            const isWedding = evt.category?.toLowerCase() === 'wedding';

            return (
              <Card
                key={`${evt.id}-${idx}`}
                hoverEffect
                variant="glass"
                className="p-0 overflow-hidden flex flex-col justify-between group border border-slate-200/80 hover:border-emerald-500/50 transition-all duration-300"
              >
                {/* Image / Flyer Header */}
                <div className="relative w-full h-44 bg-slate-900 overflow-hidden shrink-0">
                  {evt.flyer_static ? (
                    <Image
                      src={evt.flyer_static}
                      alt={evt.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : evt.image_url ? (
                    <Image
                      src={evt.image_url}
                      alt={evt.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-4 text-center">
                      {isWedding ? (
                        <Heart className="w-10 h-10 text-rose-400/80 mb-2" />
                      ) : (
                        <Calendar className="w-10 h-10 text-emerald-400/80 mb-2" />
                      )}
                      <span className="text-xs font-semibold text-emerald-200 tracking-wide uppercase">
                        {evt.category || 'Alumni Event'}
                      </span>
                    </div>
                  )}

                  {/* Category Badge overlay */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={getCategoryBadgeVariant(evt.category)} size="sm">
                      {isWedding && <Heart className="w-3 h-3 mr-1 inline" />}
                      {evt.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                      {evt.title}
                    </h3>
                    {evt.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {evt.event_date
                          ? formatWeddingDate(evt.event_date)
                          : 'Date to be announced'}
                      </span>
                    </div>

                    {evt.event_time && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.event_time}</span>
                      </div>
                    )}

                    {evt.location && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 pb-5 pt-0">
                  <Link href="/events" className="block w-full">
                    <Button
                      variant={isWedding ? 'emerald' : 'outline'}
                      size="sm"
                      className="w-full justify-center text-xs"
                    >
                      {isWedding ? 'View Wedding Details' : 'View Event Details'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
