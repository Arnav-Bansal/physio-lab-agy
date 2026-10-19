import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CalendarCheck,
  FileText,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';

export function PublicFooter() {
  return (
    <footer className="bg-[#141E1E] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="light" />
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Ludhiana&apos;s dedicated 3-story architectural centre for Evidence-Based
              Physiotherapy, Post-Surgical Rehabilitation, Desmotec Isokinetic Sports Recovery, and
              Lifestyle Medicine.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-medium text-white/90">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>5.0 ★ Google Verified Clinical Rating</span>
            </div>
          </div>

          {/* 4 Clinical Pillars */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
              4 Clinical Pillars
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <a href="#pillars" className="hover:text-white transition-colors">
                  01. Research &amp; Neuro Rehabilitation
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-white transition-colors">
                  02. Orthopedic &amp; Spine Physiotherapy
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-white transition-colors">
                  03. Sports Injury Centre (Desmotec Lab)
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-white transition-colors">
                  04. Lifestyle &amp; Ergonomics Clinic
                </a>
              </li>
            </ul>
          </div>

          {/* Patient Digital Services */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
              Digital Portal
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link
                  href="/login?next=/portal/book"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <CalendarCheck className="h-3.5 w-3.5 text-[#2DD4BF]" />
                  <span>Self-Book Slot</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  WhatsApp OTP Login
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/prescriptions"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#2DD4BF]" />
                  <span>Rx &amp; Exercise Vault</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/crm"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2DD4BF] hover:underline"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Staff &amp; Doctor CRM</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="lg:col-span-3 space-y-3 text-sm text-white/75">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
              Flagship Centre
            </h3>
            <p className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#2DD4BF] shrink-0 mt-0.5" />
              <span>Barewal Awana, Ludhiana, Punjab — 141012</span>
            </p>
            <p className="flex items-center gap-2.5 font-mono text-xs sm:text-sm">
              <Phone className="h-4 w-4 text-[#2DD4BF] shrink-0" />
              <span>
                <a href="tel:+919316196000" className="text-white hover:text-[#2DD4BF] font-medium">
                  +91 93161-96000
                </a>
                <span className="text-white/30 mx-1.5">/</span>
                <a href="tel:+919815370607" className="text-white hover:text-[#2DD4BF] font-medium">
                  +91 98153-70607
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-[#2DD4BF] shrink-0" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} The Physio Lab — Research &amp; Rehabilitation. All rights reserved.</p>
          <p>Designed around measurable patient recovery • Barewal Awana, Ludhiana</p>
        </div>
      </div>
    </footer>
  );
}
