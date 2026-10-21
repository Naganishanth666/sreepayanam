import { SERVICES } from './servicesCatalog.js';

export const DEFAULT_SITE_ORIGIN = 'https://d16c3ka2ufm5ie.cloudfront.net';
export const PUBLIC_PAGES = {
  '/': ['SreePayanam | Tours and Travels in Trichy', 'Plan domestic and international holidays with SreePayanam, a tours and travels business based in Trichy, Tamil Nadu, serving destinations worldwide.'],
  '/about': ['About SreePayanam | Travel Agency in Trichy', 'Meet SreePayanam, based in Trichy (Tiruchirappalli), Tamil Nadu. Explore our approach to planning tours across India and around the world.'],
  '/packages': ['India & International Tour Packages | SreePayanam Trichy', 'Explore domestic and international tour packages with SreePayanam in Trichy. Compare destinations, itineraries and travel options, then request a personalised quote.'],
  '/contact': ['Contact SreePayanam | Tours and Travels in Trichy', 'Contact SreePayanam in Trichy to plan a holiday in India or overseas. Speak with our team about tour packages, travel services and a personalised itinerary.'],
  '/services': ['Travel Services in Trichy | SreePayanam', 'Explore flight and hotel booking assistance, visa and passport guidance, travel insurance enquiries and vehicle rentals with SreePayanam in Trichy.'],
  '/blogs': ['Travel Articles & Holiday Planning | SreePayanam', 'Read travel articles and holiday planning ideas from SreePayanam, your Trichy-based team for domestic and international tours.'],
  '/brochures': ['Tour Brochures & Itineraries | SreePayanam', 'Browse published tour brochures and itineraries from SreePayanam. Explore destinations across India and worldwide, then enquire with our Trichy team.'],
  '/ai-assistant': ['Plan Your Trip | SreePayanam Trichy', 'Explore itinerary ideas with the SreePayanam trip planner, then discuss your domestic or international holiday with our team in Trichy.'],
};

export function siteOrigin(value = DEFAULT_SITE_ORIGIN) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('The public site URL must be an HTTPS origin, without a path or credentials.');
  }
  return url.origin;
}

export function normalisePath(value = '/') {
  const path = String(value).split(/[?#]/, 1)[0];
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

export function publicPaths() {
  return [...Object.keys(PUBLIC_PAGES), ...SERVICES.map(service => `/services/${service.slug}`)];
}

export function metadataForPath(pathname, origin = DEFAULT_SITE_ORIGIN, pkg) {
  const base = siteOrigin(origin);
  const path = normalisePath(pathname);
  const service = SERVICES.find(item => path === `/services/${item.slug}`);
  const isPackage = /^\/package\/[a-zA-Z0-9_-]+$/.test(path);
  const page = PUBLIC_PAGES[path] || (service && [`${service.title} in Trichy | SreePayanam`, `${service.summary} Contact SreePayanam in Trichy for assistance.`]);
  const isPublic = Boolean(page || isPackage);
  const packageTitle = String(pkg?.title || '').trim();
  const packageDescription = String(pkg?.overview || pkg?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const privateTitle = { '/login': 'Log in', '/admin': 'Admin dashboard', '/bookings': 'Book services', '/checkout': 'Packages' }[path] || (path === '/route' || path.startsWith('/route/') ? 'Find your itinerary' : 'Page not found');
  return {
    title: page?.[0] || (isPackage ? `${packageTitle || 'Tour Package'} | SreePayanam Trichy` : `${privateTitle} | SreePayanam`),
    description: page?.[1] || (isPackage ? (packageDescription || `Explore this ${pkg?.destination || 'holiday'} tour package with SreePayanam in Trichy. View the itinerary and request a quote.`).slice(0, 180) : 'Access your SreePayanam travel account or saved itinerary.'),
    canonical: isPublic ? `${base}${path}` : null,
    image: `${base}/sreepayanam-letterhead-logo.png`,
    robots: isPublic ? 'index,follow,max-image-preview:large' : 'noindex,follow',
    structuredData: path === '/' || path === '/contact' ? {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'TravelAgency', '@id': `${base}/#business`, name: 'SreePayanam', url: `${base}/`, telephone: '+91-92800-77182', logo: `${base}/sreepayanam-letterhead-logo.png`, description: PUBLIC_PAGES['/'][1], address: { '@type': 'PostalAddress', addressLocality: 'Tiruchirappalli', addressRegion: 'Tamil Nadu', addressCountry: 'IN' }, areaServed: 'Worldwide' },
        { '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: 'SreePayanam', publisher: { '@id': `${base}/#business` } },
      ],
    } : null,
  };
}

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function metadataTags(metadata) {
  const tags = [
    ['title', {}, metadata.title],
    ['meta', { name: 'description', content: metadata.description }],
    ['meta', { name: 'robots', content: metadata.robots }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'SreePayanam' }],
    ['meta', { property: 'og:title', content: metadata.title }],
    ['meta', { property: 'og:description', content: metadata.description }],
    ['meta', { property: 'og:image', content: metadata.image }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: metadata.title }],
    ['meta', { name: 'twitter:description', content: metadata.description }],
    ['meta', { name: 'twitter:image', content: metadata.image }],
  ];
  if (metadata.canonical) tags.push(['link', { rel: 'canonical', href: metadata.canonical }], ['meta', { property: 'og:url', content: metadata.canonical }]);
  if (metadata.structuredData) tags.push(['script', { type: 'application/ld+json' }, safeJson(metadata.structuredData)]);
  return tags;
}

export function renderMetadata(metadata) {
  return metadataTags(metadata).map(([tag, attributes, content]) => {
    const attrs = Object.entries({ 'data-site-seo': '', ...attributes }).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join('');
    return `<${tag}${attrs}>${content === undefined ? '' : tag === 'script' ? content : escapeHtml(content)}${tag === 'meta' || tag === 'link' ? '' : `</${tag}>`}`;
  }).join('\n    ');
}

export function applyMetadata(metadata, doc = document) {
  doc.head.querySelectorAll('[data-site-seo]').forEach(element => element.remove());
  // DOM APIs keep package content as text, never executable HTML.
  for (const [tag, attributes, content] of metadataTags(metadata)) {
    const element = doc.createElement(tag);
    element.setAttribute('data-site-seo', '');
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (content !== undefined) element.textContent = content;
    doc.head.appendChild(element);
  }
}

export function renderSitemap(origin, packages = []) {
  const base = siteOrigin(origin);
  const packagePaths = packages.map(pkg => {
    if (!/^[a-zA-Z0-9_-]+$/.test(pkg.packageId || '')) throw new Error('A public package has an invalid sitemap identifier.');
    return `/package/${pkg.packageId}`;
  });
  const paths = [...new Set([...publicPaths(), ...packagePaths])];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${escapeHtml(`${base}${path}`)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function renderRobots(origin) {
  // Let crawlers read page-level noindex. robots.txt is never an access control.
  return `User-agent: *\nAllow: /\nDisallow: /api/\nAllow: /api/packages\nAllow: /api/catalog-categories\n\nSitemap: ${siteOrigin(origin)}/sitemap.xml\n`;
}
