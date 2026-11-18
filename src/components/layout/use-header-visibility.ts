'use client';

import { useEffect, useState } from 'react';

export interface ScrollState {
  lastY: number;
  hidden: boolean;
}

/** Ignore jitter smaller than this many pixels. */
const TOLERANCE = 8;

/** Hide after scrolling down past `threshold`; show on any upward scroll or near the top. */
export function nextVisibility(state: ScrollState, y: number, threshold: number): ScrollState {
  if (y <= threshold) return { lastY: y, hidden: false };
  const delta = y - state.lastY;
  if (Math.abs(delta) < TOLERANCE) return state;
  return { lastY: y, hidden: delta > 0 };
}

export function useHeaderHidden(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let state: ScrollState = { lastY: window.scrollY, hidden: false };
    let frame = 0;
    const threshold = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-navbar')) * 16 || 64;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        state = nextVisibility(state, window.scrollY, threshold());
        setHidden(state.hidden);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}
