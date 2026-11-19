import { navigation } from './navigation';
import { siteSettings } from './site-settings';
import { homePage } from './home-page';

export const singletonTypes = [siteSettings, navigation, homePage];

/** Singleton documents use their type name as the fixed document ID. */
export const SINGLETON_TYPES = new Set<string>(singletonTypes.map((type) => type.name));
