// Server-only Sanity secrets. Never import this module from client components.

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

export const getReadToken = () => required('SANITY_API_READ_TOKEN');
export const getRevalidateSecret = () => required('SANITY_REVALIDATE_SECRET');
