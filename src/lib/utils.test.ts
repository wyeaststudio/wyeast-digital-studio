import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn [FOUND-R16]', () => {
  it('merges multiple class strings', () => {
    expect(cn('font-bold', 'text-lg')).toBe('font-bold text-lg');
  });

  it('ignores falsy and conditional values', () => {
    expect(cn('base', false && 'hidden', null, undefined, { active: true, disabled: false })).toBe(
      'base active',
    );
  });

  it('resolves conflicting Tailwind utilities, keeping the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
