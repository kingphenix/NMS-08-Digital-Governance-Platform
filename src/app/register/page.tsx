'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Phone, Calendar, Briefcase, MapPin, Heart, Users, Droplets, Medal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import secondaryLogo from '@/assets/slogo@2x.png';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    // Personal Details
    name: '',
    dob: '',
    stateOfOrigin: '',
    stateOfResidence: '',
    address: '',
    maritalStatus: 'Single',
    
    // Military Background
    nmsNo: '',
    company: 'Alpha Company',
    rankAppointment: '',
    setAppointment: '',

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
    bloodGroup: '',
    genotype: '',

    // Next of Kin
    nextOfKin: '',
    relationship: '',
    nextOfKinPhone: '',

    // Security
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 transition-all";
  const labelClasses = "block font-bold text-slate-700 mb-1.5 flex items-center gap-2";
  const sectionHeaderClasses = "text-sm font-black text-emerald-800 uppercase tracking-widest pb-2 border-b-2 border-emerald-100 mb-6 mt-8 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-3xl space-y-8">
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
          <Badge variant="emerald" className="px-4 py-1">Ex-Boy Registration</Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            NMS 08 Digital Governance Platform
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Complete your profile registration for class verification and access to the digital alumni portal.
          </p>
        </div>

        <Card variant="glass" className="p-8 md:p-12 shadow-apple-lg border-white/40">
          <form onSubmit={handleRegister} className="space-y-8 text-xs">
            
            {/* Registration */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <ShieldCheck className="w-4 h-4" /> Registration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>NMS Service Number</label>
                  <input
                    type="text"
                    required
                    placeholder="NMS/08/xxxx"
                    value={form.nmsNo}
                    onChange={(e) => setForm({ ...form, nmsNo: e.target.value })}
                    className={`${inputClasses} font-bold text-emerald-700 uppercase`}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Military Company</label>
                  <select
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={inputClasses}
                  >
                    {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Gulf'].map(c => (
                      <option key={c} value={`${c} Company`}>{c} Company</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Rank/Appointment as Boy Soldier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B/Sgt, Company Senior"
                    value={form.rankAppointment}
                    onChange={(e) => setForm({ ...form, rankAppointment: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Set Appointment</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant Set PRO"
                    value={form.setAppointment}
                    onChange={(e) => setForm({ ...form, setAppointment: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
            </section>

            {/* Personal Details */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <User className="w-4 h-4" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Full Name (Ex-Boy)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Filani Victor"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Marital Status</label>
                  <select
                    value={form.maritalStatus}
                    onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>State of Origin</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos"
                    value={form.stateOfOrigin}
                    onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>State of Residence</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abuja FCT"
                    value={form.stateOfResidence}
                    onChange={(e) => setForm({ ...form, stateOfResidence: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Residential Address (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Full street address..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={`${inputClasses} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <Mail className="w-4 h-4" /> Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
            </section>

            {/* Professional Details */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <Briefcase className="w-4 h-4" /> Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Occupation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Industry</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information Technology"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Business Name / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trinity Vote Ltd"
                    value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Skills</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Strategic Planning, Leadership, Python"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Professional Qualifications</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="List your degrees, certifications, etc."
                    value={form.professionalQualifications}
                    onChange={(e) => setForm({ ...form, professionalQualifications: e.target.value })}
                    className={`${inputClasses} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <Droplets className="w-4 h-4" /> Medical Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Blood Group (Optional)</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Genotype (Optional)</label>
                  <select
                    value={form.genotype}
                    onChange={(e) => setForm({ ...form, genotype: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="">Select Genotype</option>
                    {['AA', 'AS', 'AC', 'SS', 'SC'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Next of Kin */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <Heart className="w-4 h-4" /> Next of Kin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Next of Kin Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={form.nextOfKin}
                    onChange={(e) => setForm({ ...form, nextOfKin: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Relationship</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse, Brother"
                    value={form.relationship}
                    onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Next of Kin Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={form.nextOfKinPhone}
                    onChange={(e) => setForm({ ...form, nextOfKinPhone: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className={sectionHeaderClasses}>
                <Lock className="w-4 h-4" /> Security
              </h2>
              <div>
                <label className={labelClasses}>Create Portal Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </section>

            <div className="pt-6">
              <Button
                type="submit"
                variant="emerald"
                className="w-full justify-center text-sm py-4 rounded-2xl shadow-apple-glow"
                disabled={loading}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {loading ? 'Processing Registration...' : 'Submit Profile for Executive Verification'}
              </Button>
            </div>
          </form>

          <div className="text-center pt-8 mt-8 border-t border-slate-100 text-xs text-slate-500">
            Already have a verified account?{' '}
            <Link href="/login" className="text-emerald-700 font-black hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </Card>
        
        <div className="text-center text-[10px] text-slate-400 font-medium">
          Official NMS 08 Digital Governance Platform • Secure Data Encryption Enabled
        </div>
      </div>
    </div>
  );
}
