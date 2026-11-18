import { createImageUrlBuilder } from '@sanity/image-url';
import type { ImageLoaderProps } from 'next/image';
import { stegaClean } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(stegaClean(source));
}

/** Resize an already cropped URL, preserving its aspect ratio and hotspot rectangle. */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  const originalWidth = Number(url.searchParams.get('w'));
  const originalHeight = Number(url.searchParams.get('h'));
  if (originalWidth > 0 && originalHeight > 0) {
    url.searchParams.set('h', String(Math.max(1, Math.round(width * originalHeight / originalWidth))));
  }
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 75));
  url.searchParams.set('auto', 'format');
  return url.toString();
}
