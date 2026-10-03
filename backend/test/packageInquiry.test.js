const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const Package = require('../models/Package');
const Enquiry = require('../models/Enquiry');
const packageRoutes = require('../routes/packageRoutes');
const enquiryRoutes = require('../routes/enquiryRoutes');
const bookingRoutes = require('../routes/bookingRoutes');

const originalFindOne = Package.findOne;
const originalEnquiryFindOne = Enquiry.findOne;
const originalSave = Enquiry.prototype.save;
const app = express();
app.use(express.json());
app.use('/api/packages', packageRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/bookings', bookingRoutes);

const withServer = async callback => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally { await new Promise(resolve => server.close(resolve)); }
};

test.after(() => {
  Package.findOne = originalFindOne;
  Enquiry.findOne = originalEnquiryFindOne;
  Enquiry.prototype.save = originalSave;
});

test('public package response excludes all stored commercial amounts', async () => {
  Package.findOne = async () => ({
    packageId: 'SP-PKG-TEST', title: 'Trichy temples', status: 'Approved', isActive: true,
    baseCost: 100000, originalPrice: 154000, offerPrice: 146300,
    priceBreakdown: 'Private supplier cost', costingBreakdown: { markupPercent: 40 },
    brochureUrl: 'https://example.com/old-priced-brochure.pdf'
  });
  await withServer(async base => {
    const response = await fetch(`${base}/api/packages/SP-PKG-TEST`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.title, 'Trichy temples');
    for (const key of ['baseCost', 'originalPrice', 'offerPrice', 'priceBreakdown', 'costingBreakdown', 'brochureUrl']) {
      assert.ok(!(key in body), `${key} must stay private`);
    }
  });
});

test('package enquiry requires consent and saves a staff-review route with selected places', async () => {
  Package.findOne = async () => ({
    packageId: 'SP-PKG-TEST', title: 'Trichy temples', destination: 'Trichy',
    durationDays: 2, durationNights: 1, startingCity: 'Chennai', endingCity: 'Chennai',
    overview: 'A temple circuit', itinerary: [{ title: 'Rockfort', activities: 'Visit temple', hotel: '3 Star hotel', mealPlan: 'Breakfast', transport: 'Car' }]
  });
  Enquiry.findOne = async () => null;
  let saved;
  Enquiry.prototype.save = async function save() { saved = this.toObject(); };
  await withServer(async base => {
    const payload = {
      enquiryType: 'Tour Package', customerName: 'Test Traveller', mobileNumber: '9280077182', emailId: 'test@example.com',
      packageId: 'SP-PKG-TEST', quoteReference: 'SP-PKG-TEST-REF', selectedDestinations: ['Rockfort Temple'],
      travelDate: '2026-11-10', adultCount: 2, childCount: 0, hotelRooms: 1, fromLocation: 'Chennai',
      detailedPreferences: { preferredTier: 'Deluxe' }
    };
    const refused = await fetch(`${base}/api/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    assert.equal(refused.status, 400);
    const response = await fetch(`${base}/api/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, contactConsent: true }) });
    assert.equal(response.status, 201);
    assert.deepEqual(saved.selectedDestinations, ['Rockfort Temple']);
    assert.equal(saved.detailedPreferences.routeDraft.itinerary[0].hotel.name, '3 Star hotel');
    assert.equal(saved.detailedPreferences.routeDraft.planningReview.status, 'tight');
    assert.equal(saved.detailedPreferences.preferredTier, 'Deluxe');
  });
});

test('legacy public checkout cannot charge a package list price', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/bookings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: 'SP-PKG-TEST', totalAmount: 1, paymentAmount: 1 })
    });
    assert.equal(response.status, 409);
    assert.match((await response.json()).message, /quotation first/i);
  });
});
