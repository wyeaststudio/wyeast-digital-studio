import { describe, expect, it } from 'vitest';
import { nextVisibility } from './use-header-visibility';

const THRESHOLD = 64;

describe('nextVisibility [SHELL-R8]', () => {
  it('stays visible within one header height of the top', () => {
    expect(nextVisibility({ lastY: 0, hidden: false }, 60, THRESHOLD).hidden).toBe(false);
    expect(nextVisibility({ lastY: 400, hidden: true }, 40, THRESHOLD).hidden).toBe(false);
  });

  it('hides when scrolling down past the threshold', () => {
    expect(nextVisibility({ lastY: 100, hidden: false }, 300, THRESHOLD)).toEqual({ lastY: 300, hidden: true });
  });

  it('shows again on scroll up', () => {
    expect(nextVisibility({ lastY: 600, hidden: true }, 550, THRESHOLD)).toEqual({ lastY: 550, hidden: false });
  });

  it('ignores movement smaller than the tolerance', () => {
    const state = { lastY: 600, hidden: true };
    expect(nextVisibility(state, 595, THRESHOLD)).toBe(state);
  });
});
