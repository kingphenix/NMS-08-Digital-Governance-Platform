'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Heart,
  Users,
  Droplets,
  Medal,
  AlertCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import secondaryLogo from '@/assets/slogo@2x.png';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    // Military Background / Accreditation
    nmsNo: '',
    company: 'Alpha Company',
    rankAppointment: '',
    setAppointment: '',

    // Personal Details
    name: '',
    dob: '',
    stateOfOrigin: 'Plateau',
    stateOfResidence: '',
    address: '',
    maritalStatus: 'Single',

    // Contact Info
    email: '',
    phone: '',

    // Professional Details
    occupation: '',
    industry: '',
    business: '',
    skills: '',
    professionalQualifications: '',

    // Medical Info
    bloodGroup: 'O+',
    genotype: 'AA',

    // Next of Kin
    nextOfKin: '',
    relationship: 'Brother',
    nextOfKinPhone: '',

    // Password
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Read the base URL the client will ACTUALLY call at runtime instead of a
  // compile-time env var, so this check is always accurate to the exact bundle
  // the visitor's browser is running. A silently-unconfigured client points at
  // a dead placeholder URL and every Edge Function call would fail with a
  // confusing network error, so we surface a clear message up front instead.
  // (FunctionsClient stores its base URL on a protected `url` field, which is
  // guarded behind an `any` cast since TypeScript only enforces `protected` at
  // compile time.)
  const functionsBaseUrl: string =
    ((supabase.functions as any)?.url as string) || '';
  const supabaseMisconfigured =
    !functionsBaseUrl ||
    functionsBaseUrl.includes('your-project-ref') ||
    functionsBaseUrl.includes('placeholder-nms08');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    const nmsInput = form.nmsNo.trim();
    const nameInput = form.name.trim();

    // Password validation for site access
    if (!form.password || form.password.trim().length < 6) {
      setErrorMessage('Please create a password with at least 6 characters to access the site.');
      setLoading(false);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both password fields are identical.');
      setLoading(false);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (supabaseMisconfigured) {
      setErrorMessage(
        'Portal configuration error: the verification service is not configured on this build. ' +
          'If the site was just updated, refresh the page (Ctrl/Cmd+Shift+R) to load the latest version; ' +
          'otherwise contact the platform administrator.'
      );
      setLoading(false);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    const payload = {
      nms_number: nmsInput,
      full_name: nameInput,
      company: form.company,
      rank_appointment: form.rankAppointment,
      set_appointment: form.setAppointment,
      dob: form.dob,
      state_of_origin: form.stateOfOrigin,
      state_of_residence: form.stateOfResidence,
      address: form.address,
      marital_status: form.maritalStatus,
      email: form.email,
      phone: form.phone,
      occupation: form.occupation,
      industry: form.industry,
      business: form.business,
      skills: form.skills,
      professional_qualifications: form.professionalQualifications,
      blood_group: form.bloodGroup,
      genotype: form.genotype,
      next_of_kin: form.nextOfKin,
      relationship: form.relationship,
      next_of_kin_phone: form.nextOfKinPhone,
      password: form.password.trim(),
    };

    try {
      const { data, error } = await supabase.functions.invoke('register', {
        body: payload,
      });

      let resData = data;
      if (error) {
        if ('context' in error && error.context) {
          try {
            const ctx = error.context as Response;
            const parsed = typeof ctx.clone === 'function' ? await ctx.clone().json() : await ctx.json();
            if (parsed && typeof parsed === 'object') {
              resData = parsed;
            }
          } catch {
            // Context was not JSON or already consumed
          }
        }
      }

      if (resData?.ok) {
        // Registration complete (no voting code is issued).
        setIsRegistered(true);
        setErrorMessage(null);

        // Store submitted profile in session for dashboard view
        try {
          sessionStorage.setItem(
            'nms08_current_profile',
            JSON.stringify({
              ...payload,
              name: nameInput,
              nmsNo: nmsInput,
            })
          );
        } catch {}

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // supabase-js throws FunctionsFetchError with this message when the
        // fetch itself fails (DNS / network / offline) rather than the edge
        // function returning an error, so replace it with helpful copy.
        const rawMsg =
          typeof error?.message === 'string' ? error.message : null;
        const fetchLevelFailure =
          rawMsg === 'Failed to send a request to the Edge Function';

        const msg =
          resData?.message ||
          (rawMsg && !fetchLevelFailure ? rawMsg : null) ||
          (fetchLevelFailure
            ? 'Could not reach the verification service. Check your internet connection and try again.'
            : null) ||
          'Registration failed. Check your details or contact the electoral committee.';
        setErrorMessage(msg);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setErrorMessage('Network connection error. Check your connection and try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 transition-all text-sm placeholder:text-slate-400';
  const labelClasses = 'block font-bold text-slate-700 mb-1.5 flex items-center gap-2 text-xs';
  const sectionHeaderClasses =
    'text-sm font-black text-emerald-800 uppercase tracking-widest pb-2 border-b-2 border-emerald-100 mb-6 mt-8 flex items-center gap-2';

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-3 shadow-apple-md mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Image
              src={secondaryLogo}
              alt="NMS Crest Logo"
              width={64}
              height={64}
              className="w-14 h-auto object-contain"
              priority
            />
          </div>
          <Badge variant="emerald" className="px-4 py-1 text-xs font-bold uppercase tracking-wider">
            Ex-Boy Registration & Accreditation
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            NMS 08 Digital Governance Platform
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Complete your profile registration for alumni class verification and access to the digital governance portal.
          </p>
        </div>

        {/* Success View: Registration Complete */}
        {isRegistered ? (
          <Card variant="glass" className="p-8 md:p-12 shadow-apple-lg border-emerald-500/40 bg-white/90 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200 mb-2">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <Badge variant="emerald" className="px-3 py-0.5 text-xs">Verified Member</Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registration Successful!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Welcome, <strong className="text-slate-900">{form.name}</strong> ({form.nmsNo}). Your alumni profile has been created and verified against the official class roster. You can now sign in with your NMS number or email and password.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Registered Profile Summary
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div><span className="text-slate-400 block">Service Number:</span> <strong className="font-mono">{form.nmsNo}</strong></div>
                <div><span className="text-slate-400 block">Military Company:</span> <strong>{form.company}</strong></div>
                <div><span className="text-slate-400 block">Blood Group:</span> <strong>{form.bloodGroup} ({form.genotype})</strong></div>
                <div><span className="text-slate-400 block">Email Address:</span> <span>{form.email || 'N/A'}</span></div>
                <div><span className="text-slate-400 block">Phone:</span> <span>{form.phone || 'N/A'}</span></div>
                <div><span className="text-slate-400 block">State of Origin:</span> <span>{form.stateOfOrigin}</span></div>
              </div>
            </div>

            {/* Single Action */}
            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                id="go-to-login-btn"
                className="block w-full py-3.5 px-4 rounded-xl font-bold text-sm text-center bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-[0.99]"
              >
                Go to Member Sign In
              </Link>
            </div>
          </Card>
        ) : (
          /* Full Registration Form */
          <Card variant="glass" className="p-8 md:p-12 shadow-apple-lg border-white/60 bg-white/90">
            <form onSubmit={handleRegister} className="space-y-8 text-xs">
              {/* Error Alert */}
              {errorMessage && (
                <div
                  id="registration-error-alert"
                  className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-900 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-red-950">Accreditation Check Failed</p>
                    <p className="leading-relaxed font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Military Background & Accreditation */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1. Military Background & Accreditation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nms_number" className={labelClasses}>
                      NMS Service Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nms_number"
                      type="text"
                      required
                      placeholder="e.g. NMS/08/6672"
                      value={form.nmsNo}
                      onChange={(e) => setForm({ ...form, nmsNo: e.target.value })}
                      disabled={loading}
                      autoComplete="off"
                      className={`${inputClasses} font-mono font-bold text-emerald-700 uppercase`}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Accepts standard formats (e.g. NMS/08/6672, NMS 08 6672, NMS-08-6672).
                    </p>
                  </div>

                  <div>
                    <label htmlFor="company" className={labelClasses}>Military Company <span className="text-red-500">*</span></label>
                    <select
                      id="company"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Gulf'].map((c) => (
                        <option key={c} value={`${c} Company`}>
                          {c} Company
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rankAppointment" className={labelClasses}>Rank/Appointment as Boy Soldier</label>
                    <input
                      id="rankAppointment"
                      type="text"
                      placeholder="e.g. B/Sgt, Company Senior, Boy Soldier"
                      value={form.rankAppointment}
                      onChange={(e) => setForm({ ...form, rankAppointment: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="setAppointment" className={labelClasses}>Set Appointment (if any)</label>
                    <input
                      id="setAppointment"
                      type="text"
                      placeholder="e.g. Assistant Set PRO, Welfare Officer"
                      value={form.setAppointment}
                      onChange={(e) => setForm({ ...form, setAppointment: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Personal Details */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <User className="w-4 h-4 text-emerald-600" /> 2. Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="full_name" className={labelClasses}>
                      Full Name (as on NMS Roster) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      required
                      placeholder="e.g. Saviour BAWA Stephen or Isah NUPEKO Mohammed"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={loading}
                      autoComplete="name"
                      className={`${inputClasses} font-semibold`}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Must match your name tokens on the official class roster (order and middle name are flexible).
                    </p>
                  </div>

                  <div>
                    <label htmlFor="dob" className={labelClasses}>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Birth
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="maritalStatus" className={labelClasses}>
                      <Heart className="w-3.5 h-3.5 text-slate-400" /> Marital Status
                    </label>
                    <select
                      id="maritalStatus"
                      value={form.maritalStatus}
                      onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {['Single', 'Married', 'Divorced', 'Widowed'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="stateOfOrigin" className={labelClasses}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> State of Origin
                    </label>
                    <select
                      id="stateOfOrigin"
                      value={form.stateOfOrigin}
                      onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="stateOfResidence" className={labelClasses}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> State / City of Residence
                    </label>
                    <input
                      id="stateOfResidence"
                      type="text"
                      placeholder="e.g. Abuja, Lagos, Port Harcourt, UK"
                      value={form.stateOfResidence}
                      onChange={(e) => setForm({ ...form, stateOfResidence: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className={labelClasses}>Residential / Contact Address</label>
                    <input
                      id="address"
                      type="text"
                      placeholder="e.g. 14 Victoria Island Road, Lagos"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Contact Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <Mail className="w-4 h-4 text-emerald-600" /> 3. Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className={labelClasses}>
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={loading}
                      autoComplete="email"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClasses}>
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone / WhatsApp Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="e.g. +234 803 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={loading}
                      autoComplete="tel"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* Section 4: Professional Details */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <Briefcase className="w-4 h-4 text-emerald-600" /> 4. Professional & Career Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="occupation" className={labelClasses}>Current Occupation / Title</label>
                    <input
                      id="occupation"
                      type="text"
                      placeholder="e.g. Software Engineer, Military Officer, Lawyer"
                      value={form.occupation}
                      onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className={labelClasses}>Industry / Sector</label>
                    <input
                      id="industry"
                      type="text"
                      placeholder="e.g. Defense, Technology, Finance, Energy"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="business" className={labelClasses}>Employer / Business Name</label>
                    <input
                      id="business"
                      type="text"
                      placeholder="e.g. Nigerian Army, Shell, Self-Employed"
                      value={form.business}
                      onChange={(e) => setForm({ ...form, business: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="professionalQualifications" className={labelClasses}>Professional Qualifications</label>
                    <input
                      id="professionalQualifications"
                      type="text"
                      placeholder="e.g. B.Sc, M.Sc, COREN, PMP, BL"
                      value={form.professionalQualifications}
                      onChange={(e) => setForm({ ...form, professionalQualifications: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="skills" className={labelClasses}>Key Skills & Expertise</label>
                    <input
                      id="skills"
                      type="text"
                      placeholder="e.g. Tactical Leadership, Financial Analysis, Cloud Architecture"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* Section 5: Medical Information */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <Droplets className="w-4 h-4 text-emerald-600" /> 5. Medical Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="bloodGroup" className={labelClasses}>Blood Group</label>
                    <select
                      id="bloodGroup"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="genotype" className={labelClasses}>Genotype</label>
                    <select
                      id="genotype"
                      value={form.genotype}
                      onChange={(e) => setForm({ ...form, genotype: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {['AA', 'AS', 'SS', 'AC', 'Unknown'].map((gt) => (
                        <option key={gt} value={gt}>{gt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 6: Next of Kin */}
              <section>
                <h2 className={sectionHeaderClasses}>
                  <Users className="w-4 h-4 text-emerald-600" /> 6. Next of Kin Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="nextOfKin" className={labelClasses}>Next of Kin Name</label>
                    <input
                      id="nextOfKin"
                      type="text"
                      placeholder="e.g. Grace Stephen"
                      value={form.nextOfKin}
                      onChange={(e) => setForm({ ...form, nextOfKin: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="relationship" className={labelClasses}>Relationship</label>
                    <select
                      id="relationship"
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    >
                      {['Spouse', 'Brother', 'Sister', 'Parent', 'Son', 'Daughter', 'Friend', 'Other'].map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nextOfKinPhone" className={labelClasses}>Next of Kin Phone</label>
                    <input
                      id="nextOfKinPhone"
                      type="tel"
                      placeholder="e.g. +234 802 987 6543"
                      value={form.nextOfKinPhone}
                      onChange={(e) => setForm({ ...form, nextOfKinPhone: e.target.value })}
                      disabled={loading}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              {/* Section 7: Password */}
              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-emerald-100 mt-8">
                  <h2 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" /> 7. Password
                  </h2>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Required for Site Access
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Create a secure password. You will use this password together with your <strong className="text-slate-900">NMS Service Number</strong> or <strong className="text-slate-900">Email Address</strong> to access the site and sign into your member dashboard.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className={labelClasses}>
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      disabled={loading}
                      autoComplete="new-password"
                      className={inputClasses}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={labelClasses}>
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      disabled={loading}
                      autoComplete="new-password"
                      className={inputClasses}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Re-enter same password to confirm</p>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading || !form.nmsNo.trim() || !form.name.trim()}
                  className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying with Official Roster...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-3">
                  By registering, you confirm that your details are accurate and agree to the platform's governance terms.
                </p>
              </div>
            </form>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 NMS Class of 2008 Digital Governance & Electoral Commission</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600">
            <Link href="/" className="hover:text-emerald-700 transition-colors font-medium">
              Home
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-emerald-700 transition-colors font-medium">
              Member Sign In
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-emerald-700 transition-colors font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
