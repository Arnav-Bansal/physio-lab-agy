import React from 'react';
import Link from 'next/link';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  HeartPulse,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { repositories } from '@/lib/repositories';
import { getPatientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const CLINICAL_PILLARS = [
  {
    title: 'Research & Rehabilitation',
    subtitle: 'Evidence-Based Neuro & Post-Surgical Recovery',
    description:
      'Quantitative rehabilitation protocols for post-operative joint replacements, ligament reconstructions, and neuromuscular restoration.',
    highlights: [
      'Strength & symmetry tracking',
      'Post-op knee, hip & shoulder protocols',
      'Neurological gait & balance retraining',
    ],
    icon: Activity,
  },
  {
    title: 'Physiotherapy',
    subtitle: 'Orthopedic, Spine & Pain Management',
    description:
      'Hands-on manual therapy, spinal decompression, and targeted electro-physical modalities to resolve acute and chronic pain.',
    highlights: [
      'Cervical & lumbar disc rehabilitation',
      'Manual therapy, dry needling & cupping',
      'Frozen shoulder & sciatica relief',
    ],
    icon: Stethoscope,
  },
  {
    title: 'Sports Injury Centre',
    subtitle: 'Desmotec Isokinetic & Eccentric Training Lab',
    description:
      'Sports biomechanics hub featuring Desmotec V.Line eccentric flywheel technology for tendon remodeling and return-to-play.',
    highlights: [
      'Desmotec eccentric overload rehab station',
      'ACL, meniscus & rotator cuff recovery',
      'Biomechanical return-to-sport screening',
    ],
    icon: Dumbbell,
  },
  {
    title: 'Lifestyle Clinic',
    subtitle: 'Posture, Ergonomics & Preventive Mobility',
    description:
      'Movement medicine addressing desk-job posture syndromes, ergonomic alignment, and sustainable long-term joint health.',
    highlights: [
      'Postural & spinal alignment correction',
      'Corporate ergonomics & neck/back care',
      'Customized home rehab & mobility plans',
    ],
    icon: HeartPulse,
  },
];

const FACILITY_GALLERY = [
  {
    src: '/images/clinic/clinic_photo_3.jpg',
    tag: 'Reception Lounge',
    title: 'Minimalist Clinical Welcome Area',
    caption: 'Calm reception entrance with custom 3D branding and consultation suites.',
  },
  {
    src: '/images/clinic/clinic_photo_4.jpg',
    tag: 'Rehab Gym Floor',
    title: 'Desmotec Eccentric Lab & Glass Suites',
    caption: 'Equipped with Desmotec eccentric training systems and private frosted-glass therapy rooms.',
  },
  {
    src: '/images/clinic/clinic_photo_1.jpg',
    tag: 'Main Entrance',
    title: 'Dedicated 4-Pillar Clinical Centre',
    caption: 'Ground-level access in Barewal Awana, Ludhiana.',
  },
  {
    src: '/images/clinic/clinic_photo_2.jpg',
    tag: 'Building Exterior',
    title: '3-Story Purpose-Built Facility',
    caption: 'Three dedicated floors of specialized physiotherapy and rehabilitation care.',
  },
];

export default async function ShowcaseLandingPage() {
  const [patientSession, physios, clinics] = await Promise.all([
    getPatientSession(),
    repositories.profiles.listActivePhysios().catch(() => []),
    repositories.clinics.listActiveClinics().catch(() => []),
  ]);

  const flagshipClinic = clinics[0];
  const bookingHref = patientSession ? '/portal/book' : '/login?next=/portal/book';
  const portalHref = patientSession ? '/portal' : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0 ★ Rated Centre • Barewal Awana, Ludhiana</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                  Evidence-Based{' '}
                  <span className="text-primary">Physiotherapy &amp; Rehabilitation</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Ludhiana&apos;s dedicated centre for Research &amp; Rehabilitation, Clinical
                  Physiotherapy, Sports Injury Care, and Lifestyle Medicine. Book appointments
                  online, receive automated WhatsApp reminders, and access your prescriptions in one
                  place.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span>Book Appointment</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={portalHref}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>{patientSession ? 'Open Patient Portal' : 'Patient Portal Login'}</span>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-primary">5.0 ★</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Google Verified Rating</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">4 Pillars</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Specialized Care Wings</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">24h &amp; 2h</div>
                    <p className="text-xs text-muted-foreground mt-0.5">WhatsApp Reminders</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                  <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
                    <img
                      src="/images/clinic/clinic_photo_3.jpg"
                      alt="The Physio Lab Reception"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-muted">
                      <img
                        src="/images/clinic/clinic_photo_4.jpg"
                        alt="Desmotec Rehab Floor"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-muted">
                      <img
                        src="/images/clinic/clinic_photo_1.jpg"
                        alt="The Physio Lab Exterior"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Clinical Pillars */}
        <section id="pillars" className="py-16 lg:py-20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">
                  Our 4 Clinical Pillars
                </h2>
                <p className="text-muted-foreground mt-1">
                  Specialized departments designed around measurable patient recovery
                </p>
              </div>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <span>Schedule a consultation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CLINICAL_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">{pillar.title}</h3>
                        <p className="text-sm text-primary font-medium mt-0.5">{pillar.subtitle}</p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-border">
                      {pillar.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Facility Photo Tour */}
        <section id="facility" className="py-16 lg:py-20 border-b border-border bg-sidebar/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary">
                Inside The Physio Lab
              </h2>
              <p className="text-muted-foreground mt-1">
                Explore our Barewal Awana facility and Desmotec eccentric rehabilitation floor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FACILITY_GALLERY.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-1">
                    <div className="text-xs font-medium text-primary">{item.tag}</div>
                    <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialists & Digital Patient Portal */}
        <section id="specialists" className="py-16 lg:py-20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">
                  Clinical Specialists
                </h2>
                <p className="text-muted-foreground mt-1">
                  Book directly with our physiotherapists or allow reception to assign your specialist
                </p>
              </div>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Check Live Slot Availability</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {physios.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-md bg-secondary text-primary flex items-center justify-center font-semibold text-sm">
                      {doc.full_name
                        .replace('Dr. ', '')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <h3 className="font-semibold text-base tracking-tight">{doc.full_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {doc.specialization || 'Consultant Physiotherapist'}
                    </p>
                  </div>

                  <Link
                    href={`${bookingHref}${bookingHref.includes('?') ? '&' : '?'}physio=${doc.id}`}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Book with {doc.full_name.split(' ')[1] || 'Doctor'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location & Patient Portal CTA */}
        <section id="location" className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold leading-none tracking-tight text-primary">
                    {flagshipClinic?.name || 'The Physio Lab — Barewal Awana'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Visit our centre or call reception to book your assessment
                  </p>
                </div>

                <div className="space-y-3 text-sm pt-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span>
                      {flagshipClinic?.address || 'Barewal Awana, Ludhiana, Punjab — 141012'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      <a href="tel:+919316196000" className="font-medium hover:text-primary">
                        +91 93161-96000
                      </a>{' '}
                      /{' '}
                      <a href="tel:+919815370607" className="font-medium hover:text-primary">
                        +91 98153-70607
                      </a>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">
                      Monday – Saturday: 9:00 AM – 8:00 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold leading-none tracking-tight text-primary">
                    Patient Web Portal
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Sign in with WhatsApp OTP to manage your appointments and prescriptions
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="border rounded-md p-3 space-y-1">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">Self-Booking</div>
                    <p className="text-xs text-muted-foreground">Real-time available slots</p>
                  </div>
                  <div className="border rounded-md p-3 space-y-1">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">WhatsApp Alerts</div>
                    <p className="text-xs text-muted-foreground">24h &amp; 2h reminders</p>
                  </div>
                  <div className="border rounded-md p-3 space-y-1">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">Prescriptions</div>
                    <p className="text-xs text-muted-foreground">PDF &amp; Image downloads</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={portalHref}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Open Patient Portal
                  </Link>
                  <Link
                    href="/crm"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Staff &amp; Doctor CRM
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
