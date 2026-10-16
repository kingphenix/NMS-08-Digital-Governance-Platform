import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import mainLogo from '@/assets/nms-new-logo.webp';
import shieldSvg from '@/assets/shield.svg';
import { Heart, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={mainLogo}
                alt="NMS 08 Main Logo"
                width={50}
                height={50}
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  NMS <span className="text-emerald-400">08</span> Alumni
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Class of 2008 Digital Governance</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nigerian Military School Class of 2008  Fostering military discipline, professional excellence, democratic governance, and lifelong brotherhood.
            </p>
            <div className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
              Motto: Discipline, Knowledge & Patriotism
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About NMS 08</Link></li>
              <li><Link href="/leadership" className="hover:text-emerald-400 transition-colors">Executive Council</Link></li>
              <li><Link href="/companies" className="hover:text-emerald-400 transition-colors">Companies</Link></li>
              <li><Link href="/news" className="hover:text-emerald-400 transition-colors">News & Press</Link></li>
              <li><Link href="/events" className="hover:text-emerald-400 transition-colors">Events & Reunions</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Portal & Governance */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Governance & Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">Member Portal <ExternalLink className="w-3 h-3 text-slate-500" /></Link></li>
              <li><Link href="/membership-info" className="hover:text-emerald-400 transition-colors">Dues & Welfare Information</Link></li>
              <li><Link href="/gallery" className="hover:text-emerald-400 transition-colors">Photo Gallery</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Member Sign In</Link></li>
              <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Register Profile</Link></li>
            </ul>
          </div>

          {/* Secretariat Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">National Secretariat</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>NMS Alumni House, Central Business District, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>secretariat@nms08alumni.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+234 803 000 0008</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Features the Admin Governance Link at the end of the site */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NMS Class of 2008. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            {/* Admin Console link placed at the very end of the site */}
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors flex items-center gap-2 font-medium group shadow-apple-sm"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform">
                <Image src={shieldSvg} alt="Admin Shield Badge" width={14} height={14} className="w-3.5 h-3.5 invert brightness-200" />
              </div>
              <span>Admin Portal Access</span>
            </Link>

            <span className="flex items-center gap-1 text-slate-400">
              Built by Trinity Vote
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
