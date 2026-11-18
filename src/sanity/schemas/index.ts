import { page } from './documents/page';
import { navItem, labelledLink } from './objects/nav-item';
import { siteLink } from './objects/site-link';
import { socialLink } from './objects/social-link';
import { singletonTypes } from './singletons';

export const schemaTypes = [...singletonTypes, page, siteLink, labelledLink, navItem, socialLink];
