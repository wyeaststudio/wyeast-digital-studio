import type { HOME_PAGE_QUERY_RESULT } from '../../../sanity.types';

export type PageSection = NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>['sections']>[number];
export type BlockData<T extends PageSection['_type']> = Extract<PageSection, { _type: T }>;
export type Surface = NonNullable<PageSection['surface']>;
export type BlockProps<T extends PageSection['_type']> = {
  section: BlockData<T>;
  headingId: string;
  'data-sanity'?: string;
};
