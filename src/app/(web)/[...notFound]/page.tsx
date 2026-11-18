import { notFound } from 'next/navigation';

// The app has two root layouts ((web) and studio), so unmatched URLs are routed here to render (web)/not-found.tsx inside the site shell.
export default function CatchAllNotFound() {
  notFound();
}
