const fs = require('node:fs');
const path = require('node:path');
const { packages: seeds } = require('../data/curatedLeisureCatalog');

const outputPath = path.join(__dirname, '..', 'data', 'curatedRouteImages.json');
const licensePattern = /^(CC BY(?:-SA)?(?: [0-9.]+)?|CC0|Public domain)$/i;
const handCuratedImages = {
  'SP-LEI-FAM-SI-001': {
    'Abbey Falls viewpoint': {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Abbey_Falls_%2C_Karnataka.jpg/960px-Abbey_Falls_%2C_Karnataka.jpg',
      imageCredit: 'Harvinder Chandigarh · CC BY 4.0 · Wikimedia Commons',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Abbey_Falls_,_Karnataka.jpg',
      imageTitle: 'Abbey Falls , Karnataka.jpg',
      imageDescription: 'Abbey Falls (also known as Abbi Falls and Abbe Falls) is a waterfall in Kodagu, Karnataka, India.'
    }
  },
  'SP-LEI-HR-TN-001': {
    'Kodaikanal Lake promenade': {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Boat_in_Kodaikanal_lake.jpg/1280px-Boat_in_Kodaikanal_lake.jpg',
      imageCredit: 'Thamizhpparithi Maari · CC BY-SA 4.0 · Wikimedia Commons',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Boat_in_Kodaikanal_lake.jpg',
      imageTitle: 'Boat in Kodaikanal lake.jpg',
      imageDescription: 'Boat in Kodaikanal lake, Dindigul District, Tamil Nadu, India.'
    }
  },
  'SP-LEI-ADV-NI-002': {
    'Bir landing site': {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bir-Billing_%28HP%29%2C_India.jpg/960px-Bir-Billing_%28HP%29%2C_India.jpg',
      imageCredit: 'Deepak Bhargava · CC BY-SA 4.0 · Wikimedia Commons',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Bir-Billing_(HP),_India.jpg',
      imageTitle: 'Bir-Billing (HP), India.jpg',
      imageDescription: 'Sunset at the landing site, Bir Billing, Himachal Pradesh, India.'
    },
    'Billing paragliding take-off site': {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Paragliding%2C_Bir-Billing_%28HP%29%2C_India.jpg/960px-Paragliding%2C_Bir-Billing_%28HP%29%2C_India.jpg',
      imageCredit: 'Deepak Bhargava · CC BY-SA 4.0 · Wikimedia Commons',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Paragliding,_Bir-Billing_(HP),_India.jpg',
      imageTitle: 'Paragliding, Bir-Billing (HP), India.jpg',
      imageDescription: 'Paragliding site at Bir Billing, Himachal Pradesh, India.'
    }
  }
};
const genericWords = new Set([
  'a', 'an', 'and', 'at', 'area', 'arrival', 'boarding', 'candidate', 'city', 'coast', 'entry',
  'garden', 'hotel', 'india', 'indian', 'landing', 'licensed', 'local', 'lower', 'market',
  'meeting', 'nature', 'northern', 'park', 'path', 'point', 'precinct', 'promenade', 'public',
  'road', 'route', 'safari', 'school', 'session', 'site', 'south', 'southern', 'stop', 'tamil',
  'nadu', 'the', 'trail', 'upper', 'venue', 'view', 'viewpoint', 'walk', 'zone', 'boat', 'jetty',
  'lake', 'park', 'beach', 'garden', 'river', 'falls', 'waterfall', 'hill', 'forest', 'coast',
  'shore', 'promenade', 'island', 'dunes', 'valley', 'point', 'estate', 'path', 'drive', 'walkway',
  'waterfront', 'beachfront', 'rocks', 'rock', 'mountain', 'mountains', 'cityscape', 'scenic', 'view',
  'half', 'moon', 'kali'
]);
const searchStopWords = new Set([
  'a', 'an', 'and', 'area', 'at', 'access', 'approach', 'arrival', 'boarding', 'by', 'candidate',
  'entry', 'landing', 'licensed', 'local', 'lower', 'market', 'near', 'of', 'on', 'precinct',
  'public', 'route', 'the', 'upper', 'visitor', 'view', 'viewpoint', 'zone', 'promenade', 'point',
  'path', 's'
]);
const broadGeographyWords = new Set(['india', 'indian', 'north', 'south', 'east', 'west', 'northeast', 'tamil', 'nadu', 'island', 'islands']);

