import { RichText } from '@/components/rich-text/rich-text';
import { Section } from './section';
import type { BlockProps } from './types';

export function RichTextSection({ section, headingId, ...props }: BlockProps<'richTextSection'>) {
  return (
    <Section
      {...props} headingId={section.heading ? headingId : undefined}
      anchor={section.anchor} surface={section.surface} innerClassName="max-w-prose space-y-8"
    >
      {section.heading && <h2 id={headingId} className="text-3xl leading-9 lg:text-4xl lg:leading-10">{section.heading}</h2>}
      <RichText variant="prose" value={section.body} className="text-base leading-7" />
    </Section>
  );
}
