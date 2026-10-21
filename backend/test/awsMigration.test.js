const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const express = require('express');
const { checkAdmin } = require('../middleware/auth');
const { createReadinessHandler } = require('../middleware/readiness');
const { MAX_BROCHURE_BYTES, createBrochureUploadHandler, createBrochureUploadResolver } = require('../utils/brochureUploads');
const { loadConfiguration } = require('../../aws/runtime/bootstrap.cjs');

const response = () => Object.assign(new EventEmitter(), {
  statusCode: 200, headers: {}, status(value) { this.statusCode = value; return this; },
  setHeader(name, value) { this.headers[name] = value; }, json(value) { this.body = value; return this; }
});
const key = 'brochure-uploads/12345678-1234-1234-1234-123456789abc.pdf';

test('readiness fails closed while the database is disconnected without revealing connection details', () => {
  const connection = { readyState: 0 };
  const handler = createReadinessHandler(connection);
  const unavailable = response();
  handler({}, unavailable);
  assert.equal(unavailable.statusCode, 503);
  assert.deepEqual(unavailable.body, { status: 'unavailable' });
  assert.equal(unavailable.headers['Cache-Control'], 'no-store');
  connection.readyState = 1;
  const ready = response(); handler({}, ready);
  assert.equal(ready.statusCode, 200);
});

test('private brochure preparation enforces the existing 10 MB PDF limit before issuing an upload URL', async () => {
  let issued = 0;
  const handler = createBrochureUploadHandler({ getStore: () => ({ presign: async (uploadKey, size) => {
    issued++; assert.match(uploadKey, /^brochure-uploads\/[a-f0-9-]+\.pdf$/); assert.equal(size, MAX_BROCHURE_BYTES); return 'private-test-url';
  } }) });
  for (const body of [{ size: 0, contentType: 'application/pdf' }, { size: MAX_BROCHURE_BYTES + 1, contentType: 'application/pdf' }, { size: 10, contentType: 'text/plain' }]) {
    const res = response(); await handler({ body }, res); assert.equal(res.statusCode, 400);
  }
  assert.equal(issued, 0);
  const res = response(); await handler({ body: { size: MAX_BROCHURE_BYTES, contentType: 'application/pdf' } }, res);
  assert.equal(res.statusCode, 200); assert.equal(issued, 1); assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('private brochure references cannot read outside their prefix or bypass the size limit', async () => {
  let reads = 0;
  const handler = createBrochureUploadResolver({ getStore: () => ({ read: async () => { reads++; return { ContentType: 'application/pdf', ContentLength: MAX_BROCHURE_BYTES + 1 }; } }) });
  for (const uploadKey of ['../private.env', 'other-bucket/file.pdf', {}, key]) {
    const res = response(); await handler({ body: { uploadKey } }, res, () => assert.fail('Invalid imports cannot reach the parser'));
    assert.equal(res.statusCode, 400);
  }
  assert.equal(reads, 1);
});

test('a private PDF reaches the existing parser with its form fields and is deleted after the response', async () => {
  let removed;
  const bytes = Buffer.from('%PDF-test');
  const handler = createBrochureUploadResolver({ getStore: () => ({
    read: async () => ({ ContentType: 'application/pdf', ContentLength: bytes.length, Body: { transformToByteArray: async () => bytes } }),
    remove: async uploadKey => { removed = uploadKey; }
  }) });
  const req = { body: { uploadKey: key, category: 'National' } }; const res = response();
  let continued = false; await handler(req, res, () => { continued = true; });
  assert.equal(continued, true); assert.equal(req.body.category, 'National');
  assert.deepEqual(req.file.buffer, bytes); assert.equal(req.file.mimetype, 'application/pdf');
  assert.equal(removed, undefined); res.emit('finish'); await Promise.resolve(); assert.equal(removed, key);
});

test('existing multipart imports require no AWS configuration', async () => {
  let continued = false;
  await createBrochureUploadResolver({ getStore: () => assert.fail('Multipart must not load AWS dependencies') })({ body: {} }, response(), () => { continued = true; });
  assert.equal(continued, true);
});

test('new upload endpoint retains admin authentication', async () => {
  const previous = { password: process.env.ADMIN_PASSWORD, secret: process.env.JWT_SECRET };
  process.env.ADMIN_PASSWORD = 'test-only-admin-password'; process.env.JWT_SECRET = 'test-only-jwt-secret-long-enough-for-tests';
  const app = express(); app.use(express.json());
  app.post('/upload', checkAdmin, createBrochureUploadHandler({ getStore: () => ({ presign: async () => 'private-test-url' }) }));
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const url = `http://127.0.0.1:${server.address().port}/upload`;
    const body = JSON.stringify({ size: 20, contentType: 'application/pdf' });
    assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })).status, 401);
    assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD }, body })).status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
    for (const [name, value] of [['ADMIN_PASSWORD', previous.password], ['JWT_SECRET', previous.secret]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test('AWS bootstrap decrypts allowlisted application settings and prevents configuration from enabling database startup writes', async () => {
  const environment = { CONFIG_SSM_PARAMETER: '/test/config' };
  class Command { constructor(input) { this.input = input; } }
  await loadConfiguration({ environment, GetParameterCommand: Command, client: { send: async command => {
    assert.deepEqual(command.input, { Name: '/test/config', WithDecryption: true });
    return { Parameter: { Type: 'SecureString', Value: JSON.stringify({ MONGODB_URI: 'test-uri', JWT_SECRET: 'test-secret', ADMIN_PASSWORD: 'test-password', AWS_ACCESS_KEY_ID: 'forbidden', RUN_STARTUP_MIGRATIONS: 'true' }) } };
  } } });
  assert.equal(environment.MONGODB_URI, 'test-uri'); assert.equal(environment.NODE_ENV, 'production');
  assert.equal(environment.AWS_ACCESS_KEY_ID, undefined); assert.equal(environment.RUN_STARTUP_MIGRATIONS, 'false');
  await assert.rejects(loadConfiguration({ environment: { CONFIG_SSM_PARAMETER: '/test/config' }, GetParameterCommand: Command, client: { send: async () => ({ Parameter: { Type: 'String', Value: '{}' } }) } }), /encrypted/);
});
