'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartProps {
  data: Array<{ month?: string; amount?: number; company?: string; compliance?: number; name?: string; votes?: number }>;
}

export function DuesTrendChart({ data }: ChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            unit="M"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(10px)',
            }}
            formatter={(value: any) => [`₦${value} Million`, 'Dues Collected']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#059669"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#emeraldGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompanyComplianceChart({ data }: ChartProps) {
  const COLORS = ['#059669', '#047857', '#10b981', '#065f46', '#34d399', '#064e3b', '#6ee7b7'];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis dataKey="company" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} width={60} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid #d1fae5',
            }}
            formatter={(val: any) => [`${val}% Compliant`, 'Dues Status']}
          />
          <Bar dataKey="compliance" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ElectionVotesChart({ candidates }: { candidates: Array<{ name: string; votesCount: number; company: string }> }) {
  const formattedData = candidates.map(c => ({
    name: c.name.split(' ').slice(1, 3).join(' '),
    votes: c.votesCount,
  }));

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid #a7f3d0',
            }}
            formatter={(val: any) => [`${val} Votes`, 'Current Count']}
          />
          <Bar dataKey="votes" fill="#059669" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
