'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhysioSummary {
  id: string;
  full_name: string;
  specialization: string | null;
}

const CONDITION_EXPLORER = [
  {
    id: 'knee-acl',
    label: 'Knee, ACL & Meniscus',
    pillar: 'Sports Injury Centre • Desmotec Lab',
    duration: '45 Mins Session',
    headline: 'Biomechanical Knee & Ligament Reconstruction Rehab',
    description:
      'Targeted eccentric overload and neuromuscular stabilization for ACL tears, meniscus injuries, patellofemoral pain, and post-arthroscopy recovery.',
    symptoms: [
      'Instability or giving way during stairs/sports',
      'Post-ACL or meniscus surgery stiffness & quad atrophy',
      'Anterior knee pain (Runner’s / Jumper’s knee)',
      'Osteoarthritis joint loading discomfort',
    ],
    protocol: [
      'Desmotec V.Line eccentric flywheel fuerza & symmetry testing',
      'Closed-kinetic-chain neuromuscular knee stabilization',
      'Joint mobilization, swelling reduction & gait retraining',
    ],
    equipment: 'Desmotec V.Line Isokinetic Flywheel + Force Telemetry',
  },
  {
    id: 'spine-disc',
    label: 'Spine, Sciatica & Neck',
    pillar: 'Physiotherapy • Spine & Pain Wing',
    duration: '30–45 Mins Session',
    headline: 'Cervical & Lumbar Disc Decompression & Manual Therapy',
    description:
      'Evidence-based relief for L4-L5 / L5-S1 disc bulges, radiating sciatica, cervical radiculopathy, and acute lower back spasms without surgery.',
    symptoms: [
      'Radiating leg pain, tingling, or numbness (Sciatica)',
      'Cervical stiffness with shoulder/arm radiation',
      'Lower back pain aggravated by prolonged sitting',
      'Facet joint locking and paraspinal muscle spasm',
    ],
    protocol: [
      'Targeted spinal decompression & directional preference therapy',
      'Hands-on McKenzie & Maitland manual vertebral mobilization',
      'Dry needling, cupping & deep core motor control retraining',
    ],
    equipment: 'Spinal Decompression Suite + Electro-Physical Modalities',
  },
  {
    id: 'shoulder-cuff',
    label: 'Shoulder & Rotator Cuff',
    pillar: 'Physiotherapy & Sports Rehab',
    duration: '45 Mins Session',
    headline: 'Frozen Shoulder & Rotator Cuff Restoration',
    description:
      'Restore overhead range of motion and scapular mechanics for adhesive capsulitis (frozen shoulder), impingement, and overhead sports injuries.',
    symptoms: [
      'Night pain when sleeping on the affected shoulder',
      'Difficulty reaching behind the back or overhead',
      'Rotator cuff tendinopathy or labral tear weakness',
      'Scapular winging and upper trapezius overload',
    ],
    protocol: [
      'Glenohumeral capsular stretching & grade III-IV mobilization',
      'Eccentric rotator cuff tendon remodeling',
      'Scapulothoracic rhythm & kinetic chain integration',
    ],
    equipment: 'Private Frosted-Glass Manual Therapy Suites + Cable/Band Lab',
  },
  {
    id: 'post-op-neuro',
    label: 'Post-Op & Neuro Recovery',
    pillar: 'Research & Rehabilitation',
    duration: '60 Mins Comprehensive Session',
    headline: 'Post-Operative Joint Replacement & Neurological Rehab',
    description:
      'Structured, milestone-driven rehabilitation after Total Knee/Hip Replacement (TKR/THR), complex fractures, stroke, or spinal cord recovery.',
    symptoms: [
      'Post-surgical joint stiffness, scar tissue & weakness',
      'Balance deficits, gait asymmetry, or fall risk',
      'Post-stroke hemiparesis or peripheral nerve injury',
      'Delayed return to independent daily mobility',
    ],
    protocol: [
      'Phase-wise post-operative range-of-motion & load progression',
      'Neurological gait, proprioception & balance re-education',
      'Quantitative left-vs-right limb symmetry tracking',
    ],
    equipment: 'Gait Walkway + Treadmill & Balance Rehabilitation Floor',
  },
  {
    id: 'posture-lifestyle',
    label: 'Desk Posture & Ergonomics',
    pillar: 'Lifestyle Clinic',
    duration: '30 Mins Session',
    headline: 'Movement Medicine for Corporate & Lifestyle Strain',
    description:
      'Correct forward-head posture, thoracic kyphosis, and repetitive strain syndromes with personalized ergonomic coaching and sustainable home mobility.',
    symptoms: [
      'Chronic upper back tightness and tension headaches',
      'Hip flexor tightness & gluteal amnesia from desk work',
      'Recurrent stiffness despite temporary massage relief',
      'Preventive joint longevity & metabolic movement conditioning',
    ],
    protocol: [
      'Full-body postural & movement screen',
      'Thoracic mobility, myofascial release & breathing mechanics',
      'Digital PDF/Image home exercise chart delivered via WhatsApp',
    ],
    equipment: 'Postural Alignment Grid + Customized Home Rehab Vault',
  },
];

