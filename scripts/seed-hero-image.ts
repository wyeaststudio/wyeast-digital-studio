import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { apiVersion } from '../src/sanity/env';
import { HOME_PAGE_QUERY, PAGE_QUERY } from '../src/sanity/queries';

const client = getCliClient({ apiVersion }).withConfig({ useCdn: false, perspective: 'published' });

async function seedHeroImage() {
  const pages = await Promise.all([
    client.fetch(HOME_PAGE_QUERY),
    client.fetch(PAGE_QUERY, { slug: 'page-builder-demo' }),
  ]);
  const heroes = pages.map((page, index) => {
    if (!page) throw new Error(`Missing ${index === 0 ? 'homePage' : 'page-builder-demo'}; apply pages.json with --missing first.`);
    const hero = page.sections?.find((section) => section._type === 'heroSection');
    if (!hero) throw new Error(`Document "${page._id}" has no hero; add one in Studio before seeding its image.`);
    return { page, hero };
  });
  const missing = heroes.filter(({ hero }) => !hero.image?.asset?._ref);
  if (missing.length === 0) {
    console.log('Both heroes already have images; nothing was uploaded or changed.');
    return;
  }

  const asset = await client.assets.upload(
    'image',
    createReadStream(join(process.cwd(), 'sanity/seed/hero-placeholder.jpg')),
    { filename: 'hero-placeholder.jpg', label: 'Placeholder: replace with a licensed hero photo before launch (011)' },
  );
  let transaction = client.transaction();
  for (const { page, hero } of missing) {
    const imagePath = `sections[_key==${JSON.stringify(hero._key)}].image`;
    transaction = transaction
      .patch(page._id, (patch) => patch.setIfMissing({ [imagePath]: { _type: 'image', decorative: true, alt: '' } }))
      .patch(page._id, (patch) =>
        patch.setIfMissing({ [`${imagePath}.asset`]: { _type: 'reference', _ref: asset._id } }),
      );
  }
  await transaction.commit();
  console.log(`Seeded the placeholder image on ${missing.map(({ page }) => page._id).join(', ')}; existing images were preserved.`);
}

seedHeroImage().catch((error: unknown) => {
  console.error('Failed to seed hero images', error);
  process.exitCode = 1;
});
