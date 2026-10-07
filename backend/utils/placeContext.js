// Source-linked destination context. We only display a photograph when its
// Wikimedia Commons file metadata confirms a reusable licence.
const cache = new Map();
const TTL = 24 * 60 * 60 * 1000;
const USER_AGENT = 'SreePayanamRoutePlanner/1.0 (https://sreepayanam.vercel.app)';
const clean = (value, length) => String(value || '').replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, length);

const fetchJson = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(4500) });
  if (!response.ok) throw new Error(`Wikimedia request returned ${response.status}`);
  return response.json();
};

const wikiPage = async title => {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', redirects: '1', titles: title,
    prop: 'extracts|pageimages|coordinates|pageprops', exintro: '1', explaintext: '1', pithumbsize: '860', colimit: '1' });
  return (await fetchJson(url))?.query?.pages?.[0];
};

const commonsImage = async filename => {
  if (!filename) return null;
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', titles: `File:${filename}`, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '860' });
  const payload = await fetchJson(url);
  const page = payload?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  const license = clean(info?.extmetadata?.LicenseShortName?.value, 100);
  const author = clean(info?.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, ''), 160);
  const imageUrl = info?.thumburl || info?.url;
  if (!/^(CC BY(?:-SA)?(?: [0-9.]+)?|CC0|Public domain)/i.test(license) || !/^https:\/\/upload\.wikimedia\.org\//.test(imageUrl || '')) return null;
  return { imageUrl, imageCredit: `${author || 'Wikimedia Commons contributor'} · ${license}`, imageCreditUrl: info.descriptionurl };
};

const getPlaceContext = async place => {
  const name = clean(place, 160);
  if (!name) return null;
  const key = name.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) return cached.value;
  try {
    let page = await wikiPage(name);
    const shortName = name.split(',')[0].trim();
    if ((!page || page.missing || !page.extract || page.pageprops?.disambiguation !== undefined) && shortName !== name) {
      page = await wikiPage(shortName);
    }
    if (!page || page.missing || !page.extract || page.pageprops?.disambiguation !== undefined) return null;
    const description = clean(page.extract.split(/(?<=[.!?])\s+/).slice(0, 2).join(' '), 500);
    const coordinate = page.coordinates?.[0];
    const context = {
      name, title: clean(page.title, 160), description,
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      coordinates: Number.isFinite(coordinate?.lat) && Number.isFinite(coordinate?.lon)
        ? { lat: coordinate.lat, lon: coordinate.lon } : null,
      visitingInfo: 'Check the venue’s official opening, darshan and event schedule before travelling.'
    };
    if (page.pageimage) {
      try { Object.assign(context, await commonsImage(page.pageimage)); } catch { /* Keep sourced text if image metadata is unavailable. */ }
    }
    cache.set(key, { at: Date.now(), value: context });
    if (cache.size > 250) cache.delete(cache.keys().next().value);
    return context;
  } catch { return null; }
};

const getPlaceContexts = async places => (await Promise.all((places || []).slice(0, 15).map(getPlaceContext))).filter(Boolean);

module.exports = { getPlaceContext, getPlaceContexts };
