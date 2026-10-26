import { useEffect } from 'react';
import { COMPANY, SITE_URL } from '../../lib/company';

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function Seo({ title, description, path, noIndex = false, type = 'website' }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(COMPANY.shortName)
      ? title
      : `${title} | ${COMPANY.shortName} Business & ICT Consultants`;
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', COMPANY.name);

    if (path) {
      const canonical = `${SITE_URL}${path === '/' ? '' : path}`;
      upsertCanonical(canonical);
      upsertMeta('property', 'og:url', canonical);
    }
  }, [title, description, path, noIndex, type]);

  return null;
}
