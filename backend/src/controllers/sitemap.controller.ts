import { Request, Response } from 'express';
import {Service} from '../models/Service.model';
import {Category} from '../models/Category.model';
import {Blog} from '../models/Blog.model';
import { catchAsync } from '../utils/catchAsync';

const BASE_URL = process.env.CLIENT_URL || 'https://govservices.com';

/**
 * Generate XML sitemap dynamically.
 * Called at GET /sitemap.xml from the server root.
 */
export const getSitemap = catchAsync(async (_req: Request, res: Response) => {
  // Fetch published data in parallel
  const [services, categories, blogs] = await Promise.all([
    Service.find({ status: 'approved' })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean(),
    Category.find({ isActive: true })
      .select('slug updatedAt')
      .lean(),
    Blog.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .limit(1000)
      .lean(),
  ]);

  const now = new Date().toISOString();

  // ─── Static pages ──────────────────────────────────────────────────────────
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
    { url: '/services', changefreq: 'daily', priority: '0.9', lastmod: now },
    { url: '/categories', changefreq: 'weekly', priority: '0.8', lastmod: now },
    { url: '/blog', changefreq: 'daily', priority: '0.8', lastmod: now },
    { url: '/about', changefreq: 'monthly', priority: '0.5', lastmod: now },
    { url: '/contact', changefreq: 'monthly', priority: '0.5', lastmod: now },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.3', lastmod: now },
    { url: '/terms-of-service', changefreq: 'yearly', priority: '0.3', lastmod: now },
  ];

  // ─── Build XML ─────────────────────────────────────────────────────────────
  const urlEntries: string[] = [];

  // Static pages
  for (const page of staticPages) {
    urlEntries.push(buildUrlEntry(`${BASE_URL}${page.url}`, page.lastmod, page.changefreq, page.priority));
  }

  // Category pages
  for (const cat of categories) {
    const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : now;
    urlEntries.push(buildUrlEntry(`${BASE_URL}/categories/${cat.slug}`, lastmod, 'weekly', '0.7'));
  }

  // Service pages
  for (const svc of services) {
    const lastmod = svc.updatedAt ? new Date(svc.updatedAt).toISOString() : now;
    urlEntries.push(buildUrlEntry(`${BASE_URL}/services/${svc.slug}`, lastmod, 'weekly', '0.8'));
  }

  // Blog posts
  for (const post of blogs) {
    const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : now;
    urlEntries.push(buildUrlEntry(`${BASE_URL}/blog/${post.slug}`, lastmod, 'monthly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
  res.status(200).send(xml);
});

/**
 * Sitemap index (for splitting into multiple sitemaps if needed).
 * Called at GET /sitemap-index.xml
 */
export const getSitemapIndex = catchAsync(async (_req: Request, res: Response) => {
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache 24 hours
  res.status(200).send(xml);
});

/**
 * Serve robots.txt
 */
export const getRobotsTxt = (_req: Request, res: Response): void => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Block AI crawlers from scraping the platform
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-index.xml
`;

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.status(200).send(robotsTxt);
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildUrlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
