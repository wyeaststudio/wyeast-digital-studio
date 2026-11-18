export function PageHeader({ title }: { title: string }) {
  return (
    <header className="bg-background px-6 py-16 text-foreground lg:py-28">
      <h1 className="mx-auto max-w-300 font-heading text-4xl lg:text-6xl">{title}</h1>
    </header>
  );
}
