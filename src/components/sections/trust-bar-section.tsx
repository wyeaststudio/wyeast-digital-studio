import { Icon } from './icons';
import { Section } from './section';
import type { BlockProps } from './types';

export function TrustBarSection({ section, ...props }: BlockProps<'trustBarSection'>) {
  return (
    <Section {...props} headingId={undefined} anchor={section.anchor} surface={section.surface ?? 'primary'} className="py-0 lg:py-6">
      <ul className="flex flex-col lg:flex-row lg:divide-x lg:divide-current">
        {section.items?.map((item) => (
          <li key={item._key} className="flex min-w-0 flex-1 items-center gap-3 py-5 text-sm font-medium lg:justify-center lg:px-6 lg:py-2">
            <Icon name={item.icon} className="size-5 shrink-0" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
