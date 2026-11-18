import type { MetadataRoute } from 'next';
import { buildRobots } from '@/lib/seo/robots';
import { isIndexableDeployment } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ indexable: isIndexableDeployment() });
}
