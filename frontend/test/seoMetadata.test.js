import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { metadataForPath, publicPaths, renderMetadata, renderRobots, renderSitemap, siteOrigin } from '../src/utils/seoMetadata.js';

const origin = 'https://owned.example';

test('public pages target the confirmed location and canonicalise filters and trailing slashes', () => {
  const home = metadataForPath('/', origin);
  assert.match(home.title, /Tours and Travels in Trichy/);
  assert.match(home.description, /worldwide/);
  assert.equal(metadataForPath('/packages/?destination=India#results', origin).canonical, `${origin}/packages`);
  assert.match(metadataForPath('/services/visa', origin).title, /Visa Services in Trichy/);
  assert.equal(home.structuredData['@graph'][0].address.addressLocality, 'Tiruchirappalli');
  assert.equal(home.structuredData['@graph'][0].address.streetAddress, undefined);
});

test('personal itineraries, admin, accounts and unknown pages never get indexable metadata', () => {
  for (const path of ['/admin', '/login', '/bookings', '/checkout', '/route', '/route/private-reference', '/unknown', '/services/unknown']) {
    const metadata = metadataForPath(path, origin);
    assert.equal(metadata.robots, 'noindex,follow', path);
    assert.equal(metadata.canonical, null, path);
    assert.equal(metadata.structuredData, null, path);
  }
});

test('public package metadata uses published content and safely escapes HTML', () => {
  const metadata = metadataForPath('/package/TOUR-1', origin, { title: '</title><script>alert(1)</script>', overview: '<b>A holiday</b> around India.' });
  assert.equal(metadata.description, 'A holiday around India.');
  assert.equal(metadata.canonical, `${origin}/package/TOUR-1`);
  assert.doesNotMatch(renderMetadata(metadata), /<script>alert/);
  const home = metadataForPath('/', origin);
  home.structuredData.name = '</script><script>alert(1)</script>';
  assert.doesNotMatch(renderMetadata(home), /<script>alert/);
});

test('sitemap contains public services and package URLs without personal or filtered URLs', () => {
  const xml = renderSitemap(origin, [{ packageId: 'TOUR-1' }, { packageId: 'TOUR-1' }]);
  assert.match(xml, /https:\/\/owned.example\/services\/visa/);
  assert.equal((xml.match(/\/package\/TOUR-1/g) || []).length, 1);
  assert.doesNotMatch(xml, /\/admin|\/login|\/bookings|\/route|\/api\//);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) assert.equal(new URL(match[1]).search, '');
  assert.throws(() => renderSitemap(origin, [{ packageId: '../private?token=secret' }]));
  assert.match(renderRobots(origin), /Sitemap: https:\/\/owned.example\/sitemap.xml/);
  assert.match(renderRobots(origin), /Allow: \/api\/packages/);
  assert.match(renderRobots(origin), /Allow: \/api\/catalog-categories/);
  assert.doesNotMatch(renderRobots(origin), /Disallow: \/assets/);
  assert.throws(() => siteOrigin('https://user:password@example.com'));
  assert.throws(() => siteOrigin('http://example.com'));
});

test('edge routing serves the matching public HTML and keeps new tours, private routes and query strings working', async () => {
  const template = await readFile(new URL('../../aws/website.yaml', import.meta.url), 'utf8');
  const code = template.split('      FunctionCode: |\n')[1].split('\n  Distribution:')[0].split('\n').map(line => line.slice(8)).join('\n');
  const context = vm.createContext({});
  vm.runInContext(code, context);
  const route = uri => context.handler({ request: { uri, querystring: { ref: { value: 'original' } } } });
  for (const path of publicPaths()) assert.equal(route(path).uri, path === '/' ? '/index.html' : `/seo${path}.html`, path);
  assert.equal(route('/contact/').uri, '/seo/contact.html');
  assert.equal(route('/package/NEW-TOUR-2027').uri, '/seo/package.html');
  assert.equal(route('/route/customer-reference').uri, '/seo/private.html');
  assert.equal(route('/bookings').uri, '/seo/private.html');
  assert.equal(route('/unknown').uri, '/seo/notfound.html');
  assert.equal(route('/assets/app-hash.js').uri, '/assets/app-hash.js');
  assert.equal(route('/api/packages').uri, '/api/packages');
  assert.equal(route('/sitemap.xml').uri, '/sitemap.xml');
  assert.equal(route('/contact').querystring.ref.value, 'original');
});
