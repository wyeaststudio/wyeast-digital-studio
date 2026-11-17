import type { NavItem, NavLink } from './shell-props';

export const navItemsFixture: NavItem[] = [
  { key: 'home', label: 'Home', href: '/', children: [] },
  {
    key: 'services',
    label: 'Services',
    href: '/services',
    children: [
      { key: 'a11y', label: 'Accessibility', href: '/services/accessibility' },
      { key: 'perf', label: 'High Performance', href: '/services/high-performance' },
    ],
  },
  { key: 'about', label: 'About', href: '/about', children: [] },
  { key: 'contact', label: 'Contact', href: '/contact', children: [] },
];

export const ctaFixture: NavLink = { key: 'cta', label: 'Book Appointment', href: '/contact' };
