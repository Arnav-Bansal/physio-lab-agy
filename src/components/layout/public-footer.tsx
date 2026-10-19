import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';
import { BrandLogo } from '@/components/brand/logo';

export function PublicFooter() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Evidence-based Physiotherapy, Sports Injury Rehabilitation, and Lifestyle Clinic in
              Barewal Awana, Ludhiana.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground">Clinical Pillars</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Research &amp; Rehabilitation</li>
              <li>Physiotherapy &amp; Spine Care</li>
              <li>Sports Injury Centre (Desmotec Lab)</li>
              <li>Lifestyle &amp; Ergonomics Clinic</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login?next=/portal/book" className="hover:text-primary">
                  Book Appointment Online
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">
                  Patient Portal (WhatsApp OTP)
                </Link>
              </li>
              <li>
                <Link href="/portal/prescriptions" className="hover:text-primary">
                  Download Prescriptions
                </Link>
              </li>
              <li>
                <Link href="/crm" className="text-primary font-medium hover:underline">
                  Staff &amp; Doctor CRM
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <h3 className="text-sm font-semibold text-foreground">Contact &amp; Hours</h3>
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Barewal Awana, Ludhiana, Punjab — 141012</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>
                <a href="tel:+919316196000" className="hover:text-primary font-medium">
                  +91 93161-96000
                </a>{' '}
                /{' '}
                <a href="tel:+919815370607" className="hover:text-primary font-medium">
                  +91 98153-70607
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} The Physio Lab — Research &amp; Rehabilitation.</p>
          <p>5.0 ★ Rated Physiotherapy &amp; Rehabilitation Centre in Ludhiana</p>
        </div>
      </div>
    </footer>
  );
}
