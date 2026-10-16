'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import speakerSvg from '@/assets/speaker.svg';
import { NEWS_LIST } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Governance', 'Welfare', 'Event', 'Remembrance'];

  const filteredNews = NEWS_LIST.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg" className="inline-flex items-center gap-2">
          <Image src={speakerSvg} alt="Official Press Speaker" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
          <span>Official Press & Dispatch</span>
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          News & Announcements
        </h1>
        <p className="text-sm text-slate-600">
          Stay informed with governance reports, welfare updates, reunion press releases, and executive dispatches.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-apple-glow'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map((news) => (
          <Card key={news.id} hoverEffect variant="glass" className="overflow-hidden space-y-4 flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={news.imageUrl}
                  alt={news.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="emerald">{news.category}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-emerald-600" /> {news.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> {news.date}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{news.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{news.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">{news.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
