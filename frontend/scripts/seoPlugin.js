import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SITE_ORIGIN, metadataForPath, publicPaths, renderMetadata, renderRobots, renderSitemap, siteOrigin } from '../src/utils/seoMetadata.js';

export function seoPlugin(env) {
  const origin = siteOrigin(env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_ORIGIN);
  let output;
  const withMetadata = (html, metadata) => html.replace(/<!-- SITE_SEO_START -->[\s\S]*?<!-- SITE_SEO_END -->/, `<!-- SITE_SEO_START -->\n    ${renderMetadata(metadata)}\n    <!-- SITE_SEO_END -->`);
  return {
    name: 'sreepayanam-search-metadata',
    apply: 'build',
    configResolved(config) { output = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml(html) { return withMetadata(html, metadataForPath('/', origin)); },
    async closeBundle() {
      const index = await readFile(path.join(output, 'index.html'), 'utf8');
      if (!index.includes('<!-- SITE_SEO_START -->') || !index.includes('<!-- SITE_SEO_END -->')) throw new Error('The built HTML is missing its search metadata markers.');
      let packages = [];
      if (env.VITE_SITEMAP_API_ORIGIN) {
        const response = await fetch(`${siteOrigin(env.VITE_SITEMAP_API_ORIGIN)}/api/packages`, { signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error(`Public catalogue sitemap fetch failed: HTTP ${response.status}`);
        packages = await response.json();
        if (!Array.isArray(packages) || packages.length === 0) throw new Error('The public catalogue sitemap response is empty or invalid.');
      } else if (env.VITE_AWS_PRIVATE_ORIGIN === 'true') {
        throw new Error('AWS builds require VITE_SITEMAP_API_ORIGIN so published tour pages are included in the sitemap.');
      }
      const pages = publicPaths().filter(route => route !== '/').map(route => [`seo${route}.html`, metadataForPath(route, origin)]);
      pages.push(['seo/private.html', metadataForPath('/login', origin)]);
      pages.push(['seo/notfound.html', { ...metadataForPath('/not-found', origin), title: 'Page Not Found | SreePayanam' }]);
      // New tour URLs must keep working between builds. React adds their own canonical after loading.
      pages.push(['seo/package.html', { ...metadataForPath('/package/pending', origin), canonical: null }]);
      for (const [filename, metadata] of pages) {
        const target = path.join(output, filename);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, withMetadata(index, metadata));
      }
      await writeFile(path.join(output, 'robots.txt'), renderRobots(origin));
      await writeFile(path.join(output, 'sitemap.xml'), renderSitemap(origin, packages));
      console.log(`Search setup: ${publicPaths().length} public pages and ${packages.length} published tour URLs.`);
    },
  };
}
