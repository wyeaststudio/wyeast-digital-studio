import { describe, expectTypeOf, it } from 'vitest';
import type { PAGES_QUERY_RESULT } from '../../sanity.types';
import type { sanityFetch } from './fetch';
import type { PAGES_QUERY } from './queries';

describe('sanityFetch typing [FOUND-R11]', () => {
  it('returns the TypeGen result type for a defineQuery query, not any', () => {
    type Result = Awaited<ReturnType<typeof sanityFetch<typeof PAGES_QUERY>>>;
    expectTypeOf<Result>().not.toBeAny();
    expectTypeOf<Result>().toEqualTypeOf<PAGES_QUERY_RESULT>();
  });
});
