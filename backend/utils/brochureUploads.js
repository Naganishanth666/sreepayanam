const crypto = require('node:crypto');

const MAX_BROCHURE_BYTES = 10 * 1024 * 1024;
const uploadKeyPattern = /^brochure-uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;
let cachedStore;

// These dependencies are packaged with AWS deployment tooling. Render's
// existing multipart upload path does not load or require them.
function getDeploymentStore() {
  const bucket = process.env.BROCHURE_UPLOAD_BUCKET;
  if (!bucket) return null;
  if (cachedStore) return cachedStore;
  const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const client = new S3Client({
    region: process.env.AWS_REGION,
    requestChecksumCalculation: 'WHEN_REQUIRED'
  });
  cachedStore = {
    presign: (key, size) => getSignedUrl(client, new PutObjectCommand({
      Bucket: bucket, Key: key, ContentType: 'application/pdf', ContentLength: size
    }), { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length']) }),
    read: key => client.send(new GetObjectCommand({ Bucket: bucket, Key: key })),
    remove: key => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  };
  return cachedStore;
}

function createBrochureUploadHandler({ getStore = getDeploymentStore } = {}) {
  return async (req, res) => {
    const size = req.body?.size;
    if (req.body?.contentType !== 'application/pdf' || !Number.isSafeInteger(size) || size < 1 || size > MAX_BROCHURE_BYTES) {
      return res.status(400).json({ message: 'Choose a PDF brochure no larger than 10 MB.' });
    }
    const store = getStore();
    if (!store) return res.status(503).json({ message: 'Direct brochure uploads are not configured.' });
    try {
      const uploadKey = `brochure-uploads/${crypto.randomUUID()}.pdf`;
      const uploadUrl = await store.presign(uploadKey, size);
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ uploadKey, uploadUrl, headers: { 'Content-Type': 'application/pdf' }, expiresIn: 300 });
    } catch (error) {
      console.error('[Brochure upload] Could not prepare upload:', error.name);
      return res.status(502).json({ message: 'Could not prepare the brochure upload. Please try again.' });
    }
  };
}

function createBrochureUploadResolver({ getStore = getDeploymentStore } = {}) {
  return async (req, res, next) => {
    if (!req.body?.uploadKey) return next();
    const key = req.body.uploadKey;
    if (typeof key !== 'string' || !uploadKeyPattern.test(key)) {
      return res.status(400).json({ message: 'The brochure upload reference is invalid.' });
    }
    const store = getStore();
    if (!store) return res.status(503).json({ message: 'Direct brochure uploads are not configured.' });
    try {
      const object = await store.read(key);
      if (object.ContentType !== 'application/pdf' || !Number.isSafeInteger(object.ContentLength)
        || object.ContentLength < 1 || object.ContentLength > MAX_BROCHURE_BYTES) {
        object.Body?.destroy?.();
        return res.status(400).json({ message: 'Choose a PDF brochure no larger than 10 MB.' });
      }
      const buffer = Buffer.from(await object.Body.transformToByteArray());
      if (buffer.length !== object.ContentLength) throw new Error('IncompleteUpload');
      req.file = { fieldname: 'brochure', originalname: 'brochure.pdf', mimetype: 'application/pdf', size: buffer.length, buffer };
      res.once('finish', () => {
        store.remove(key).catch(error => console.error('[Brochure upload] Cleanup deferred to lifecycle:', error.name));
      });
      return next();
    } catch (error) {
      console.error('[Brochure upload] Could not read upload:', error.name);
      return res.status(400).json({ message: 'The brochure upload could not be read. Please upload the file again.' });
    }
  };
}

module.exports = { MAX_BROCHURE_BYTES, createBrochureUploadHandler, createBrochureUploadResolver };
