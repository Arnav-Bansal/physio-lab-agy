'use client';

import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Camera,
  Calendar,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { BrandEmblem } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function CrmMobileAppInstall({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'header' | 'login-card';
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [platformTab, setPlatformTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    // Register Service Worker for PWA installability (force immediate update check)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update().catch(() => undefined))
        .catch(() => undefined);
    }

    // Detect if already running as installed PWA or Capacitor native app
    if (typeof window !== 'undefined') {
      const standaloneMatch =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((window.navigator as unknown as { standalone?: boolean }).standalone) ||
        Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
      setIsStandalone(standaloneMatch);

      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('android')) {
        setPlatformTab('android');
      } else {
        setPlatformTab('ios');
      }
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return;
    }
    setShowGuideModal(true);
  }

  return (
    <>
      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#00858E] to-[#00646B] hover:opacity-95 shadow-sm transition-all"
        >
          <span className="flex items-center gap-2 truncate">
            <Smartphone className="h-4 w-4 shrink-0 text-[#5EEAD4]" />
            <span className="truncate">
              {isStandalone ? 'CRM App Active' : 'Install iOS / Android App'}
            </span>
          </span>
          <Download className="h-3.5 w-3.5 shrink-0 text-[#5EEAD4]" />
        </button>
      )}

      {variant === 'header' && !isStandalone && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-accent text-secondary-foreground border border-primary/20 px-3 py-2 text-xs font-bold transition-colors"
          title="Install PhysioLab CRM on iOS or Android"
        >
          <Smartphone className="h-3.5 w-3.5 text-primary" />
          <span className="hidden md:inline">Get Mobile App</span>
        </button>
      )}

      {variant === 'login-card' && (
        <div className="bg-[#141E1E] text-white rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-primary/25 border border-[#2DD4BF]/30 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-[#2DD4BF]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                  iOS &amp; Android Staff App
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/85">
                  v1.0 Native + PWA
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Install PhysioLab CRM on Your Phone or Tablet
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Designed for Doctors &amp; Reception Staff — full-screen mobile schedule, 1-tap
                camera prescription capture, and instant WhatsApp patient triggers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shrink-0 shadow-md transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* Interactive iOS & Android Installation Modal */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full border border-border shadow-2xl overflow-hidden text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Clinical Header */}
            <div className="bg-[#141E1E] text-white p-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <BrandEmblem className="h-11 w-11" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                    Staff, Doctor &amp; Admin Mobile App
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Install PhysioLab CRM
                  </h3>
                  <p className="text-xs text-white/70">
                    Works on iPhone, iPad, and Android Phones &amp; Tablets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Platform Switcher */}
              <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setPlatformTab('ios')}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-bold transition-all',
                    platformTab === 'ios'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  iPhone / iPad (iOS)
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformTab('android')}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-bold transition-all',
                    platformTab === 'android'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Android Phone / Tablet
                </button>
              </div>

              {platformTab === 'ios' ? (
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-primary/20 flex items-start gap-3">
                    <Share className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        1. Tap the Share button in Safari
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Open <strong>thephysiolabs.com/crm</strong> in Safari on your iPhone
                        or iPad and tap the bottom <strong>Share</strong> icon.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-primary/20 flex items-start gap-3">
                    <PlusSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        2. Select &ldquo;Add to Home Screen&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Scroll down the share sheet and tap <strong>Add to Home Screen</strong>,
                        then tap <strong>Add</strong> in the top-right corner.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        Native Xcode Project Included (`ios/App`)
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        For Apple App Store / TestFlight distribution, run{' '}
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                          npx cap open ios
                        </code>{' '}
                        to build the native iOS app bundle (`in.thephysiolab.crm`).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs sm:text-sm">
                  {deferredPrompt && (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>1-Tap Install PhysioLab CRM Now</span>
                    </button>
                  )}

                  <div className="p-3.5 rounded-xl bg-secondary/60 border border-primary/20 flex items-start gap-3">
                    <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        1. Tap &ldquo;Install App&rdquo; in Chrome Menu (⋮)
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        In Chrome on Android, tap the top-right <strong>⋮</strong> menu and select{' '}
                        <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">
                        Native Android Studio Project Included (`android/`)
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        To build a signed `.apk` or Google Play `.aab`, run{' '}
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                          npx cap open android
                        </code>{' '}
                        (`in.thephysiolab.crm`).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Built-in Mobile CRM Features Strip */}
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Included in the Staff &amp; Doctor Mobile App
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold">Camera Rx Capture</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold">Live Slot Calendar</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold">Mobile SOAP Notes</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
