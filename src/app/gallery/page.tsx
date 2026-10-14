'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');

  const galleryItems = [
    { id: 1, title: 'Passing Out Parade (POP) Zaria', category: 'Nostalgia', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800' },
    { id: 2, title: 'Grand Reunion Gala Night Abuja', category: 'Reunions', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800' },
    { id: 3, title: 'Inter-Company Football Championship', category: 'Sports', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800' },
    { id: 4, title: 'Armed Forces Remembrance Day Parade', category: 'Nostalgia', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800' },
    { id: 5, title: 'Executive Council Inauguration', category: 'Governance', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800' },
    { id: 6, title: 'Annual General Meeting Symposium', category: 'Governance', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800' },
  ];

  const filteredItems = filter === 'All' ? galleryItems : galleryItems.filter(i => i.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg">Photo Archive</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          NMS 08 Photo Gallery
        </h1>
        <p className="text-sm text-slate-600">
          Memories from Zaria parade grounds to alumni celebrations across the globe.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {['All', 'Nostalgia', 'Reunions', 'Sports', 'Governance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              filter === cat
                ? 'bg-emerald-600 text-white shadow-apple-glow'
                : 'glass-panel text-slate-700 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} hoverEffect variant="glass" className="overflow-hidden group">
            <div className="relative h-64 w-full">
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <Badge variant="emerald" size="sm" className="w-fit mb-2">{item.category}</Badge>
                <h4 className="font-bold text-sm">{item.title}</h4>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
