import test from 'node:test';
import assert from 'node:assert/strict';
import { createStayDetails, createStaySummary } from '../src/utils/stayPlan.js';

test('a traveller-selected hotel is shown as a preference on overnight days', () => {
  const preferences = {
    destination: 'Trichy', hotelCategory: '3 Star', hotelRooms: '1',
    preferredHotelName: 'Hotel Sangam', preferredHotelArea: 'Tiruchirappalli'
  };
  const stay = createStayDetails(preferences, { base: 'Trichy' }, 0, 2);
  assert.equal(stay.name, 'Hotel Sangam');
  assert.match(stay.desc, /1 room requested/);
  assert.match(stay.desc, /pending travel-desk confirmation/);
  assert.match(createStaySummary(preferences, 2), /Hotel Sangam \(traveller preference\)/);
});

test('an unnamed hotel still has a useful area, category and room plan', () => {
  const stay = createStayDetails({ destination: 'Trichy', hotelCategory: '3 Star', hotelRooms: '2' }, { base: 'Srirangam' }, 1, 2);
  assert.equal(stay.name, '3 Star hotel in Srirangam');
  assert.match(stay.desc, /2 rooms requested/);
  assert.match(stay.desc, /Property selection and availability pending/);
});

test('departure day explains checkout without an empty hotel placeholder', () => {
  const stay = createStayDetails({ hotelCategory: '3 Star' }, { base: 'Trichy' }, 2, 2);
  assert.equal(stay.name, '');
  assert.match(stay.desc, /Check out/);
  assert.doesNotMatch(stay.desc, /N\/A/);
});
