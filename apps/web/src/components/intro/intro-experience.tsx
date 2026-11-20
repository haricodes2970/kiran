'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

const INTRO_SESSION_KEY = 'ki_intro_seen_v1';
const INTRO_VIDEO_SRC = '/media/kirans-infotech-intro.mp4';

interface IntroExperienceProps {
  /** Override path for testing missing/fallback video behavior */
  videoSrc?: string;
}

/**
 * Full-viewport cinematic entry experience shown once per browser session on public routes.
 * Never blocks homepage API loading, respects prefers-reduced-motion, and supports Enter/Skip.
 */
export function IntroExperience({ videoSrc = INTRO_VIDEO_SRC }: IntroExperienceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);

  const dismissIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }
    setFadingOut(true);
    window.setTimeout(() => {
      setShouldRender(false);
    }, 420);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Never show on /admin routes
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {}
      return;
    }

    // Only play once per browser session
    try {
      if (window.sessionStorage.getItem(INTRO_SESSION_KEY) === '1') {
        return;
      }
    } catch {}

    setShouldRender(true);
  }, []);

  // Lock body scroll while intro overlay is active
  useEffect(() => {
    if (!shouldRender) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [shouldRender]);

  // Allow pressing Enter to skip the intro
  useEffect(() => {
    if (!shouldRender) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        dismissIntro();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shouldRender, dismissIntro]);

  // Attempt muted inline autoplay; dismiss gracefully if browser blocks playback
  useEffect(() => {
    if (!shouldRender || !videoRef.current) return;
    const vid = videoRef.current;
    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        dismissIntro();
      });
    }
  }, [shouldRender, dismissIntro]);

  const toggleSound = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !muted;
    vid.muted = nextMuted;
    setMuted(nextMuted);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kiran's Infotech brand introduction"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#04070F] transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle electric-blue ambient glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16)_0%,transparent_65%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top bar: subtle brand indicator + top-right Skip Intro */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-3.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">
            Kiran&apos;s Infotech
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? 'Unmute intro video' : 'Mute intro video'}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/50 backdrop-blur-md p-2.5 text-white/85 hover:text-white hover:border-white/30 transition"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={dismissIntro}
            aria-label="Skip intro"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-brand-600 hover:border-brand-600 transition"
          >
            <span>Skip Intro</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Loading state before first video frame */}
      {!videoReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-8 w-8 rounded-full border-2 border-brand-600/30 border-t-electric animate-spin" />
        </div>
      )}

      {/* Primary Intro Video (muted, inline, no loop, no native controls) */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted={muted}
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onEnded={dismissIntro}
        onError={dismissIntro}
        className={`relative z-10 h-full w-full object-contain sm:object-cover transition-opacity duration-300 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
