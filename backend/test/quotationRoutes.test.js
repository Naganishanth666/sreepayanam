const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const TravelDocumentPack = require('../models/TravelDocumentPack');
const quotationRoutes = require('../routes/quotationRoutes');

const originalFindById = Quotation.findById;
const originalFindOne = Quotation.findOne;
const originalFindOneAndUpdate = Quotation.findOneAndUpdate;
const originalUserFindById = User.findById;
const originalEnquiryFindById = Enquiry.findById;
const originalPackFindOne = TravelDocumentPack.findOne;
const previousSecret = process.env.JWT_SECRET;
const previousPassword = process.env.ADMIN_PASSWORD;
process.env.JWT_SECRET = 'test-quotation-jwt-secret-32-characters-long';
process.env.ADMIN_PASSWORD = 'test-admin-password';

const app = express();
app.use(express.json());
app.use('/api/quotations', quotationRoutes);

const withServer = async callback => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
};

test.after(() => {
  Quotation.findById = originalFindById;
  Quotation.findOne = originalFindOne;
  Quotation.findOneAndUpdate = originalFindOneAndUpdate;
  User.findById = originalUserFindById;
  Enquiry.findById = originalEnquiryFindById;
  TravelDocumentPack.findOne = originalPackFindOne;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = previousPassword;
});

