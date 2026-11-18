import {
  Accessibility, Activity, ChartNoAxesColumn, Code, Cpu, Gauge, Layout,
  MapPin, MessageSquare, Rocket, Search, Shapes, ShieldCheck, Sparkles, Target, Zap,
  type LucideIcon,
} from 'lucide-react';
import { stegaClean } from 'next-sanity';
import { ICON_NAMES } from '@/sanity/schemas/icon-names';

export const ICONS = {
  accessibility: Accessibility,
  activity: Activity,
  'bar-chart': ChartNoAxesColumn,
  code: Code,
  cpu: Cpu,
  'map-pin': MapPin,
  'message-square': MessageSquare,
  rocket: Rocket,
  search: Search,
  shapes: Shapes,
  target: Target,
  zap: Zap,
  'shield-check': ShieldCheck,
  gauge: Gauge,
  sparkles: Sparkles,
  layout: Layout,
} satisfies Record<(typeof ICON_NAMES)[number], LucideIcon>;

export function Icon({ name, className }: { name: string | null; className?: string }) {
  const cleanName = name ? stegaClean(name) : '';
  if (!Object.hasOwn(ICONS, cleanName)) return null;
  const Component = ICONS[cleanName as keyof typeof ICONS];
  return <Component aria-hidden="true" focusable="false" className={className} />;
}
