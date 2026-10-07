const fs = require('node:fs/promises');
const path = require('node:path');
const { hubs } = require('../data/regionalRoutes');
const { getPlaceContext } = require('../utils/placeContext');

const outputPath = path.join(__dirname, '../data/regionalPlaceContext.json');
const names = [...new Set(Object.values(hubs).flatMap(([, ...places]) => places))].sort();

const run = async () => {
  const previous = await fs.readFile(outputPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const result = { ...previous };
  const pending = names.filter(name => !result[name]);
  let completed = 0;
  for (let index = 0; index < pending.length; index += 2) {
    const batch = pending.slice(index, index + 2);
    const settled = await Promise.all(batch.map(async name => [name, await getPlaceContext(name)]));
    for (const [name, context] of settled) result[name] = context;
    completed += batch.length;
    if (completed % 20 === 0 || completed === pending.length) {
      process.stdout.write(`Retried ${completed}/${pending.length}\n`);
      await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    }
  }
  const missing = names.filter(name => !result[name]);
  console.log(JSON.stringify({ total: names.length, sourced: names.length - missing.length, missing }));
};

run().catch(error => { console.error(error); process.exitCode = 1; });
