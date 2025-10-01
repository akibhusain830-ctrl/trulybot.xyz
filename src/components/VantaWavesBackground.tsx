'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface VantaWavesBackgroundProps {
  color?: number;
  shininess?: number;
  waveHeight?: number;
  zoom?: number;
  className?: string;
  disableBelow?: number; // viewport width below which effect is disabled
  fullBleed?: boolean; // stretch beyond parent constraints
  waveSpeed?: number; // speed multiplier
  debug?: boolean; // show debug border
  testMode?: boolean; // force extremely visible settings for troubleshooting
}

// Lightweight, auto-cleaning Vanta Waves wrapper
export default function VantaWavesBackground({
  color = 0x0a7ccf, // more vibrant cyan/blue
  shininess = 80,
  waveHeight = 22,
  zoom = 1.1,
  className = '',
  disableBelow = 640,
  fullBleed = false,
  waveSpeed = 1.2,
  debug = false,
  testMode = false
}: VantaWavesBackgroundProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<any>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = typeof window !== 'undefined' && window.innerWidth < disableBelow;
    if (prefersReduced || small) return; // skip effect

    let cancelled = false;
    (async () => {
      const WAVES = (await import('vanta/dist/vanta.waves.min')).default;
      if (!ref.current || cancelled) return;
      const opts: any = {
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color,
        shininess,
        waveHeight: testMode ? Math.max(30, waveHeight) : waveHeight,
        zoom: testMode ? 1.15 : zoom,
        waveSpeed: testMode ? Math.max(1.8, waveSpeed) : waveSpeed
      };
      vantaRef.current = WAVES(opts);
      setActive(true);
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[Vanta] Waves initialized', { opts });
      }
      // Expose globally for console tweaking
      (window as any).__VANTA_WAVES__ = vantaRef.current;
    })();

    const handleResize = () => {
      if (!vantaRef.current) return;
      // If resized below threshold after init, destroy
      if (window.innerWidth < disableBelow) {
        try { vantaRef.current.destroy(); } catch {}
        vantaRef.current = null;
        setActive(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      if (vantaRef.current) {
        try { vantaRef.current.destroy(); } catch {}
        vantaRef.current = null;
      }
    };
  }, [color, shininess, waveHeight, zoom, disableBelow]);

  return (
    <div ref={ref} className={`absolute ${fullBleed ? 'inset-0' : 'inset-0'} ${debug ? 'outline outline-pink-500' : ''} ${className}`} aria-hidden="true" style={{ zIndex: 0 }}>
      {/* Overlay removed for maximum visibility during debug */}
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#010b16] to-black" />
      )}
    </div>
  );
}
