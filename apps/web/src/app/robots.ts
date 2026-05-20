import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login/'],
    },
    sitemap: 'https://motorsigorta-12dlq75kj-cihans-projects-a0212235.vercel.app/sitemap.xml',
  };
}
