import React from 'react';
import Image from 'next/image';
import { LEADERSHIP_LIST } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, Shield } from 'lucide-react';

export default function LeadershipPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg">Executive Governance</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          NMS 08 Alumni Executive Council
        </h1>
        <p className="text-sm text-slate-600">
          Elected national officers steering set governance, financial management, chapter expansion, and welfare support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEADERSHIP_LIST.map((leader) => (
          <Card key={leader.id} hoverEffect variant="glass" className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src={leader.imageUrl}
                  alt={leader.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <Badge variant="emerald" size="sm">{leader.role}</Badge>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">{leader.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{leader.nmsNo} • {leader.company}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {leader.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{leader.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{leader.phone}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
