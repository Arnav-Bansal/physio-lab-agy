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
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  HeroQuickBookBar,
  InteractiveSymptomExplorer,
  ClinicFaqAccordion,
} from '@/components/public/interactive-clinic-showcase';
import { repositories } from '@/lib/repositories';
import { getPatientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const CLINICAL_PILLARS = [
  {
    number: '01',
    title: 'Research & Rehabilitation',
    subtitle: 'Evidence-Based Neuro & Post-Surgical Recovery',
    duration: '45–60 Min Protocol',
    description:
      'Quantitative rehabilitation protocols for post-operative joint replacements, ligament reconstructions, and neuromuscular restoration.',
    highlights: [
      'Bilateral strength & limb symmetry tracking',
      'Post-op knee (TKR), hip & shoulder protocols',
      'Neurological gait, proprioception & balance retraining',
    ],
    icon: Activity,
  },
  {
    number: '02',
    title: 'Physiotherapy',
    subtitle: 'Orthopedic, Spine & Pain Management',
    duration: '30–45 Min Protocol',
    description:
      'Hands-on manual therapy, spinal decompression, and targeted electro-physical modalities to resolve acute and chronic musculoskeletal pain.',
    highlights: [
      'Cervical & lumbar disc bulge rehabilitation',
      'Manual therapy, dry needling & myofascial cupping',
      'Frozen shoulder, sciatica & joint stiffness relief',
    ],
    icon: Stethoscope,
  },
  {
    number: '03',
    title: 'Sports Injury Centre',
    subtitle: 'Desmotec Isokinetic & Eccentric Training Lab',
    duration: '45 Min Lab Session',
    description:
      'Dedicated sports biomechanics wing featuring Italian Desmotec V.Line eccentric flywheel technology for tendon remodeling and return-to-play.',
    highlights: [
      'Desmotec V.Line eccentric overload rehab station',
      'ACL, meniscus, Achilles & rotator cuff recovery',
      'Biomechanical return-to-sport force screening',
    ],
    icon: Dumbbell,
  },
  {
    number: '04',
    title: 'Lifestyle Clinic',
    subtitle: 'Posture, Ergonomics & Preventive Mobility',
    duration: '30 Min Assessment',
    description:
      'Proactive movement medicine addressing corporate desk-posture syndromes, spinal alignment, and sustainable long-term joint longevity.',
    highlights: [
      'Postural & thoracic spinal alignment correction',
      'Ergonomic conditioning & tech-neck relief',
      'Digital PDF & image home mobility charts',
    ],
    icon: HeartPulse,
  },
];

const RECOVERY_STEPS = [
  {
    step: 'Step 01',
    title: '1-on-1 Biomechanical & Clinical Assessment',
    desc: 'Your specialist conducts a comprehensive root-cause evaluation—testing joint range of motion, spinal mechanics, and bilateral muscle symmetry rather than just treating surface pain.',
  },
  {
    step: 'Step 02',
    title: 'Targeted Manual Therapy & Desmotec Eccentric Rehab',
    desc: 'Hands-on mobilization inside private frosted-glass suites paired with progressive load training on our Desmotec V.Line eccentric rehabilitation floor.',
  },
  {
    step: 'Step 03',
    title: 'Digital Prescription Sync & WhatsApp Lifecycle Care',
    desc: 'Your diagnosis, home exercise protocol, and PDF/image exercise charts are immediately published to your Patient Portal with automated 24h and 2h WhatsApp session reminders.',
  },
];

const PATIENT_STORIES = [
  {
    name: 'Karanवीर Gill',
    condition: 'ACL Reconstruction & Meniscus Rehab • Sports Injury Centre',
    quote:
      'After my ACL surgery, the Desmotec eccentric flywheel sessions with Dr. Arjun helped me rebuild quad symmetry twice as fast. Having my exercise charts right in the WhatsApp portal kept me consistent at home.',
    metric: 'Returned to competitive badminton in 5.5 months',
  },
  {
    name: 'Meenakshi Sharma',
    condition: 'L4-L5 Lumbar Disc Bulge & Sciatica • Spine Physiotherapy',
    quote:
      'I was advised spinal surgery for severe radiating leg pain. After 4 weeks of targeted spinal decompression and manual therapy at Barewal Awana, I am walking pain-free without medication.',
    metric: 'Pain score reduced from 8/10 to 1/10',
  },
  {
    name: 'Sardar Harjinder Singh',
    condition: 'Bilateral Total Knee Replacement • Research & Rehabilitation',
    quote:
      'The 3-story facility is spotless, calm, and feels like an international rehabilitation centre. Booking slots online and getting WhatsApp reminders 24 hours and 2 hours prior is effortless.',
    metric: '120° knee flexion & independent stair climbing',
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
        {/* ====================================================================
            1. ARCHITECTURAL HERO SECTION + LIVE QUICK-BOOK BAR
        ==================================================================== */}
        <section className="relative py-12 sm:py-16 lg:py-20 border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left 7 Cols: Editorial Headline + Quick-Book Bar */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0 ★ Rated Rehabilitation Centre • Barewal Awana, Ludhiana</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Precision Movement &amp;{' '}
                  <span className="text-primary">Evidence-Based Rehabilitation.</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  A purpose-built 3-story clinical sanctuary combining hands-on orthopedic
                  physiotherapy, Italian <strong>Desmotec V.Line</strong> eccentric sports science,
                  and a seamless WhatsApp-connected digital patient portal.
                </p>

                {/* Interactive Quick-Booking Bar right inside the Hero */}
                <div className="pt-1">
                  <HeroQuickBookBar
                    physios={physios}
                    isAuthenticated={Boolean(patientSession)}
                  />
                </div>

                {/* Key Trust Metrics Bar */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="bg-white/80 rounded-xl p-3.5 border border-border/80">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                      5.0 ★
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      Google Verified Clinic
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3.5 border border-border/80">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                      4 Wings
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      Specialized Rehab Floors
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3.5 border border-border/80">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                      24h &amp; 2h
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      Automated WhatsApp Care
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Architectural Bento Collage with Floating Clinical Badges */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl border border-border bg-white p-3.5 shadow-xl">
                  {/* Main Reception Wall Image */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                    <img
                      src="/images/clinic/clinic_photo_3.jpg"
                      alt="The Physio Lab Reception Feature Wall"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141E1E]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-2 text-white">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary px-2.5 py-0.5 rounded-full">
                          Barewal Awana Flagship
                        </span>
                        <p className="text-sm font-semibold mt-1">
                          Architectural Stone &amp; Frosted-Glass Suites
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Secondary 2-Photo Bento Strip */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-muted group">
                      <img
                        src="/images/clinic/clinic_photo_4.jpg"
                        alt="Desmotec V.Line Eccentric Rehabilitation Floor"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2.5 text-[11px] font-semibold text-white">
                        Desmotec V.Line Lab
                      </span>
                    </div>

                    <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-muted group">
                      <img
                        src="/images/clinic/clinic_photo_1.jpg"
                        alt="The Physio Lab 3-Story Facility Exterior"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2.5 text-[11px] font-semibold text-white">
                        3-Story Rehab Centre
                      </span>
                    </div>
                  </div>

                  {/* Bottom Floating Portal Strip */}
                  <div className="mt-3 p-3 rounded-xl bg-secondary/70 border border-primary/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Digital Prescriptions &amp; WhatsApp OTP Portal
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Access PDF &amp; Image exercise charts on your phone
                        </p>
                      </div>
                    </div>
                    <Link
                      href={portalHref}
                      className="text-xs font-bold text-primary hover:underline shrink-0"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. INTERACTIVE SYMPTOM & CONDITION TRIAGE EXPLORER (MYODETOX STYLE)
        ==================================================================== */}
        <section id="conditions" className="py-16 lg:py-24 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Interactive Clinical Triage
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
                  Where Do You Need Recovery?
                </h2>
                <p className="text-muted-foreground mt-1.5 max-w-2xl">
                  Select a body region or recovery goal to explore our specialized clinical
                  protocol, equipment, and recommended session length.
                </p>
              </div>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <span>Not sure? Book a general evaluation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <InteractiveSymptomExplorer bookingHref={bookingHref} />
          </div>
        </section>

        {/* ====================================================================
            3. THE 4 CLINICAL PILLARS (ARCHITECTURAL BENTO CARDS)
        ==================================================================== */}
        <section id="pillars" className="py-16 lg:py-24 border-b border-border bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Specialized Departments
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
                  Our 4 Clinical Pillars
                </h2>
                <p className="text-muted-foreground mt-1.5">
                  Four integrated wings under one roof in Barewal Awana, Ludhiana
                </p>
              </div>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors self-start md:self-auto"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Schedule Consultation</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CLINICAL_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="group rounded-2xl border border-border bg-white hover:border-primary/50 shadow-sm hover:shadow-lg transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary bg-secondary px-2.5 py-0.5 rounded-md">
                              PILLAR {pillar.number}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              • {pillar.duration}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold tracking-tight text-foreground pt-1">
                            {pillar.title}
                          </h3>
                          <p className="text-sm text-primary font-semibold">{pillar.subtitle}</p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pillar.description}
                      </p>

                      <ul className="space-y-2 pt-3 border-t border-border/80">
                        {pillar.highlights.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground/90">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border/60">
                      <span className="text-xs text-muted-foreground">
                        Barewal Awana Flagship
                      </span>
                      <Link
                        href={bookingHref}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Book {pillar.title}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. DESMOTEC LAB & ARCHITECTURAL FACILITY TOUR + 3-STEP METHODOLOGY
        ==================================================================== */}
        <section id="facility" className="py-16 lg:py-24 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {/* Top Header */}
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Inside The Physio Lab • Barewal Awana
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Built Like a Modern Biomechanics Sanctuary
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Every detail of our 3-story clinic—from warm travertine stone walls and private
                frosted-glass consultation suites to the Desmotec eccentric training floor—is
                engineered for calm, measurable recovery.
              </p>
            </div>

            {/* Asymmetric Architectural Photo Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Feature Large Card: Desmotec Rehab Gym Floor */}
              <div className="lg:col-span-7 rounded-2xl border border-border bg-white overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-muted">
                  <img
                    src="/images/clinic/clinic_photo_4.jpg"
                    alt="Desmotec Eccentric Lab & Frosted Glass Therapy Suites"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-[#141E1E]/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Rehabilitation Gym &amp; Desmotec V.Line Floor
                  </span>
                </div>
                <div className="p-6 sm:p-7 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sports Biomechanics &amp; Private Glass Suites</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Desmotec Eccentric Flywheel Station &amp; Glass Walkway
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Equipped with Italian Desmotec eccentric training systems for controlled tendon
                    remodeling, commercial gait treadmills, and acoustic frosted-glass manual
                    therapy suites.
                  </p>
                </div>
              </div>

              {/* Right 5 Cols: Stacked Reception & Exterior Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                  <div className="relative aspect-[16/9] bg-muted">
                    <img
                      src="/images/clinic/clinic_photo_3.jpg"
                      alt="Minimalist Clinical Reception Area"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#141E1E]/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      Reception Lounge
                    </span>
                  </div>
                  <div className="p-5 space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Calm Travertine Stone Welcome Lounge
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Zero hospital clutter—step into a serene reception space with instant WhatsApp
                      check-in.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                  <div className="relative aspect-[16/9] bg-muted">
                    <img
                      src="/images/clinic/clinic_photo_2.jpg"
                      alt="3-Story Purpose-Built Facility"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#141E1E]/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      3-Story Dedicated Building
                    </span>
                  </div>
                  <div className="p-5 space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Dedicated 3-Floor Facility in Barewal Awana
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Easy ground-floor access and dedicated floors for Ortho, Neuro, Sports, and
                      Lifestyle rehabilitation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Step Recovery Journey Strip */}
            <div className="bg-[#141E1E] text-white rounded-2xl p-6 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
                    Clinical Methodology
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-1">
                    How Your Recovery Journey Works
                  </h3>
                </div>
                <Link
                  href={bookingHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors self-start"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Start with Step 1 Assessment</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {RECOVERY_STEPS.map((item) => (
                  <div key={item.step} className="space-y-2.5">
                    <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider text-[#2DD4BF] bg-white/10 px-3 py-1 rounded-md">
                      {item.step}
                    </span>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. CLINICAL SPECIALISTS ROSTER
        ==================================================================== */}
        <section id="specialists" className="py-16 lg:py-24 border-b border-border bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Multidisciplinary Team
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
                  Meet Our Clinical Specialists
                </h2>
                <p className="text-muted-foreground mt-1">
                  Book directly with a specialist physiotherapist or select clinic triage for
                  reception assignment
                </p>
              </div>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors self-start md:self-auto"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Check Real-Time Slot Availability</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {physios.map((doc) => {
                const initials = doc.full_name
                  .replace('Dr. ', '')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);

                const directBookUrl = `${bookingHref}${
                  bookingHref.includes('?') ? '&' : '?'
                }physioId=${doc.id}`;

                return (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all p-6 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="h-12 w-12 rounded-xl text-white flex items-center justify-center font-bold text-base shadow-sm"
                          style={{ backgroundColor: doc.calendar_color || '#00858E' }}
                        >
                          {initials}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ● Accepting Patients
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                          {doc.specialization || 'Consultant Physiotherapist'}
                        </span>
                        <h3 className="font-bold text-lg tracking-tight text-foreground mt-0.5">
                          {doc.full_name}
                        </h3>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {doc.bio ||
                          'Specialist in evidence-based orthopedic rehabilitation, biomechanical movement screening, and tailored recovery protocols.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/70 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Barewal Awana</span>
                        <span className="font-mono font-semibold text-foreground">
                          30m / 45m / 60m
                        </span>
                      </div>

                      <Link
                        href={directBookUrl}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-primary text-secondary-foreground hover:text-white px-4 py-2.5 text-xs font-bold transition-colors"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Book with {doc.full_name.split(',')[0]}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. VERIFIED PATIENT RECOVERY STORIES & FAQ ACCORDION
        ==================================================================== */}
        <section id="stories" className="py-16 lg:py-24 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Patient Recovery Stories */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Patient Outcomes • 5.0 ★ Google Verified
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
                    Real Recovery Stories from Ludhiana
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-border px-4 py-2 text-xs font-semibold">
                  <Award className="h-4 w-4 text-primary" />
                  <span>100% Evidence-Based Protocols</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PATIENT_STORIES.map((story) => (
                  <div
                    key={story.name}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-border shadow-sm flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/85 leading-relaxed italic">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/70 space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{story.metric}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{story.name}</p>
                        <p className="text-xs text-primary font-medium">{story.condition}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Common Questions
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Everything You Need to Know Before Your Visit
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Have a specific question about your MRI report, post-op discharge summary, or
                  sports injury? Call our reception desk directly or book an initial assessment.
                </p>
                <div className="pt-2">
                  <a
                    href="tel:+919316196000"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Reception: +91 93161-96000</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ClinicFaqAccordion />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            7. LOCATION & DIGITAL PATIENT PORTAL SHOWCASE
        ==================================================================== */}
        <section id="location" className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 6 Cols: Flagship Clinic Location & Hours */}
              <div className="lg:col-span-6 rounded-2xl border border-border bg-white shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Visit Our Flagship Centre</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {flagshipClinic?.name || 'The Physio Lab — Barewal Awana'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    3-story purpose-built physiotherapy, Desmotec sports rehabilitation, and
                    lifestyle medicine centre in Ludhiana.
                  </p>

                  <div className="space-y-3.5 text-sm pt-2">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border border-border/70">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Clinic Address</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {flagshipClinic?.address || 'Barewal Awana, Ludhiana, Punjab — 141012'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border border-border/70">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Direct Reception Lines</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          <a href="tel:+919316196000" className="text-primary font-bold hover:underline">
                            +91 93161-96000
                          </a>{' '}
                          /{' '}
                          <a href="tel:+919815370607" className="text-primary font-bold hover:underline">
                            +91 98153-70607
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border border-border/70">
                      <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Operating Hours</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Monday – Saturday: 9:00 AM – 8:00 PM (IST)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span>Book In-Clinic Visit</span>
                  </Link>
                  <a
                    href="tel:+919316196000"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Call Reception</span>
                  </a>
                </div>
              </div>

              {/* Right 6 Cols: Digital Patient Portal & Staff CRM Hub */}
              <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-[#00858E] via-[#006D75] to-[#141E1E] text-white shadow-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full text-[#5EEAD4]">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Passwordless WhatsApp OTP Portal</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Your Recovery &amp; Prescriptions, Always on Your Phone
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Sign in with your WhatsApp number in 10 seconds—no passwords or app downloads
                    required. Manage appointments, view clinical notes, and download PDF or image
                    exercise charts anytime.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-1.5">
                      <CalendarCheck className="h-5 w-5 text-[#5EEAD4]" />
                      <div className="text-sm font-bold">Live Self-Booking</div>
                      <p className="text-xs text-white/70">
                        Real-time conflict-free slot selection
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-1.5">
                      <MessageSquare className="h-5 w-5 text-[#5EEAD4]" />
                      <div className="text-sm font-bold">WhatsApp Care</div>
                      <p className="text-xs text-white/70">
                        Instant confirmation + 24h &amp; 2h alerts
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-1.5">
                      <FileText className="h-5 w-5 text-[#5EEAD4]" />
                      <div className="text-sm font-bold">Digital Rx Vault</div>
                      <p className="text-xs text-white/70">
                        Inline PDF &amp; Image exercise charts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={portalHref}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#006D75] hover:bg-white/90 px-5 py-3 text-xs sm:text-sm font-bold shadow-md transition-colors"
                    >
                      <span>{patientSession ? 'Open My Patient Portal' : 'Patient Portal Login'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/crm"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#5EEAD4]" />
                      <span>Staff &amp; Doctor CRM</span>
                    </Link>
                  </div>
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
