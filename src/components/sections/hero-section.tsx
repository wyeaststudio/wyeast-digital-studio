import { getImageProps } from 'next/image';
import { stegaClean } from 'next-sanity';
import { BrandLockup } from '@/components/layout/brand-logo';
import { SiteLink } from '@/components/layout/site-link';
import { buttonVariants } from '@/components/ui/button';
import { sanityImageLoader, urlForImage } from '@/lib/sanity-image';
import { cn } from '@/lib/utils';
import { isValidHref } from '@/sanity/validation';
import { Section } from './section';
import type { BlockProps } from './types';

export function HeroSection({ section, headingId, ...props }: BlockProps<'heroSection'>) {
  const { image } = section;
  if (!section.heading || !image?.asset) return null;
  const source = {
    asset: image.asset,
    crop: image.crop ?? undefined,
    hotspot: image.hotspot ?? undefined,
  };
  const imageProps = (width: number, height: number) => getImageProps({
    src: urlForImage(source).width(width).height(height).fit('crop').url(),
    loader: sanityImageLoader,
    alt: image.decorative ? '' : (stegaClean(image.alt) ?? ''),
    fill: true,
    sizes: '100vw',
    loading: 'eager',
    fetchPriority: 'high',
    className: 'object-cover',
  }).props;
  const mobile = imageProps(800, 1600);
  const desktop = imageProps(1600, 1120);
  const ctas = [section.primaryCta, section.secondaryCta];

  return (
    <Section
      {...props}
      anchor={section.anchor}
      headingId={headingId}
      className="relative isolate flex min-h-228 items-start overflow-hidden pt-32 pb-24 lg:min-h-240 lg:px-24 lg:pt-40 lg:pb-28"
      innerClassName="w-full"
    >
      <link rel="preload" as="image" imageSrcSet={mobile.srcSet} imageSizes="100vw" media="(width < 64rem)" fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={desktop.srcSet} imageSizes="100vw" media="(width >= 64rem)" fetchPriority="high" />
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={image.lqip ? { backgroundImage: `url("${stegaClean(image.lqip)}")` } : undefined}
      >
        <picture>
          <source media="(width >= 64rem)" srcSet={desktop.srcSet} sizes="100vw" />
          <img {...mobile} alt={mobile.alt} />
        </picture>
        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/95 to-background/90" />
      </div>
      <div className="flex max-w-195 flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        {section.showLockup && <BrandLockup className="w-62 max-w-full lg:w-89" />}
        {section.eyebrow && <p className="text-sm font-medium">{section.eyebrow}</p>}
        <h1 id={headingId} className="font-heading text-4xl leading-10 lg:text-7xl lg:leading-20">{section.heading}</h1>
        {section.body && <p className="text-xl leading-7 lg:text-lg">{section.body}</p>}
        <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
          {ctas.map((cta, index) => {
            const href = stegaClean(cta?.href);
            if (!cta?.label || !isValidHref(href)) return null;
            return (
              <SiteLink
                key={index}
                href={href}
                className={cn(buttonVariants({
                  variant: index === 0 ? 'default' : 'outline',
                  className: 'min-h-11 h-auto whitespace-normal px-5 py-3 focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current',
                }))}
              >{cta.label}</SiteLink>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
