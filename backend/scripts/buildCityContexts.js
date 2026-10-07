const fs = require('node:fs/promises');
const path = require('node:path');
const { hubs } = require('../data/regionalRoutes');
const { getPlaceContext } = require('../utils/placeContext');
const outputPath = path.join(__dirname, '../data/regionalCityContext.json');
const names = [...new Set(Object.values(hubs).map(([city]) => city))].sort();

const run = async () => {
  const previous = await fs.readFile(outputPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const result = { ...previous };
  const pending = names.filter(name => !result[name]);
  for (let index = 0; index < pending.length; index += 3) {
    const batch = pending.slice(index, index + 3);
    const settled = await Promise.all(batch.map(async name => [name, await getPlaceContext(name)]));
    for (const [name, context] of settled) result[name] = context;
    if ((index + batch.length) % 15 === 0 || index + batch.length === pending.length) {
      process.stdout.write(`Checked ${index + batch.length}/${pending.length}\n`);
      await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    }
  }
  console.log(JSON.stringify({ total: names.length, sourced: names.filter(name => result[name]).length,
    missing: names.filter(name => !result[name]) }));
};

run().catch(error => { console.error(error); process.exitCode = 1; });
