import React from 'react';

interface SkeletonSectionProps {
  height?: number | string; // e.g. 400 or '50vh'
  className?: string;
  rounded?: boolean;
  shimmer?: boolean;
  ariaLabel?: string;
}

// Simple skeleton block to reserve layout space and reduce CLS while dynamic sections load.
export function SkeletonSection({
  height = 400,
  className = '',
  rounded = true,
  shimmer = true,
  ariaLabel = 'Loading section'
}: SkeletonSectionProps) {
  const h = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={[
        'relative overflow-hidden bg-slate-800/40 border border-slate-700/30',
        rounded ? 'rounded-2xl' : '',
        shimmer ? 'animate-pulse' : '',
        'backdrop-blur-sm',
        className
      ].join(' ')}
      style={{ minHeight: h }}
    >
      <span className="sr-only">{ariaLabel}</span>
      {/* Optional subtle gradient shimmer (pure CSS, no extra repaint heavy animation) */}
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
    </div>
  );
}

export default SkeletonSection;