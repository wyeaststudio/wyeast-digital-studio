export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-05';

// We provide a safe placeholder fallback string if the process.env isn't hydrated yet on the client
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing env variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  // If we are in development mode, don't hard crash the app for missing project keys
  if (v === undefined && process.env.NODE_ENV === 'development') {
    return 'development-placeholder' as unknown as T;
  }

  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
