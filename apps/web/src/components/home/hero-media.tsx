'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Cpu, HardDrive, Laptop } from 'lucide-react';

interface HeroMediaProps {
  /** Optional Flow AI video URL (kept undefined until owner supplies final asset). */
  videoSrc?: string;
  /** Optional poster image URL paired with videoSrc. */
  posterSrc?: string;
  /** Optional static replacement image URL. */
  fallbackImageSrc?: string;
  fallbackAlt?: string;
}

/**
 * Reusable hero media slot supporting future Google Flow brand video with
 * reduced-motion, mobile bandwidth, lazy-mount, and illustrative fallback handling.
 */
export function HeroMedia({
  videoSrc,
  posterSrc,
  fallbackImageSrc,
  fallbackAlt = "Kiran's Infotech hardware showcase illustration",
}: HeroMediaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoSrc) {
      setAllowVideo(false);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const connection = (navigator as any)?.connection;
    const saveData = Boolean(connection?.saveData);

    setAllowVideo(!reducedMotion && !isSmallScreen && !saveData);
  }, [videoSrc]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!allowVideo || !inView || !videoRef.current) return;
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [allowVideo, inView]);

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl border border-line bg-surface/90 p-5 sm:p-7 overflow-hidden shadow-card"
    >
      {/* Subtle geometric dot matrix & electric glow */}
      <div className="absolute inset-0 tech-grid-bg opacity-70 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-electric/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {videoSrc && allowVideo && inView ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-ink">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={fallbackAlt}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause showcase video' : 'Play showcase video'}
            className="glass-pill absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-white transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      ) : fallbackImageSrc ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-white">
          <img
            src={fallbackImageSrc}
            alt={fallbackAlt}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        /* Illustrative, replaceable hardware composition (not inventory photography) */
        <div
          role="img"
          aria-label="Illustrative modern laptop and hardware architecture composition"
          className="relative aspect-[16/10] w-full rounded-2xl border border-line bg-gradient-to-br from-white via-surface to-blue-50/60 p-5 sm:p-8 flex flex-col justify-between overflow-hidden"
        >
          {/* Orbit-inspired subtle concentric ring */}
          <div
            className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-brand-600/15 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-14 -right-14 h-52 w-52 rounded-full border border-electric/25 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between gap-2">
            <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              Hardware • Refurbished • Services
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Illustrative Preview
            </span>
          </div>

          {/* Minimal geometric laptop & component silhouette */}
          <div className="relative my-auto py-4 flex items-center justify-center">
            <div className="w-full max-w-[320px] animate-float-slow">
              {/* Screen bezel */}
              <div className="mx-auto w-[88%] rounded-t-2xl border-2 border-ink bg-ink p-2.5 shadow-glass">
                <div className="aspect-[16/10] rounded-lg bg-gradient-to-tr from-slate-900 via-ink to-blue-950 p-4 flex flex-col justify-between border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-600" />
                      <span className="h-2 w-2 rounded-full bg-electric/60" />
                    </div>
                    <span className="font-mono text-[9px] text-blue-300 tracking-widest uppercase">
                      KI // SYSTEM
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-white/5 border border-white/10 p-2 flex flex-col items-center gap-1">
                      <Laptop className="h-4 w-4 text-electric" />
                      <span className="font-mono text-[8px] text-slate-300">LAPTOPS</span>
                    </div>
                    <div className="rounded-md bg-white/5 border border-white/10 p-2 flex flex-col items-center gap-1">
                      <Cpu className="h-4 w-4 text-electric" />
                      <span className="font-mono text-[8px] text-slate-300">PARTS</span>
                    </div>
                    <div className="rounded-md bg-white/5 border border-white/10 p-2 flex flex-col items-center gap-1">
                      <HardDrive className="h-4 w-4 text-electric" />
                      <span className="font-mono text-[8px] text-slate-300">STORAGE</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Laptop base deck */}
              <div className="mx-auto h-3 w-full rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 border border-slate-400/80 shadow-sm flex items-center justify-center">
                <span className="h-0.5 w-12 rounded-full bg-slate-500/70" />
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>ORDER REQUEST WORKFLOW</span>
            <span className="text-brand-600 font-semibold">INR (₹) CATALOGUE</span>
          </div>
        </div>
      )}
    </div>
  );
}
