'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StatusPage } from './status-page';

export interface ErrorContentProps {
  onRetry: () => void;
  /** Server error identifier, safe to show; the message and stack never are (SHELL-R25). */
  digest?: string;
  className?: string;
}

const actionClass = 'h-11 px-5 text-base';

export function ErrorContent({ onRetry, digest, className }: ErrorContentProps) {
  return (
    <StatusPage
      title="Something went wrong"
      className={className}
      actions={
        <>
          <Button onClick={onRetry} className={actionClass}>
            Try again
          </Button>
          {/* A full page load, since the client app may be in a broken state. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={cn(buttonVariants({ variant: 'outline' }), actionClass)}>
            Go to the home page
          </a>
        </>
      }
    >
      <p>Sorry, this page didn&apos;t load. Please try again in a moment.</p>
      {digest && <p className="text-sm">Reference: {digest}</p>}
    </StatusPage>
  );
}
