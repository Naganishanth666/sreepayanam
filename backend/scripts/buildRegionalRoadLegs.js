const fs = require('node:fs/promises');
const path = require('node:path');
const { hubs, circuits } = require('../data/regionalRoutes');
const cityContext = require('../data/regionalCityContext.json');

const coordinatesPath = path.join(__dirname, '../data/regionalCoordinates.json');
const legsPath = path.join(__dirname, '../data/regionalRoadLegs.json');
const state = {
  Basara: 'Telangana', Belur: 'Karnataka', Chitrakoot: 'Uttar Pradesh',
  Gokarna: 'Karnataka', Katra: 'Jammu and Kashmir', Kufri: 'Himachal Pradesh',
  Manali: 'Himachal Pradesh', Osian: 'Rajasthan', Puducherry: 'Puducherry', Salem: 'Tamil Nadu'
};
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const readJson = async file => fs.readFile(file, 'utf8').then(JSON.parse).catch(() => ({}));
const requestJson = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': 'SreePayanam route research (public tourism itinerary data)' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
};

const run = async () => {
  const coordinates = await readJson(coordinatesPath);
  const cities = [...new Set(Object.values(hubs).map(([city]) => city))];
  for (const city of cities) {
    if (cityContext[city]?.coordinates || coordinates[city]) continue;
    const query = `${city === 'Basara' ? 'Basar, Nirmal' : city}, ${state[city] || 'India'}, India`;
    const result = await requestJson(`https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q: query, format: 'json', limit: '1' })}`);
    if (result[0]) {
      coordinates[city] = { lat: Number(result[0].lat), lon: Number(result[0].lon),
        sourceUrl: `https://www.openstreetmap.org/${result[0].osm_type}/${result[0].osm_id}`,
        displayName: result[0].display_name };
      console.log(`${city}: ${coordinates[city].displayName}`);
    } else console.log(`${city}: no map result`);
    await fs.writeFile(coordinatesPath, `${JSON.stringify(coordinates, null, 2)}\n`);
    await pause(1150); // Nominatim public policy: no more than one request per second.
  }

  const legs = await readJson(legsPath);
  const routes = Object.values(circuits).flat();
  for (let index = 0; index < routes.length; index++) {
    const [name, ...codes] = routes[index];
    if (codes.slice(1).every((code, stop) => legs[`${codes[stop]}-${code}`])) continue;
    const points = codes.map(code => {
      const city = hubs[code][0];
      return cityContext[city]?.coordinates || coordinates[city];
    });
    if (points.some(point => !point)) {
      console.log(`${name}: missing coordinates`);
      continue;
    }
    const pathString = points.map(point => `${point.lon},${point.lat}`).join(';');
    try {
      const result = await requestJson(`https://router.project-osrm.org/route/v1/driving/${pathString}?overview=false&steps=false`);
      if (result.code !== 'Ok' || result.routes?.[0]?.legs?.length !== 3) throw new Error('No complete route');
      result.routes[0].legs.forEach((leg, stop) => {
        legs[`${codes[stop]}-${codes[stop + 1]}`] = {
          roadKm: Math.round(leg.distance / 1000),
          baseDriveMinutes: Math.round(leg.duration / 60),
          sourceUrl: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${points[stop].lat}%2C${points[stop].lon}%3B${points[stop + 1].lat}%2C${points[stop + 1].lon}`,
          checkedAt: '2026-10-07'
        };
      });
      console.log(`${index + 1}/${routes.length}: ${name}`);
      await fs.writeFile(legsPath, `${JSON.stringify(legs, null, 2)}\n`);
    } catch (error) { console.log(`${name}: ${error.message}`); }
    await pause(650);
  }
  console.log(JSON.stringify({ cities: Object.keys(coordinates).length, roadLegs: Object.keys(legs).length }));
};

run().catch(error => { console.error(error); process.exitCode = 1; });
