'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, MapPin, Heart, X, ZoomIn, Sparkles, Filter, Users, Tag } from 'lucide-react';
import { WEDDINGS, formatWeddingDate, type Wedding } from '@/lib/weddings';

export interface EventItem {
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

export default function EventsPage() {
  const [adminEvents, setAdminEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Fetch dynamic events created by admin (includes static events unless deleted)
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.events)) {
          setAdminEvents(data.events);
        }
      })
      .catch((err) => console.error('Error loading events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Map flyers and sort chronologically
  const allEvents = useMemo<EventItem[]>(() => {
    return adminEvents.map((e) => {
      const staticFlyer = WEDDING_FLYERS[(e as any).flyer_static_id || e.id];
      return {
        ...e,
        flyer_static: staticFlyer || e.flyer_static,
      };
    }).sort((a, b) => (b.event_date || '').localeCompare(a.event_date || ''));
  }, [adminEvents]);

  // Categories list
  const categories = ['All', 'Reunion', 'Wedding', 'Meeting', 'Social', 'General'];

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return allEvents;
    return allEvents.filter(
      (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [allEvents, selectedCategory]);

  // Close the invitation viewer with Escape.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'reunion':
        return 'emerald';
      case 'wedding':
        return 'rose';
      case 'meeting':
        return 'blue';
      case 'social':
      case 'sports':
        return 'amber';
      default:
        return 'subtle';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg" className="inline-flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Class Calendar &amp; Dispatches</span>
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Events &amp; Reunions
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Stay connected with upcoming reunions, set meetings, brotherhood dinners, and wedding celebrations.
          Tap any event card to view the full announcement flyer and schedule details.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((cat) => {
          const count =
            cat === 'All'
              ? allEvents.length
              : allEvents.filter((e) => e.category.toLowerCase() === cat.toLowerCase()).length;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-apple-sm shadow-emerald-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <Card variant="glass" className="p-12 text-center space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Events in this Category</h3>
          <p className="text-xs text-slate-500">
            Check back soon or select &quot;All&quot; to browse all class calendar announcements.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSelectedCategory('All')}>
            View All Events
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isWedding = event.category.toLowerCase() === 'wedding';

            return (
              <Card
                key={event.id}
                hoverEffect
                variant="glass"
                className="overflow-hidden flex flex-col justify-between group border-white/70 shadow-apple-sm hover:shadow-apple-md transition-all duration-300"
              >
                <div>
                  {/* Picture / Flyer Banner */}
                  <button
                    type="button"
                    onClick={() => setSelected(event)}
                    aria-label={`View full flyer for ${event.title}`}
                    className="relative block w-full h-72 overflow-hidden bg-slate-50 cursor-zoom-in"
                  >
                    {event.flyer_static ? (
                      <Image
                        src={event.flyer_static}
                        alt={`${event.title} flyer`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={`${event.title} flyer`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                        <Calendar className="w-16 h-16 mb-2 text-emerald-200" />
                        <span className="text-xs font-semibold text-slate-400">Class Event</span>
                      </div>
                    )}

                    {/* Category badge overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge variant={getCategoryBadgeVariant(event.category) as any}>
                        {isWedding && <Heart className="w-3 h-3 text-rose-500 mr-1 inline" />}
                        {event.category}
                      </Badge>
                    </div>

                    {/* Zoom prompt */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <ZoomIn className="w-3.5 h-3.5" />
                      View Flyer
                    </div>
                  </button>

                  {/* Details section */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Date, Time & Venue */}
                    <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {formatWeddingDate(event.event_date)}
                        </span>
                      </div>

                      {event.event_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{event.event_time}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description snippet */}
                    {event.description && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="p-6 pt-0">
                  <Button
                    variant="emerald"
                    size="sm"
                    className="w-full justify-center"
                    icon={<ZoomIn className="w-4 h-4" />}
                    onClick={() => setSelected(event)}
                  >
                    View Flyer &amp; Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Event Details & High-Res Flyer Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} invitation flyer`}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-apple-lg border border-white"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getCategoryBadgeVariant(selected.category) as any}>
                    {selected.category}
                  </Badge>
                  {selected.organizer && (
                    <span className="text-[11px] text-slate-400">
                      Organized by {selected.organizer}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {selected.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-700 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatWeddingDate(selected.event_date)}
                  </span>
                  {selected.event_time && (
                    <span className="flex items-center gap-1 text-slate-500 font-normal">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selected.event_time}
                    </span>
                  )}
                  {selected.location && (
                    <span className="flex items-center gap-1 text-slate-500 font-normal">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selected.location}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close event modal"
                className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Flyer Picture & Full Description */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              {/* Picture / Flyer */}
              {selected.flyer_static ? (
                <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm border border-slate-200">
                  <Image
                    src={selected.flyer_static}
                    alt={`${selected.title} flyer`}
                    width={selected.flyer_static.width}
                    height={selected.flyer_static.height}
                    className="mx-auto h-auto w-full rounded-xl"
                  />
                </div>
              ) : selected.image_url ? (
                <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm border border-slate-200">
                  <img
                    src={selected.image_url}
                    alt={`${selected.title} flyer`}
                    className="mx-auto max-h-[60vh] w-auto rounded-xl object-contain"
                  />
                </div>
              ) : null}

              {/* Full Description */}
              {selected.description && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Details &amp; Information
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
