'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import mainLogo from '@/assets/nms-new-logo.webp';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reflect member auth state: hide the login CTA once a signed-in session exists.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(sessionStorage.getItem('nms08_member_authed') === 'true');
    }
  }, [pathname]);

  // Removed 'Home' and 'Contact' per user instructions.
  // Clicking the main logo takes the user Home.
  const navLinks = [
    { href: '/about', label: 'About NMS 08' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/companies', label: 'Companies' },
    { href: '/news', label: 'News & Announcements' },
    { href: '/events', label: 'Events' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/membership-info', label: 'Membership' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-panel py-2.5 border-b border-emerald-900/10 shadow-apple-md'
          : 'bg-white/75 backdrop-blur-md py-3.5 border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand - Clicking logo navigates Home */}
          <Link href="/" className="flex items-center gap-3 group" title="NMS 08 Home">
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Image
                src={mainLogo}
                alt="NMS 08 Alumni Logo"
                width={48}
                height={48}
                className="h-11 w-auto object-contain drop-shadow-md"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-slate-900">
                  NMS <span className="text-emerald-600">08</span>
                </span>
                <Badge variant="emerald" size="sm">Ex-Boys</Badge>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Digital Governance Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Clean & decluttered */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-apple-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Login CTA (hidden once the member is signed in) */}
          <div className="hidden lg:flex items-center gap-2">
            {!isLoggedIn && (
              <Link href="/login">
                <Button variant="emerald" size="sm" icon={<User className="w-4 h-4" />}>
                  Member Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-200/80 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </div>

          {!isLoggedIn && (
            <div className="pt-4 border-t border-slate-200">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="emerald" className="w-full justify-center">
                  Member Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
