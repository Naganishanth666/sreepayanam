import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createAwsApiFetch } from '../src/utils/awsApiTransport.js';

const origin = 'https://example.cloudfront.net';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('AWS API transport preserves login and admin credentials and hashes the exact JSON body', async () => {
  let received;
  const body = JSON.stringify({ destination: 'Trichy' });
  const send = createAwsApiFetch({ origin, fetchImpl: async request => { received = request; return new Response('{}'); } });
  await send('/api/quotations', { method: 'POST', headers: { Authorization: 'Bearer signed-token', 'x-admin-password': 'test-only', 'Content-Type': 'application/json' }, body });
  assert.equal(received.headers.get('x-application-authorization'), 'Bearer signed-token');
  assert.equal(received.headers.get('x-admin-password'), 'test-only');
  assert.equal(received.headers.get('x-amz-content-sha256'), hash(body));
  assert.equal(await received.text(), body);
});

test('legacy token login survives CloudFront authorization signing and GET has no body digest', async () => {
  let received;
  const send = createAwsApiFetch({ origin, fetchImpl: async request => { received = request; return new Response('{}'); } });
  await send('/api/bookings', { headers: { 'x-auth-token': 'legacy-token' } });
  assert.equal(received.headers.get('x-application-authorization'), 'Bearer legacy-token');
  assert.equal(received.headers.has('x-amz-content-sha256'), false);
});

test('external requests and static files retain their original fetch inputs', async () => {
  const calls = [];
  const send = createAwsApiFetch({ origin, fetchImpl: async (...args) => { calls.push(args); return new Response('ok'); } });
  const options = { method: 'POST', body: 'external' };
  await send('https://other.example/api/data', options);
  await send('/assets/image.jpg');
  assert.deepEqual(calls[0], ['https://other.example/api/data', options]);
  assert.deepEqual(calls[1], ['/assets/image.jpg', undefined]);
});

test('small multipart imports keep their file, fields, boundary and matching body digest', async () => {
  const form = new FormData();
  form.set('brochure', new Blob(['%PDF-test'], { type: 'application/pdf' }), 'trip.pdf');
  form.set('category', 'National');
  const send = createAwsApiFetch({ origin, fetchImpl: async request => {
    assert.equal(request.headers.get('x-amz-content-sha256'), hash(Buffer.from(await request.clone().arrayBuffer())));
    const received = await request.formData();
    assert.equal(await received.get('brochure').text(), '%PDF-test');
    assert.equal(received.get('category'), 'National');
    return new Response('{}');
  } });
  await send('/api/ai/parse-brochure', { method: 'POST', body: form });
});

test('10 MB imports use private upload then send the original form fields to the parser', async () => {
  const size = 10 * 1024 * 1024;
  const form = new FormData();
  form.set('brochure', new Blob([new Uint8Array(size)], { type: 'application/pdf' }), 'large.pdf');
  form.set('category', 'International');
  form.set('destination', 'Singapore');
  const calls = [];
  const send = createAwsApiFetch({ origin, fetchImpl: async (request, init) => {
    calls.push(request instanceof Request ? request.url : request);
    if (calls.length === 1) {
      assert.deepEqual(await request.json(), { size, contentType: 'application/pdf' });
      assert.equal(request.headers.get('x-admin-password'), 'test-only');
      return Response.json({ uploadKey: 'brochure-uploads/test.pdf', uploadUrl: 'https://private.example/upload', headers: { 'Content-Type': 'application/pdf' } });
    }
    if (calls.length === 2) {
      assert.equal(init.method, 'PUT');
      assert.equal(init.body.size, size);
      assert.deepEqual(init.headers, { 'Content-Type': 'application/pdf' });
      return new Response(null, { status: 200 });
    }
    const bytes = await request.clone().text();
    assert.equal(request.headers.get('x-amz-content-sha256'), hash(bytes));
    assert.deepEqual(await request.json(), { category: 'International', destination: 'Singapore', uploadKey: 'brochure-uploads/test.pdf' });
    return Response.json({ title: 'Existing parser result' });
  } });
  const response = await send('/api/ai/parse-brochure', { method: 'POST', headers: { 'x-admin-password': 'test-only' }, body: form });
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [`${origin}/api/ai/brochure-uploads`, 'https://private.example/upload', `${origin}/api/ai/parse-brochure`]);
});

test('failed private uploads never call the brochure parser', async () => {
  for (const failureAt of [1, 2]) {
    let count = 0;
    const send = createAwsApiFetch({ origin, fetchImpl: async () => {
      count++;
      if (count === failureAt) return new Response('{}', { status: 403 });
      return Response.json({ uploadKey: 'key', uploadUrl: 'https://private.example/upload' });
    } });
    const form = new FormData();
    form.set('brochure', new Blob([new Uint8Array(5 * 1024 * 1024)], { type: 'application/pdf' }), 'large.pdf');
    const response = await send('/api/ai/parse-brochure', { method: 'POST', body: form });
    assert.equal(response.status, failureAt === 1 ? 403 : 502);
    assert.equal(count, failureAt);
  }
});