test('draft quotation copies an edited route and applies the SRS pricing rule', async () => {
  const quote = {
    reference: 'SP-Q-TEST', version: 1,
    set(input) { Object.assign(this, input); },
    async save() {}
  };
  Quotation.findOne = async () => quote;
  Enquiry.findById = async () => ({
    _id: 'enquiry-id', quoteReference: 'SP-DRAFT-TEST', customerName: 'Test Traveller',
    emailId: 'test@example.com', mobileNumber: '0000000000', adultCount: 2, childCount: 0,
    hotelRooms: 1, carType: 'Sedan', preferredCategory: 'Pilgrimage Tours',
    selectedDestinations: ['Rockfort Temple'],
    detailedPreferences: { packageName: 'Custom Trichy route', preferredTier: 'Deluxe', mealPreference: 'Vegetarian',
      visitTimingPreferences: 'Morning darshan', routeDraft: {
      destination: 'Trichy', durationDays: 1, durationNights: 0,
      planningReview: { status: 'workable', unplacedPlaces: [] },
      itinerary: [{ day: 1, title: 'Original title', places: ['Rockfort Temple'], activities: 'Original plan', entryWindow: 'Morning darshan requested; official time to confirm.' }]
    } }
  });
  await withServer(async base => {
    const response = await fetch(`${base}/api/quotations/enquiry/enquiry-id/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD },
      body: JSON.stringify({
        route: { itinerary: [{ title: 'Reviewed temple visit', places: ['Rockfort Temple'], activities: 'Allow time for the climb.' }] },
        tiers: [{ name: 'Economic', directCost: 100000 }]
      })
    });
    assert.equal(response.status, 200);
    const { quote: saved } = await response.json();
    assert.equal(saved.route.itinerary[0].title, 'Reviewed temple visit');
    assert.equal(saved.route.itinerary[0].entryWindow, 'Morning darshan requested; official time to confirm.');
    assert.equal(saved.route.packageName, 'Custom Trichy route');
    assert.equal(saved.customer.rooms, 1);
    assert.equal(saved.customer.visitTimingPreferences, 'Morning darshan');
    assert.deepEqual(saved.route.planningReview.unplacedPlaces, []);
    assert.equal(saved.tiers.find(tier => tier.name === 'Economic').price.total, 137500);
    assert.equal(saved.tiers.find(tier => tier.name === 'Deluxe').price, null);
  });
});

test('a draft cannot be downloaded as a customer-facing quotation', async () => {
  Quotation.findById = () => ({ lean: async () => ({ status: 'Draft' }) });
  await withServer(async base => {
    const response = await fetch(`${base}/api/quotations/quote-1/download-data`, {
      headers: { 'x-admin-password': process.env.ADMIN_PASSWORD }
    });
    assert.equal(response.status, 403);
  });
});

test('approved download data excludes supplier cost and internal source references', async () => {
  Quotation.findById = () => ({ lean: async () => ({
    status: 'Approved', reference: 'SP-Q-1', version: 1, enquiryReference: 'SP-DRAFT-1',
    customer: { name: 'Test Traveller' }, route: { itinerary: [] }, selectedPlaces: [], destinationReferences: [],
    tiers: [{ name: 'Economic', directCost: 100000, sourceReference: 'PRIVATE-SUPPLIER-123', price: { total: 137500, perPerson: 68750, currency: 'INR' } }],
    terms: { taxNote: 'GST extra/as applicable' }, approval: { at: new Date(), displayName: 'Admin' }
  }) });
  await withServer(async base => {
    const response = await fetch(`${base}/api/quotations/quote-1/download-data`, {
      headers: { 'x-admin-password': process.env.ADMIN_PASSWORD }
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.quote.tiers[0].price.total, 137500);
    assert.ok(!JSON.stringify(body).includes('PRIVATE-SUPPLIER-123'));
    assert.ok(!JSON.stringify(body).includes('directCost'));
  });
});

test('approval requires a named Admin token and complete source evidence', async () => {
  const draft = {
    status: 'Draft', selectedPlaces: ['Rockfort Temple'],
    route: { endingCity: 'Chennai', durationNights: 0, itinerary: [{ title: 'Day 1', activities: 'Visit Rockfort Temple.', entryWindow: 'Opening time checked with official source.' }], planningReview: { status: 'workable', unplacedPlaces: [] } },
    destinationReferences: [{ name: 'Rockfort Temple', url: '', sourceType: '', lastChecked: '' }],
    tiers: [], terms: {}
  };
  Quotation.findById = async () => draft;
  User.findById = () => ({ select: async () => ({ _id: 'admin-id', role: 'Admin', fullName: 'Test Admin' }) });
  await withServer(async base => {
    const withoutToken = await fetch(`${base}/api/quotations/quote-1/approve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD },
      body: JSON.stringify({ note: 'Reviewed', verifiedSources: true })
    });
    assert.equal(withoutToken.status, 401);
    const token = jwt.sign({ user: { id: 'admin-id', role: 'Admin' } }, process.env.JWT_SECRET);
    const withToken = await fetch(`${base}/api/quotations/quote-1/approve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ note: 'Reviewed', verifiedSources: true })
    });
    assert.equal(withToken.status, 422);
    const body = await withToken.json();
    assert.ok(body.problems.some(problem => problem.includes('Rockfort Temple')));
  });
});

test('complete quote approval records the named Admin and locks the version', async () => {
  const checkedAt = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
  const quote = {
    _id: 'quote-id', status: 'Draft', selectedPlaces: ['Rockfort Temple'],
    route: { endingCity: 'Chennai', durationNights: 0, itinerary: [{ title: 'Day 1', activities: 'Visit Rockfort Temple.', entryWindow: 'Opening time checked with official source.' }], planningReview: { status: 'workable', unplacedPlaces: [] } },
    destinationReferences: [{ name: 'Rockfort Temple', url: 'https://example.com/rockfort', sourceType: 'Official', lastChecked: checkedAt }],
    tiers: ['Economic', 'Deluxe', 'Premium'].map(name => ({ name, price: { total: 137500 }, sourceReference: 'Supplier quote 1', sourceCheckedAt: checkedAt, accommodation: 'Category stay', transport: 'Sedan', meals: 'Breakfast' })),
    terms: { validUntil: checkedAt, taxNote: 'GST extra/as applicable', paymentSchedule: 'Deposit on acceptance', cancellationTerms: 'Approved supplier terms', assumptions: 'Subject to availability', inclusions: ['Stay'], exclusions: ['Personal expenses'], routeReviewNote: 'Checked the proposed order and timing with the destination references.' }
  };
  Quotation.findById = async () => quote;
  User.findById = () => ({ select: async () => ({ _id: 'admin-id', role: 'Admin', fullName: 'Test Admin' }) });
  let mutation;
  Quotation.findOneAndUpdate = async (_filter, update) => {
    mutation = update.$set;
    return { ...quote, ...mutation };
  };
  await withServer(async base => {
    const token = jwt.sign({ user: { id: 'admin-id', role: 'Admin' } }, process.env.JWT_SECRET);
    const response = await fetch(`${base}/api/quotations/quote-id/approve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ note: 'Supplier evidence and terms reviewed.', verifiedSources: true })
    });
    assert.equal(response.status, 200);
    assert.equal(mutation.status, 'Approved');
    assert.equal(mutation.approval.actor, 'admin-id');
    assert.equal(mutation.approval.displayName, 'Test Admin');
  });
});

test('combined pack stays on the named Admin side and cannot download before finalization', async () => {
  Quotation.findById = () => ({ lean: async () => ({ _id: 'quote-id', status: 'Approved', reference: 'SP-Q-1', route: { itinerary: [] }, tiers: [], approval: {} }) });
  TravelDocumentPack.findOne = () => ({ lean: async () => ({ status: 'Draft', fields: {}, completedSections: [], checks: {} }) });
  User.findById = () => ({ select: async () => ({ role: 'Customer', fullName: 'Old Admin' }) });
  await withServer(async base => {
    const token = jwt.sign({ user: { id: 'admin-id', role: 'Admin' } }, process.env.JWT_SECRET);
    const noToken = await fetch(`${base}/api/quotations/quote-id/pack`);
    assert.equal(noToken.status, 401);
    const revoked = await fetch(`${base}/api/quotations/quote-id/pack`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(revoked.status, 403);
    User.findById = () => ({ select: async () => ({ role: 'Admin', fullName: 'Current Admin' }) });
    const draft = await fetch(`${base}/api/quotations/quote-id/pack/download-data`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(draft.status, 403);
  });
});
