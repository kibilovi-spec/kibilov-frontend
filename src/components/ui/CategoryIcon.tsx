'use client';

// Professional SVG icons for each category slug
const ICONS: Record<string, JSX.Element> = {

  // ── სამუხრუჭე სისტემა ──────────────────────────────────────────────
  'braking-system': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3"/>
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M24 6v6M24 36v6M6 24h6M36 24h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10.4 10.4l4.2 4.2M33.4 33.4l4.2 4.2M10.4 37.6l4.2-4.2M33.4 14.6l4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
    </svg>
  ),
  'brake-pads-front': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="14" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="3"/>
      <rect x="13" y="19" width="22" height="10" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 24h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 20h4M8 28h4M36 20h4M36 28h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'brake-pads-rear': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="14" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="3"/>
      <rect x="13" y="19" width="22" height="10" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 21h16M16 27h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 20h4M8 28h4M36 20h4M36 28h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // ── ფილტრები ──────────────────────────────────────────────────────
  'filters': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="10" y="8" width="28" height="32" rx="5" stroke="currentColor" strokeWidth="3"/>
      <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M24 15v18M15 24h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
    </svg>
  ),
  'oil-filters': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="14" y="6" width="20" height="36" rx="6" stroke="currentColor" strokeWidth="3"/>
      <path d="M14 16h20M14 20h20M14 24h20M14 28h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M20 6v4M28 6v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 38v4M28 38v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'air-filters': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="12" width="36" height="24" rx="6" stroke="currentColor" strokeWidth="3"/>
      <path d="M12 20h8M12 24h12M12 28h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 20h8M28 24h8M28 28h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 12v24" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
    </svg>
  ),
  'cabin-filters': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="8" y="10" width="32" height="28" rx="5" stroke="currentColor" strokeWidth="3"/>
      <path d="M14 18h20M14 24h20M14 30h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 18l4-4M38 24h4M38 30l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  'fuel-filters': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M16 42V14a2 2 0 012-2h12a2 2 0 012 2v28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M12 42h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M20 12V8h8v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20h8M20 26h8M20 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),

  // ── ზეთები და სითხეები ──────────────────────────────────────────
  'fluids-chemicals': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M24 6l12 12v18a4 4 0 01-4 4H16a4 4 0 01-4-4V18L24 6z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M16 18h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 28c0-2 4-4 4-8 0 4 4 6 4 8a4 4 0 01-8 0z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  'engine-oils': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M18 6h12v4l3 3v25a4 4 0 01-4 4H19a4 4 0 01-4-4V13l3-3V6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M15 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M21 24c0-2 3-4 3-7 0 3 3 5 3 7a3 3 0 01-6 0z" fill="currentColor" opacity="0.35" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M30 8h4a2 2 0 012 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'transmission-oils': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="14" cy="14" r="6" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="34" cy="14" r="6" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="14" cy="34" r="6" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="34" cy="34" r="6" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M20 14h8M20 34h8M14 20v8M34 20v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'coolants': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M24 6v36M6 24h36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11.5 11.5l25 25M36.5 11.5l-25 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 10l2 4h-4l2-4zM24 38l2-4h-4l2 4zM10 24l4 2v-4l-4 2zM38 24l-4 2v-4l4 2z" fill="currentColor" opacity="0.6"/>
    </svg>
  ),
  'brake-fluids': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M24 8c0 0-12 10-12 20a12 12 0 0024 0C36 18 24 8 24 8z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M16 30a8 8 0 008 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M24 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),

  // ── გამწმენდი ──────────────────────────────────────────────────────
  'cleaning': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M18 6h12v6l4 4v22a4 4 0 01-4 4H18a4 4 0 01-4-4V16l4-4V6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M14 20h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 6h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="32" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 28v2M24 34v2M20 32h2M26 32h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // ── მინასაწმენდები ─────────────────────────────────────────────────
  'wipers': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M10 38C10 38 14 14 38 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M10 38C10 38 18 18 38 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <path d="M10 38C10 38 20 24 38 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"/>
      <circle cx="10" cy="38" r="4" fill="currentColor" opacity="0.8"/>
      <path d="M36 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Default icon for unknown categories
const DEFAULT_ICON = (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="3"/>
    <path d="M24 16v16M16 24h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

interface CategoryIconProps {
  slug?: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({ slug = '', className = 'w-8 h-8', color = 'text-primary' }: CategoryIconProps) {
  const icon = ICONS[slug] || DEFAULT_ICON;
  return (
    <span className={`${className} ${color} flex items-center justify-center`}>
      {icon}
    </span>
  );
}
