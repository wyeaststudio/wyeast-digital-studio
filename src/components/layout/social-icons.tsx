import type { SocialPlatform } from '@/sanity/schemas/objects/social-link';

// Simplified, hand-drawn marks (spec Q6). Stroke-based to match the lucide icon style used elsewhere.
const PATHS: Record<SocialPlatform, React.ReactNode> = {
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5v.01" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8h-1.5a2.5 2.5 0 0 0-2.5 2.5V21M8.5 13.5h6" />
    </>
  ),
  github: (
    <path d="M9 19.5c-3.5 1-3.5-1.5-5-2M15 21v-3.2a2.8 2.8 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-5.9a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 3 5.5 3.3 5.5 3.3a4.3 4.3 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.2c0 4.6 2.8 5.6 5.5 5.9a2.8 2.8 0 0 0-.8 2.2V21" />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </>
  ),
  bluesky: (
    <path d="M12 11c-1.5-3-5-6-7.5-6C3 5 3 6.5 3 7.5c0 2 1 4.8 4 5.3-2.5.5-3.5 2.5-1.5 4.5 2.5 2.5 5-.5 6.5-3.8 1.5 3.3 4 6.3 6.5 3.8 2-2 1-4-1.5-4.5 3-.5 4-3.3 4-5.3 0-1 0-2.5-1.5-2.5-2.5 0-6 3-7.5 6z" />
  ),
  x: <path d="M4 4l11.5 16H20L8.5 4zM4 20l6.8-6.8M20 4l-6.8 6.8" />,
};

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  github: 'GitHub',
  youtube: 'YouTube',
  bluesky: 'Bluesky',
  x: 'X',
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[platform]}
    </svg>
  );
}
