import React from 'react';

/**
 * UnganishaLogo — custom SVG brand mark for Unganisha AI.
 * Concept: Two stylised human figures with arms outstretched, hands meeting at
 * a central glowing node, symbolising people connecting to what matters most.
 *
 * Props:
 *   size      – number (px), default 40
 *   animated  – bool, enables pulse & connection-draw animations, default false
 *   className – extra Tailwind classes
 */
export default function UnganishaLogo({ size = 40, animated = false, className = '' }) {
  const id = React.useId().replace(/:/g, ''); // unique ids for defs

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Unganisha AI Logo"
    >
      <defs>
        {/* Brand gradient left→right */}
        <linearGradient id={`lg-brand-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#5c7aff" />
          <stop offset="50%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ff5c47" />
        </linearGradient>

        {/* Glow for the centre node */}
        <radialGradient id={`rg-node-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%"  stopColor="#a5b4fc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5c7aff" stopOpacity="0" />
        </radialGradient>

        {/* Soft glow filter */}
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Connection line gradient */}
        <linearGradient id={`lg-line-${id}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%"   stopColor="#5c7aff" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="1"   />
          <stop offset="100%" stopColor="#ff5c47" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ── Outer decorative ring ── */}
      <circle
        cx="40" cy="40" r="37"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="0.8"
        strokeOpacity="0.25"
        fill="rgba(15,23,42,0.4)"
      />

      {/* ── Left human figure ── */}
      {/* Head */}
      <circle cx="16" cy="18" r="5.5" fill={`url(#lg-brand-${id})`} opacity="0.9" />
      {/* Body */}
      <path
        d="M16 24 C16 24 12 30 12 36"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Left arm reaching right toward centre */}
      <path
        d="M14 29 C20 28 28 34 36 38"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className={animated ? 'connection-line' : ''}
        opacity="0.9"
      />
      {/* Legs */}
      <path d="M12 36 L9 46" stroke={`url(#lg-brand-${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M12 36 L15 46" stroke={`url(#lg-brand-${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* ── Right human figure ── */}
      {/* Head */}
      <circle cx="64" cy="18" r="5.5" fill={`url(#lg-brand-${id})`} opacity="0.9" />
      {/* Body */}
      <path
        d="M64 24 C64 24 68 30 68 36"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Right arm reaching left toward centre */}
      <path
        d="M66 29 C60 28 52 34 44 38"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className={animated ? 'connection-line' : ''}
        style={{ animationDelay: '0.3s' }}
        opacity="0.9"
      />
      {/* Legs */}
      <path d="M68 36 L71 46" stroke={`url(#lg-brand-${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M68 36 L65 46" stroke={`url(#lg-brand-${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* ── Central connection node (glowing) ── */}
      {/* Outer glow halo */}
      <circle
        cx="40" cy="40" r="10"
        fill={`url(#rg-node-${id})`}
        opacity="0.25"
        filter={`url(#glow-${id})`}
      />
      {/* Node ring */}
      <circle
        cx="40" cy="40" r="7"
        stroke={`url(#lg-brand-${id})`}
        strokeWidth="1.5"
        fill="rgba(92,122,255,0.15)"
      />
      {/* Node core */}
      <circle
        cx="40" cy="40" r="4"
        fill={`url(#lg-brand-${id})`}
        filter={`url(#glow-${id})`}
      />

      {/* ── Floating micro-nodes (opportunity symbols) ── */}
      <circle cx="40" cy="60" r="2.5" fill="#5c7aff" opacity="0.6" />
      <path
        d="M40 47 L40 57"
        stroke="#5c7aff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.5"
      />

      {/* Small orbiting node — top */}
      <circle cx="40" cy="14" r="2" fill="#8b5cf6" opacity="0.55" />
      <path
        d="M40 24 L40 17"
        stroke="#8b5cf6"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1.5 2"
        opacity="0.4"
      />

      {/* ── Horizontal connection line between the two arms ── */}
      <line
        x1="26" y1="38" x2="54" y2="38"
        stroke={`url(#lg-line-${id})`}
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="3 3"
      />
    </svg>
  );
}
