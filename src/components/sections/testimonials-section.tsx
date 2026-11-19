import { getImageProps } from 'next/image';
import { stegaClean } from 'next-sanity';
import { sanityImageLoader, urlForImage } from '@/lib/sanity-image';
import { Section } from './section';
import { SectionHeading } from './section-heading';
import type { BlockProps } from './types';

export function TestimonialsSection({ section, headingId, ...props }: BlockProps<'testimonialsSection'>) {
  return (
    <Section
      {...props} headingId={section.heading ? headingId : undefined} anchor={section.anchor}
      surface={section.surface ?? 'card'} innerClassName="space-y-12 lg:space-y-16"
    >
      {section.heading && <SectionHeading heading={section.heading} headingId={headingId} />}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.items?.map((item) => {
          if (!item || !stegaClean(item.quote)?.trim() || !stegaClean(item.name)?.trim()) return null;
          const photo = item.photo;
          const alt = stegaClean(photo?.alt)?.trim();
          const image = photo?.asset && alt ? getImageProps({
            src: urlForImage({
              asset: photo.asset, crop: photo.crop ?? undefined, hotspot: photo.hotspot ?? undefined,
            }).width(80).height(80).fit('crop').url(),
            loader: sanityImageLoader, width: 80, height: 80, alt,
            className: 'size-20 rounded-full object-cover',
          }).props : null;
          return (
            <figure key={item._id} className="flex flex-col gap-6 rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
              <blockquote className="flex-1 text-base leading-7"><p>{item.quote}</p></blockquote>
              <figcaption className="flex flex-wrap items-center gap-4 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {image && <img {...image} alt={image.alt} />}
                <div>
                  <p className="font-semibold">{item.name}</p>
                  {(item.role || item.company) && <p>{[item.role, item.company].filter(Boolean).join(', ')}</p>}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}