const plainText = value => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ').trim();
const words = value => String(value || '').replace(/[’']s\b/gi, '').normalize('NFKD').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
const coreWords = value => words(value).filter(word => !genericWords.has(word));
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const searchPlaceImage = async (place, destination, alternateLocations = [], isRouteCover = false) => {
  if (/^(candidate |meeting room|conference session)/i.test(place)) return null;

  const placeTokens = words(place).filter(word => !searchStopWords.has(word));
  const locations = [...new Set([destination, ...alternateLocations].map(value => String(value || '').trim()).filter(Boolean))];
  const searchTerms = [...new Set(placeTokens)];
  const queries = [
    [...new Set([...searchTerms, ...words(locations[0] || '')])].join(' '),
    searchTerms.join(' ')
  ].filter(Boolean).filter((query, index, values) => values.indexOf(query) === index);
  const placeWords = words(place).filter(word => !searchStopWords.has(word));
  const locationWords = new Set(locations.flatMap(location => words(location)).filter(word => !broadGeographyWords.has(word)));
  const cityWords = new Set(words(destination).filter(word => !genericWords.has(word) && word.length > 3));
  const distinctivePlaceWords = placeWords.filter(word => !genericWords.has(word) && !locationWords.has(word));

  for (const query of queries) {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', generator: 'search',
      gsrsearch: query, gsrnamespace: '6', gsrlimit: '8',
      prop: 'imageinfo', iiprop: 'url|extmetadata|mime', iiurlwidth: '1200'
    });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'SreePayanamCatalogImageCurator/1.0 (https://sreepayanam.vercel.app)',
            Accept: 'application/json'
          },
          signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error(`Commons returned ${response.status}`);
        const payload = await response.json();
        const candidates = (payload.query?.pages || []).map(page => {
          const info = page.imageinfo?.[0];
          const metadata = info?.extmetadata || {};
          const title = plainText(page.title?.replace(/^File:/, ''));
          const description = plainText(metadata.ImageDescription?.value);
          const titleWords = new Set(words(title));
          const descriptionWords = new Set(words(description));
          const license = plainText(metadata.LicenseShortName?.value);
          const author = plainText(metadata.Artist?.value) || 'Wikimedia Commons contributor';
          const imageUrl = info?.thumburl || info?.url;
          const creditUrl = info?.descriptionurl;
          const placeTitleMatches = placeWords.filter(word => titleWords.has(word)).length;
          const distinctiveTitleMatches = distinctivePlaceWords.filter(word => titleWords.has(word)).length;
          const placeDescriptionMatches = placeWords.filter(word => descriptionWords.has(word)).length;
          const distinctiveDescriptionMatches = distinctivePlaceWords.filter(word => descriptionWords.has(word)).length;
          const locationTitleMatches = [...locationWords].filter(word => titleWords.has(word)).length;
          const locationDescriptionMatches = [...locationWords].filter(word => descriptionWords.has(word)).length;
          const cityTitleMatches = words(destination).filter(word => titleWords.has(word)).length;
          const hasRouteImageEvidence = distinctiveTitleMatches > 0
            || (distinctiveDescriptionMatches > 0 && (locationTitleMatches > 0 || cityTitleMatches > 0));
          const routeTitleMatches = [...cityWords].filter(word => titleWords.has(word)).length;
          const routeDescriptionMatches = [...cityWords].filter(word => descriptionWords.has(word)).length;
          const relevant = isRouteCover
            ? routeTitleMatches > 0 || routeDescriptionMatches > 0
            : locationTitleMatches > 0 && hasRouteImageEvidence;
          const score = distinctiveTitleMatches * 8 + distinctiveDescriptionMatches * 5
            + placeTitleMatches * 2 + placeDescriptionMatches + cityTitleMatches;
          return { title, description, license, author, imageUrl, creditUrl, mime: info?.mime, relevant, score };
        }).filter(image => image.relevant
          && licensePattern.test(image.license)
          && /^image\//i.test(image.mime || '')
          && /^https:\/\/(?:thumb|upload)\.wikimedia\.org\//.test(image.imageUrl || '')
          && /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(image.creditUrl || ''))
          .sort((left, right) => right.score - left.score);

        const image = candidates[0];
        if (image) {
          return {
            imageUrl: image.imageUrl,
            imageCredit: `${image.author} · ${image.license} · Wikimedia Commons`,
            imageCreditUrl: image.creditUrl,
            imageTitle: image.title,
            imageDescription: image.description
          };
        }
        break;
      } catch (error) {
        if (attempt === 1) break;
        await wait(250 * (attempt + 1));
      }
    }
    await wait(100);
  }
  return null;
};

const chunks = (values, size) => Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));

const main = async () => {
  const locations = new Map();
  for (const seed of seeds) {
    const city = String(seed.destination || '').split(',')[0].replace(/\([^)]*\)/g, '').trim();
    const parentheticalLocations = [...String(seed.destination || '').matchAll(/\(([^)]+)\)/g)].map(match => match[1]);
    const alternateLocations = [seed.startingCity, seed.endingCity, ...parentheticalLocations,
      ...(seed.destinationStates || []), seed.regionScope]
      .filter(location => location && location !== city);
    const stops = (seed.itinerary || []).flatMap(day => day.schedule || [])
      .filter(item => item.kind === 'visit' && item.place)
      .map(item => item.place);
    for (const place of new Set(stops)) locations.set(`${seed.packageId}::${place}`, {
      packageId: seed.packageId, place, city, alternateLocations
    });
  }

  const entries = [...locations.values()];
  const manifest = {};
  let processed = 0;
  for (const batch of chunks(entries, 6)) {
    const results = await Promise.all(batch.map(async entry => ({
      ...entry,
      image: await searchPlaceImage(entry.place, entry.city, entry.alternateLocations)
    })));
    for (const result of results) {
      if (result.image) {
        manifest[result.packageId] ||= {};
        manifest[result.packageId][result.place] = result.image;
      }
      processed += 1;
    }
    await wait(200);
  }

  for (const seed of seeds) {
    if (manifest[seed.packageId]) continue;
    const city = String(seed.destination || '').split(',')[0].replace(/\([^)]*\)/g, '').trim();
    const alternateLocations = [seed.startingCity, seed.endingCity, ...(seed.destinationStates || []), seed.regionScope]
      .filter(location => location && location !== city);
    const image = await searchPlaceImage(city, city, alternateLocations, true);
    if (image) manifest[seed.packageId] = { __routeCover: image };
    await wait(100);
  }

  for (const [packageId, images] of Object.entries(handCuratedImages)) {
    manifest[packageId] = { ...manifest[packageId], ...images };
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const savedCount = Object.values(manifest).reduce((sum, images) => sum + Object.keys(images).length, 0);
  const missing = entries.filter(entry => !manifest[entry.packageId]?.[entry.place]).map(entry => `${entry.packageId}: ${entry.place}`);
  console.log(JSON.stringify({ processed, savedCount, missing }, null, 2));
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
