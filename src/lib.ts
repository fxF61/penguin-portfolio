import { getCollection } from 'astro:content';

export async function getWriteups() {
  const all = await getCollection('writeups', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNotes() {
  const all = await getCollection('notes', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Prefix a root-relative internal path with the deploy base path
 * (`/penguin-portfolio` in production, `/` in dev). Use for every internal
 * link/asset so they resolve correctly under the GitHub Pages project base.
 * e.g. withBase('/writeups/') → '/penguin-portfolio/writeups/' in prod.
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return base + '/' + String(path).replace(/^\/+/, '');
}