const FAQS = [
  {
    q: 'What happens during my first consultation at The Physio Lab?',
    a: 'Your first session includes a 1-on-1 biomechanical and clinical evaluation with a specialist physiotherapist. We identify the root mechanical cause of your pain, perform hands-on relief or Desmotec assessment, and upload your personalized rehabilitation protocol and exercise chart directly to your Patient Portal.',
  },
  {
    q: 'How does the WhatsApp OTP login and reminder system work?',
    a: 'No passwords or app downloads are needed. Simply sign in with your 10-digit WhatsApp mobile number. As soon as you or our reception team book an appointment, you receive an instant WhatsApp confirmation followed by automated 24-hour and 2-hour reminders.',
  },
  {
    q: 'What is the Desmotec Eccentric Rehabilitation Lab?',
    a: 'The Physio Lab features specialized Desmotec V.Line isokinetic/eccentric flywheel technology from Italy—used by elite sports clubs worldwide. It safely applies controlled eccentric load to remodel injured tendons (ACL, patellar, Achilles, rotator cuff) and measures real-time force symmetry.',
  },
  {
    q: 'Can I view and download my prescriptions and exercise charts on my phone?',
    a: 'Yes! Every completed consultation syncs your doctor’s clinical diagnosis, home rehab protocol, and attached PDF or image exercise charts directly to your Patient Portal for 1-tap preview and download.',
  },
];

export function HeroQuickBookBar({
  physios,
  isAuthenticated,
}: {
  physios: PhysioSummary[];
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [selectedPhysio, setSelectedPhysio] = useState<string>('any');
  const [selectedPillar, setSelectedPillar] = useState<string>('Physiotherapy & Spine Care');

  function handleQuickBook(e: React.FormEvent) {
    e.preventDefault();
    const targetPath =
      selectedPhysio && selectedPhysio !== 'any'
        ? `/portal/book?physioId=${encodeURIComponent(selectedPhysio)}`
        : '/portal/book';

    if (isAuthenticated) {
      router.push(targetPath);
    } else {
      router.push(`/login?next=${encodeURIComponent(targetPath)}`);
    }
  }

  return (
    <form
      onSubmit={handleQuickBook}
      className="bg-white rounded-2xl p-3 sm:p-4 border border-border shadow-xl shadow-primary/5"
    >
      <div className="flex items-center justify-between px-2 pb-2.5 mb-2.5 border-b border-border/70">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Instant Online Slot Finder</span>
        </span>
        <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          ● Live Slots Open Today &amp; Tomorrow
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        <div className="sm:col-span-5 bg-muted/60 rounded-xl px-3.5 py-2 border border-border/70">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Clinical Wing / Condition
          </label>
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-foreground focus:outline-none mt-0.5"
          >
            <option value="Physiotherapy & Spine Care">Physiotherapy &amp; Spine Care</option>
            <option value="Sports Injury (Desmotec Lab)">Sports Injury (Desmotec Lab)</option>
            <option value="Research & Post-Op Rehab">Research &amp; Post-Op Rehab</option>
            <option value="Lifestyle & Posture Clinic">Lifestyle &amp; Posture Clinic</option>
          </select>
        </div>

        <div className="sm:col-span-4 bg-muted/60 rounded-xl px-3.5 py-2 border border-border/70">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Preferred Specialist
          </label>
          <select
            value={selectedPhysio}
            onChange={(e) => setSelectedPhysio(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-foreground focus:outline-none mt-0.5"
          >
            <option value="any">Any Available Specialist</option>
            {physios.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            className="w-full h-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm px-4 py-3 shadow-md shadow-primary/20 transition-all"
          >
            <CalendarCheck className="h-4 w-4 shrink-0" />
            <span>See Live Slots</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export function InteractiveSymptomExplorer({ bookingHref }: { bookingHref: string }) {
  const [activeTab, setActiveTab] = useState(CONDITION_EXPLORER[0].id);
  const current =
    CONDITION_EXPLORER.find((item) => item.id === activeTab) || CONDITION_EXPLORER[0];

  return (
    <div className="space-y-6">
      {/* Horizontal Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CONDITION_EXPLORER.map((item) => {
          const isSelected = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/15'
                  : 'bg-white text-foreground/80 border-border hover:border-primary/40 hover:bg-secondary/40'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Active Condition Detail Card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              {current.pillar}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground/80 text-xs font-mono font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {current.duration}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {current.headline}
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {current.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Symptoms We Treat
              </h4>
              <ul className="space-y-2">
                {current.symptoms.map((sym) => (
                  <li key={sym} className="flex items-start gap-2 text-xs text-foreground/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-secondary/45 border border-primary/20 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Clinical Protocol
              </h4>
              <ul className="space-y-2">
                {current.protocol.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Equipment & Direct CTA Box */}
        <div className="lg:col-span-5 bg-[#141E1E] text-white rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2DD4BF]">
              Clinical Technology
            </span>
            <Activity className="h-5 w-5 text-[#2DD4BF]" />
          </div>

          <div>
            <p className="text-xs text-white/65 uppercase tracking-wider">Dedicated Equipment</p>
            <p className="text-base font-semibold text-white mt-1">{current.equipment}</p>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-white/80">
            <div className="flex items-center justify-between">
              <span className="text-white/60">1-on-1 Specialist Assessment</span>
              <span className="font-mono font-semibold text-[#2DD4BF]">Included</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Digital PDF/Image Exercise Chart</span>
              <span className="font-mono font-semibold text-[#2DD4BF]">Portal Sync</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">WhatsApp 24h &amp; 2h Reminders</span>
              <span className="font-mono font-semibold text-[#2DD4BF]">Automated</span>
            </div>
          </div>

          <a
            href={bookingHref}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-3.5 px-5 shadow-lg transition-all"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Book {current.label} Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function ClinicFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.q}
            className="bg-white rounded-xl border border-border overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm sm:text-base font-semibold text-foreground">{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-primary shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
