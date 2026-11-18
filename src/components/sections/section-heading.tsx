export function SectionHeading({ heading, headingId, eyebrow, intro }: {
  heading: string;
  headingId: string;
  eyebrow?: string | null;
  intro?: string | null;
}) {
  return (
    <div className="mx-auto flex max-w-200 flex-col items-center gap-3 text-center lg:gap-4">
      {eyebrow && <p className="rounded-lg border border-current px-2.5 py-0.5 text-xs font-medium">{eyebrow}</p>}
      <h2 id={headingId} className="font-heading text-3xl leading-9 lg:text-4xl lg:leading-10">{heading}</h2>
      {intro && <p className="text-sm leading-5 lg:text-base lg:leading-6">{intro}</p>}
    </div>
  );
}
