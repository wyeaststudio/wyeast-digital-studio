import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Agency Template Active
        </h1>
        <p className="text-xl text-muted-foreground">
          Next.js + Tailwind CSS + Shadcn UI + Sanity.io
        </p>

        <Card className="border-border bg-card text-left">
          <CardHeader>
            <CardTitle>System Integrations Synced</CardTitle>
            <CardDescription>
              Your Figma variable tokens are mapped to Tailwind classes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To manage client data, head over to the embedded content studio.
            </p>
            <div className="flex gap-4">
              {/* Styled cleanly via the variant helper class directly on Next.js Link */}
              <Link
                href="/studio"
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: 'default' })}
              >
                Open Sanity Studio
              </Link>

              <Link href="#" className={buttonVariants({ variant: 'outline' })}>
                Documentation
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
