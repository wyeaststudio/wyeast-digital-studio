'use client';

import { ErrorContent } from '@/components/layout/error-content';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorContent onRetry={unstable_retry} digest={error.digest} />;
}
