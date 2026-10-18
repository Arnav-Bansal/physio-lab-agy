import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  HeartPulse,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { BrandEmblem } from '@/components/brand/logo';
import { repositories } from '@/lib/repositories';
import { getPatientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const CLINICAL_PILLARS = [
  {
    number: '01',
    title: 'Research & Rehabilitation',
    subtitle: 'Evidence-Based Neuro & Post-Surgical Recovery',
    description:
      'Data-driven rehabilitation protocols for post-operative joint replacements, ligament reconstructions, stroke recovery, and complex neuromuscular restoration.',
    highlights: [
      'Quantitative strength & symmetry tracking',
      'Post-op knee, hip & shoulder protocols',
      'Neurological gait & balance retraining',
    ],
    icon: Activity,
    accent: 'from-[#00858E] to-[#006D75]',
  },
  {
    number: '02',
    title: 'Physiotherapy',
    subtitle: 'Orthopedic, Spine & Pain Management',
    description:
      'Hands-on manual therapy, spinal decompression, myofascial release, and targeted electro-physical modalities to resolve acute and chronic musculoskeletal pain.',
    highlights: [
      'Cervical & lumbar disc rehabilitation',
      'Manual therapy, dry needling & cupping',
      'Frozen shoulder & sciatica relief',
    ],
    icon: Stethoscope,
    accent: 'from-[#0D9488] to-[#0F766E]',
  },
  {
    number: '03',
    title: 'Sports Injury Centre',
    subtitle: 'Desmotec Isokinetic & Eccentric Training Lab',
    description:
      'Ludhiana’s dedicated sports biomechanics hub featuring Desmotec V.Line eccentric flywheel technology for accelerated tendon remodeling and athletic return-to-play.',
    highlights: [
      'Desmotec eccentric overload rehab station',
      'ACL, meniscus & rotator cuff recovery',
      'Biomechanical return-to-sport screening',
    ],
    icon: Dumbbell,
    accent: 'from-[#009CA6] to-[#00858E]',
  },
  {
    number: '04',
    title: 'Lifestyle Clinic',
    subtitle: 'Posture, Ergonomics & Preventive Mobility',
    description:
      'Proactive movement medicine addressing desk-job posture syndromes, metabolic health, geriatric fall prevention, and sustainable long-term joint longevity.',
    highlights: [
      '3D postural & spinal alignment correction',
      'Corporate ergonomics & neck/back care',
      'Customized home rehab & mobility plans',
    ],
    icon: HeartPulse,
    accent: 'from-[#0F766E] to-[#115E59]',
  },
];

const FACILITY_GALLERY = [
  {
    src: '/images/clinic/clinic_photo_3.jpg',
    tag: 'Reception & Welcome Lounge',
    title: 'Warm Architectural Linen & Stone Sanctuary',
    caption:
      'Designed to feel calm and restorative from the moment you step through our frosted glass entrance.',
  },
  {
    src: '/images/clinic/clinic_photo_4.jpg',
    tag: 'Sports Injury & Rehab Floor',
    title: 'Desmotec Eccentric Station & Glass Therapy Suites',
    caption:
      'Equipped with Desmotec V.Line eccentric flywheel technology, treadmill gait analysis, and private frosted-glass consultation suites.',
  },
  {
    src: '/images/clinic/clinic_photo_1.jpg',
    tag: 'Barewal Awana Flagship Entrance',
    title: 'Dedicated 4-Pillar Clinical Centre',
    caption:
      'Accessible ground-level entrance with dedicated wings for Research & Rehab, Physiotherapy, Sports Injury, and Lifestyle Care.',
  },
  {
    src: '/images/clinic/clinic_photo_2.jpg',
    tag: '3-Story Purpose-Built Facility',
    title: 'The Physio Lab — Barewal Awana, Ludhiana',
    caption:
      'Three expansive floors of natural light, modern glass walkways, and specialized rehabilitation zones.',
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
    <div className="min-h-screen flex flex-col bg-stone-linen">
      <PublicHeader />

      <main className="flex-1">
        {/* ================================================================
            HERO SECTION — ARCHITECTURAL CLINIC SHOWCASE
        ================================================================ */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#D6CFC2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Brand Value Proposition & Direct Portal CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#00858E]/25 shadow-sm">
                  <BrandEmblem className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#00858E]">
                    The Physio Lab • Research &amp; Rehabilitation
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-[#141413] leading-[1.08]">
                  Evidence-Based{' '}
                  <span className="text-[#00858E] underline decoration-[#009CA6]/30 decoration-4 underline-offset-8">
                    Physiotherapy
                  </span>{' '}
                  &amp; Sports Rehabilitation.
                </h1>

                <p className="text-base sm:text-lg text-[#141413]/75 leading-relaxed max-w-2xl">
                  Welcome to Ludhiana&apos;s flagship 3-story centre for{' '}
                  <strong className="text-[#141413] font-semibold">
                    Research &amp; Rehabilitation, Clinical Physiotherapy, Sports Injury Care,
                  </strong>{' '}
                  and <strong className="text-[#141413] font-semibold">Lifestyle Medicine</strong>.
                  Book your slot online in 30 seconds, receive automated WhatsApp reminders, and
                  access all your digital prescriptions in one place.
                </p>

                {/* Primary Conversion Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-bold bg-[#00858E] hover:bg-[#006D75] text-white shadow-lg shadow-[#00858E]/25 transition-all"
                  >
                    <CalendarCheck className="h-5 w-5" />
                    <span>Book Appointment Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={portalHref}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold bg-white hover:bg-[#DCE8E6]/60 text-[#141413] border-2 border-[#00858E]/30 transition-all"
                  >
                    <MessageSquare className="h-5 w-5 text-[#00858E]" />
                    <span>
                      {patientSession ? 'Open My Patient Portal' : 'Patient Login via WhatsApp OTP'}
                    </span>
                  </Link>
                </div>

                {/* Trust Metrics Bar */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D6CFC2]">
                  <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#D6CFC2]/80">
                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-lg sm:text-xl">
                      <span>5.0</span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-xs font-medium text-[#141413]/70 mt-0.5">
                      Google Verified Rating
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#D6CFC2]/80">
                    <div className="text-lg sm:text-xl font-extrabold text-[#00858E]">
                      4 Divisions
                    </div>
                    <p className="text-xs font-medium text-[#141413]/70 mt-0.5">
                      Specialized Rehab Wings
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#D6CFC2]/80">
                    <div className="text-lg sm:text-xl font-extrabold text-[#141413]">
                      100% Digital
                    </div>
                    <p className="text-xs font-medium text-[#141413]/70 mt-0.5">
                      WhatsApp Alerts &amp; Records
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Clinic Architectural Photo Collage */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-[#E8E2D7]">
                  <img
                    src="/images/clinic/clinic_photo_3.jpg"
                    alt="The Physio Lab Reception Wall & Entrance"
                    className="w-full h-[380px] sm:h-[440px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-[#00858E] px-3 py-1 rounded-full mb-2">
                      Barewal Awana, Ludhiana
                    </span>
                    <p className="text-lg font-bold leading-snug">
                      The Physio Lab — Research &amp; Rehabilitation
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Call Direct: +91 93161-96000 • +91 98153-70607
                    </p>
                  </div>
                </div>

                {/* Floating Secondary Equipment Preview Card */}
                <div className="hidden sm:flex items-center gap-3.5 absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-[#D6CFC2] max-w-xs">
                  <img
                    src="/images/clinic/clinic_photo_4.jpg"
                    alt="Desmotec Rehab Floor"
                    className="h-16 w-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00858E]">
                      Sports Injury Lab
                    </span>
                    <p className="text-xs font-bold text-[#141413] leading-tight mt-0.5">
                      Desmotec Eccentric &amp; Kinetic Rehab Floor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: THE 4 CORE CLINICAL PILLARS (FROM SIGNBOARD)
        ================================================================ */}
        <section id="pillars" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
                Specialized Departments
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] mt-2">
                Our 4 Clinical Pillars of Recovery
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#141413]/70 max-w-md">
              Every patient at The Physio Lab receives an individualized treatment plan across our
              four integrated clinical divisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {CLINICAL_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="group relative bg-white rounded-3xl p-7 sm:p-8 border border-[#D6CFC2] shadow-sm hover:shadow-xl hover:border-[#00858E]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${pillar.accent} text-white flex items-center justify-center shadow-md`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-3xl font-black text-[#E8E2D7] group-hover:text-[#00858E]/25 transition-colors">
                        {pillar.number}
                      </span>
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-[#00858E]">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#141413] mt-1">{pillar.title}</h3>
                    <p className="text-sm text-[#141413]/75 leading-relaxed mt-3">
                      {pillar.description}
                    </p>

                    <ul className="mt-5 space-y-2 border-t border-[#F5F2EB] pt-4">
                      {pillar.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#141413]/85"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#00858E] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E8E2D7] flex items-center justify-between">
                    <Link
                      href={bookingHref}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00858E] hover:text-[#006D75]"
                    >
                      <span>Book {pillar.title} Slot</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            SECTION 3: REAL CLINIC ARCHITECTURAL TOUR (ALL 4 PHOTOS)
        ================================================================ */}
        <section
          id="facility"
          className="py-16 lg:py-24 bg-[#E8E2D7]/60 border-y border-[#D6CFC2]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
                  Inside The Physio Lab • Barewal Awana
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] mt-2">
                  Purpose-Built for Clinical Excellence
                </h2>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#D6CFC2]">
                <img
                  src="/images/clinic/logo-wall-crop.jpg"
                  alt="The Physio Lab Wall Logo"
                  className="h-10 w-20 object-cover rounded-lg border border-[#D6CFC2]"
                />
                <div className="text-xs">
                  <p className="font-bold text-[#141413]">Authentic Clinic Tour</p>
                  <p className="text-[#141413]/65">Barewal Awana, Ludhiana</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {FACILITY_GALLERY.map((photo) => (
                <div
                  key={photo.src}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#D6CFC2] shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-[#141413]">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider bg-[#141413]/80 backdrop-blur-md text-white px-3 py-1 rounded-full">
                      {photo.tag}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-extrabold text-[#141413]">{photo.title}</h3>
                    <p className="text-sm text-[#141413]/70 mt-1.5 leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: SPECIALIST PHYSIOTHERAPISTS (LIVE SUPABASE PROFILES)
        ================================================================ */}
        <section id="specialists" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
                Clinical Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] mt-2">
                Meet Our Rehabilitation Specialists
              </h2>
            </div>
            <Link
              href={bookingHref}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#00858E] hover:underline"
            >
              <span>Check Real-Time Doctor Slot Availability</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {physios.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border border-[#D6CFC2] shadow-sm flex flex-col justify-between hover:border-[#00858E] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
                      style={{ backgroundColor: doc.calendar_color || '#00858E' }}
                    >
                      {doc.full_name
                        .replace('Dr. ', '')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#DCE8E6] text-[#006D75]">
                      Available Today
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#141413]">{doc.full_name}</h3>
                  <p className="text-xs font-bold text-[#00858E] mt-1">{doc.specialization}</p>
                  <p className="text-xs text-[#141413]/70 mt-3 leading-relaxed">
                    {doc.bio ||
                      'Specialist physiotherapist at The Physio Lab — Barewal Awana, Ludhiana.'}
                  </p>
                </div>

                <Link
                  href={`${bookingHref}${bookingHref.includes('?') ? '&' : '?'}physioId=${doc.id}`}
                  className="mt-6 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#F5F2EB] hover:bg-[#00858E] text-[#141413] hover:text-white transition-colors"
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>Book with {doc.full_name.split(',')[0]}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 5: SEAMLESS PATIENT PORTAL & WHATSAPP LIFECYCLE BANNER
        ================================================================ */}
        <section className="py-16 bg-[#00858E] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/15 px-3.5 py-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  Connected Patient Portal Experience
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  Your Entire Recovery Journey — Right on WhatsApp &amp; Web.
                </h2>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-2xl">
                  No passwords to remember. Log in with a 6-digit WhatsApp OTP to view upcoming
                  sessions, browse your clinical consultation notes, and download PDF or image
                  exercise prescriptions anytime.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                    <MessageSquare className="h-5 w-5 text-amber-300 mb-2" />
                    <p className="font-bold text-sm">Instant WhatsApp Alerts</p>
                    <p className="text-xs text-white/75 mt-1">
                      Automatic booking confirmations plus 24-hour &amp; 2-hour session reminders.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                    <FileText className="h-5 w-5 text-amber-300 mb-2" />
                    <p className="font-bold text-sm">Prescription Vault</p>
                    <p className="text-xs text-white/75 mt-1">
                      Download PDF protocols &amp; rehab exercise charts directly to your phone.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                    <Award className="h-5 w-5 text-amber-300 mb-2" />
                    <p className="font-bold text-sm">Zero Double-Booking</p>
                    <p className="text-xs text-white/75 mt-1">
                      Real-time slot synchronization across reception desk and online portal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white text-[#141413] rounded-3xl p-7 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00858E]">
                      Quick Access
                    </span>
                    <h3 className="text-xl font-extrabold">Patient &amp; Clinic Portal</h3>
                  </div>
                  <BrandEmblem className="h-10 w-10" />
                </div>

                <div className="space-y-3 text-sm">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[#00858E] hover:bg-[#006D75] text-white font-bold transition-all shadow-md"
                  >
                    <span className="flex items-center gap-2.5">
                      <UserCheck className="h-5 w-5" />
                      <span>Login to Patient Portal (WhatsApp OTP)</span>
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/portal/book"
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[#F5F2EB] hover:bg-[#DCE8E6] text-[#141413] font-bold border border-[#D6CFC2] transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <CalendarCheck className="h-5 w-5 text-[#00858E]" />
                      <span>Book a New Physiotherapy Slot</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#00858E]" />
                  </Link>

                  <Link
                    href="/crm"
                    className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F5F2EB] text-[#141413]/80 font-semibold border border-[#D6CFC2] transition-all text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#00858E]" />
                      <span>Staff, Doctor (Physio) &amp; Admin CRM Dashboard</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="bg-[#F5F2EB] rounded-xl p-3.5 text-xs text-[#141413]/75">
                  <strong className="text-[#141413]">Instant Demo Tip:</strong> Use phone{' '}
                  <code className="font-mono font-bold text-[#00858E]">+91 98765-43210</code> with
                  sandbox OTP <code className="font-mono font-bold text-[#00858E]">123456</code> to
                  explore pre-loaded appointments, clinical notes, and downloadable prescriptions.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: FLAGSHIP LOCATION & CONTACT (BAREWAL AWANA, LUDHIANA)
        ================================================================ */}
        <section id="location" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#D6CFC2] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
                  Visit Our Flagship Centre
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141413]">
                  {flagshipClinic?.name || 'The Physio Lab — Research & Rehabilitation (Barewal Awana)'}
                </h2>
                <p className="text-sm text-[#141413]/70">
                  Conveniently located in Barewal Awana, Ludhiana with dedicated patient parking,
                  wheelchair-accessible ground-floor entry, and modern rehabilitation suites.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
                      Clinic Address
                    </p>
                    <p className="text-sm font-bold text-[#141413] mt-0.5">
                      Barewal Awana, Ludhiana, Punjab — 141012
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
                      Reception Desk &amp; Booking
                    </p>
                    <p className="text-sm font-bold text-[#141413] mt-0.5">
                      <a href="tel:+919316196000" className="hover:text-[#00858E]">
                        +91 93161-96000
                      </a>
                      <br />
                      <a href="tel:+919815370607" className="hover:text-[#00858E]">
                        +91 98153-70607
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
                      Operating Hours
                    </p>
                    <p className="text-sm font-bold text-[#141413] mt-0.5">
                      Mon – Sat: 9:00 AM – 8:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#DCE8E6] text-[#00858E] flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
                      Patient Satisfaction
                    </p>
                    <p className="text-sm font-bold text-[#141413] mt-0.5">
                      5.0 ★ Google Verified Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[280px] bg-[#141413]">
              <img
                src="/images/clinic/clinic_photo_1.jpg"
                alt="The Physio Lab Exterior Signboard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
