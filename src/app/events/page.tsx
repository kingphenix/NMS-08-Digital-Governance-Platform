'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EVENTS_LIST } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';

export default function EventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['evt-1']);

  const toggleRegister = (id: string) => {
    if (registeredEvents.includes(id)) {
      setRegisteredEvents(registeredEvents.filter(e => e !== id));
    } else {
      setRegisteredEvents([...registeredEvents, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg">Class Calendar</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Events & Reunions
        </h1>
        <p className="text-sm text-slate-600">
          Gathering Ex-Boys for reunions, virtual AGMs, sports days, and military drill showcases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EVENTS_LIST.map((evt) => {
          const isReg = registeredEvents.includes(evt.id);
          return (
            <Card key={evt.id} hoverEffect variant="glass" className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={evt.bannerUrl}
                    alt={evt.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="emerald">{evt.category}</Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {evt.attendeesCount + (isReg ? 1 : 0)} Attending
                </span>
                <Button
                  variant={isReg ? 'outline' : 'emerald'}
                  size="sm"
                  onClick={() => toggleRegister(evt.id)}
                  icon={isReg ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : undefined}
                >
                  {isReg ? 'Registered ✓' : 'Register Seat'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
