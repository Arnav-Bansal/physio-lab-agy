import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';

export function PublicFooter() {
  return (
    <footer className="bg-[#141413] text-[#F5F2EB] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <BrandLogo variant="light" />
            <p className="text-sm text-white/70 leading-relaxed">
              Ludhiana&apos;s premier 3-story evidence-based Physiotherapy, Sports Injury
              Rehabilitation, and Lifestyle Clinic equipped with advanced biomechanical and
              Desmotec eccentric training systems.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#5EEAD4] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              5.0 ★ Rated on Google Reviews
            </div>
          </div>

          {/* Column 2: 4 Clinical Pillars */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4] mb-4">
              Our 4 Clinical Pillars
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>• Research &amp; Rehabilitation</li>
              <li>• Clinical Physiotherapy &amp; Spine Care</li>
              <li>• Sports Injury Centre (Desmotec Lab)</li>
              <li>• Lifestyle &amp; Ergonomics Clinic</li>
              <li>• Post-Operative Ortho &amp; Neuro Recovery</li>
            </ul>
          </div>

          {/* Column 3: Patient Digital Services */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4] mb-4">
              Patient Portal &amp; CRM
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login?next=/portal/book"
                  className="text-white/80 hover:text-white inline-flex items-center gap-1"
                >
                  Self-Service Slot Booking <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white inline-flex items-center gap-1"
                >
                  WhatsApp OTP Patient Login <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/prescriptions"
                  className="text-white/80 hover:text-white inline-flex items-center gap-1"
                >
                  Download PDF &amp; Image Prescriptions <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/crm"
                  className="text-[#5EEAD4] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Unified Staff / Physio / Admin CRM <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Flagship Centre Contact */}
          <div className="space-y-3 text-sm text-white/80">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4] mb-4">
              Flagship Centre
            </h3>
            <p className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#5EEAD4] shrink-0 mt-1" />
              <span>The Physio Lab, Barewal Awana, Ludhiana, Punjab — 141012</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#5EEAD4] shrink-0" />
              <span>
                <a href="tel:+919316196000" className="hover:text-white font-semibold">
                  +91 93161-96000
                </a>{' '}
                /{' '}
                <a href="tel:+919815370607" className="hover:text-white font-semibold">
                  +91 98153-70607
                </a>
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-[#5EEAD4] shrink-0 mt-0.5" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM (IST)</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} The Physio Lab — Research &amp; Rehabilitation. All rights reserved.</p>
          <p>Powered by Cloud Clinical Scheduling &amp; Automated WhatsApp Care</p>
        </div>
      </div>
    </footer>
  );
}
