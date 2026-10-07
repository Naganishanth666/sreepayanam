const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const Package = require('../models/Package');
const packageRoutes = require('../routes/packageRoutes');

const app = express();
app.use('/api/packages', packageRoutes);
const originalFind = Package.find;
const originalFindOne = Package.findOne;

test('public API serves exactly the 220 researched plans and hides an unreviewed template', async () => {
  Package.find = () => {
    const result = Promise.resolve([]);
    result.sort = () => Promise.resolve([]);
    return result;
  };
  Package.findOne = async ({ packageId }) => packageId === 'SP-STD-TEST' ? {
    packageId, title: 'Old template', status: 'Published', isActive: true,
    durationDays: 1, itinerary: [{ day: 1, title: 'Generic day', activities: 'Select specific visits.' }]
  } : null;
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const list = await fetch(`${base}/api/packages`).then(response => response.json());
    assert.equal(list.length, 220);
    assert.equal(list.filter(pkg => pkg.regionScope === 'North India').length, 80);
    assert.ok(!('itinerary' in list[0]), 'the list response remains compact');
    const detail = await fetch(`${base}/api/packages/SP-REG-TN-001`).then(response => response.json());
    assert.ok(detail.itinerary[0].schedule.some(stop => stop.kind === 'visit'));
    const template = await fetch(`${base}/api/packages/SP-STD-TEST`);
    assert.equal(template.status, 403);
  } finally {
    Package.find = originalFind;
    Package.findOne = originalFindOne;
    await new Promise(resolve => server.close(resolve));
  }
});
