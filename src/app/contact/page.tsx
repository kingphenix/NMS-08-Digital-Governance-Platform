'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="lg">National Secretariat</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-sm text-slate-600">
          Contact the Executive Council, National PRO, or Chapter Coordinators for enquiries, member verification, or welfare support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass" className="p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">Secretariat Information</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">National Secretariat</h4>
                  <p className="text-slate-600">NMS Alumni House, Central Business District, Abuja, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Official Email</h4>
                  <p className="text-slate-600">secretariat@nms08alumni.org</p>
                  <p className="text-slate-600">welfare@nms08alumni.org</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Emergency & Enquiries Hotline</h4>
                  <p className="text-slate-600">+234 803 000 0008 (National PRO)</p>
                  <p className="text-slate-600">+234 801 444 5566 (Welfare Officer)</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card variant="glass" className="p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">Send a Message to Secretariat</h3>
            
            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Message Delivered</h4>
                <p className="text-xs text-slate-600">Thank you, Ex-Boy. The National Secretariat will respond to your registered email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input type="text" required placeholder="e.g. Ex-Boy Musa Abubakar" className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NMS Service Number</label>
                    <input type="text" required placeholder="NMS/08/xxxx" className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" required placeholder="member@domain.org" className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input type="text" required placeholder="Enquiry / Dues Receipt / Welfare" className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea rows={4} required placeholder="Write your message here..." className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>

                <Button type="submit" variant="emerald" icon={<Send className="w-4 h-4" />}>
                  Dispatch Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
