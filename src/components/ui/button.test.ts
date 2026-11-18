import { describe, expect, it } from 'vitest';
import { buttonVariants } from './button';

// Filled variants must use opaque token pairs that tokens.test.ts verifies at 7:1.
// Translucent fills (e.g. bg-primary/80) blend with whatever is behind them and escape that test.
describe('Button filled variants use contrast-tested token pairs [FOUND-R1, FOUND-R24]', () => {
  it.each([
    ['default', 'primary'],
    ['accent', 'accent'],
    ['destructive', 'destructive'],
  ] as const)('%s uses bg-%s, its foreground, and an opaque hover token', (variant, token) => {
    const classes = buttonVariants({ variant }).split(/\s+/);

    expect(classes).toContain(`bg-${token}`);
    expect(classes).toContain(`text-${token}-foreground`);
    expect(classes).toContain(`hover:bg-${token}-hover`);
    expect(classes.filter((c) => /^(?:[\w-]+:)*bg-[\w-]+\/\d+$/.test(c))).toEqual([]);
  });
});
