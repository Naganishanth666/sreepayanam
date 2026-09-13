const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const packageRoutes = require('./routes/packageRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const { checkAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be configured with at least 12 characters in production.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured in production.');
  }
}

app.disable('x-powered-by');
app.set('trust proxy', 1);

// The API is intentionally allow-listed. Same-origin requests have no Origin
// header and remain valid; browser callers must be an explicitly configured UI.
// Keep the canonical deployed Vercel origin as a safe fallback so a missing
// Render env value does not break the admin console after a frontend deploy.
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const defaultOrigins = isProduction
  ? ['https://sreepayanam.vercel.app']
  : ['http://localhost:5173', 'http://localhost:4173', 'https://sreepayanam.vercel.app'];
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by the API.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-admin-password', 'Idempotency-Key'],
  maxAge: 86400
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

const rateLimit = ({ windowMs, max, message }) => {
  const clients = new Map();
  const cleanup = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, record] of clients.entries()) {
      if (record.startedAt < cutoff) clients.delete(key);
    }
  }, Math.min(windowMs, 60000));
  cleanup.unref?.();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = clients.get(key);
    if (!record || now - record.startedAt >= windowMs) {
      clients.set(key, { startedAt: now, count: 1 });
      return next();
    }
    if (record.count >= max) {
      res.setHeader('Retry-After', Math.ceil((record.startedAt + windowMs - now) / 1000));
      return res.status(429).json({ message });
    }
    record.count += 1;
    return next();
  };
};

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: 'Too many authentication attempts. Try again later.' }));
app.use('/api/enquiries', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many enquiry requests. Try again later.' }));
app.use('/api/bookings', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many booking requests. Try again later.' }));
app.use('/api/quotations', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many quotation requests. Try again later.' }));
app.use('/api/ai', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many assistant requests. Try again later.' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sreepayanam', {
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Run migration to populate packageId for legacy packages if missing
  try {
    const Package = require('./models/Package');
    const allPackages = await Package.find({});
    const missingPackages = allPackages.filter(pkg => !pkg.packageId);
    
    if (missingPackages.length > 0) {
      console.log(`[Migration] Found ${missingPackages.length} packages missing packageId. Populating...`);
      for (const pkg of missingPackages) {
        const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
        const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
        const generatedId = `SP-PKG-${dateStr}-${randomChars}`;
        
        await Package.updateOne({ _id: pkg._id }, { $set: { packageId: generatedId } });
        console.log(`[Migration] Populated packageId for "${pkg.title}" -> ${generatedId}`);
      }
      console.log('[Migration] Package ID migration completed successfully.');
    } else {
      console.log('[Migration] All packages have valid packageIds. No migration required.');
    }
  } catch (migErr) {
    console.error('[Migration] Failed to run packageId migration:', migErr);
  }

  // Run migration to ensure mandatory policies for National packages
  try {
    const Package = require('./models/Package');
    const { ensureMandatoryPolicies } = require('./utils/policyConstants');
    const nationalPackages = await Package.find({ packageCategory: 'National' });
    console.log(`[Migration] Checking ${nationalPackages.length} National packages for mandatory policies...`);
    let updatedCount = 0;
    for (const pkg of nationalPackages) {
      let pkgObj = pkg.toObject();
      const originalTerms = pkgObj.termsAndConditions || '';
      const originalCancellation = pkgObj.cancellationPolicy || '';
      pkgObj = ensureMandatoryPolicies(pkgObj);
      if (
        pkgObj.termsAndConditions !== originalTerms ||
        pkgObj.cancellationPolicy !== originalCancellation
      ) {
        await Package.updateOne(
          { _id: pkg._id },
          {
            $set: {
              termsAndConditions: pkgObj.termsAndConditions,
              cancellationPolicy: pkgObj.cancellationPolicy
            }
          }
        );
        console.log(`[Migration] Updated policies for National package: "${pkg.title}" (ID: ${pkg.packageId})`);
        updatedCount++;
      }
    }
    console.log(`[Migration] National package policies migration completed. Updated ${updatedCount} packages.`);
  } catch (migTermsErr) {
    console.error('[Migration] Failed to run National package policies migration:', migTermsErr);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Sreepayanam Tours API is running v2');
});

// On-demand migration route
app.post('/api/migrate-packages', checkAdmin, async (req, res) => {
  try {
    const Package = require('./models/Package');
    const allPackages = await Package.find({});
    const missingPackages = allPackages.filter(pkg => !pkg.packageId);
    
    const results = [];
    for (const pkg of missingPackages) {
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
      const generatedId = `SP-PKG-${dateStr}-${randomChars}`;
      
      await Package.updateOne({ _id: pkg._id }, { $set: { packageId: generatedId } });
      results.push({ id: pkg._id, title: pkg.title, packageId: generatedId });
    }
    
    res.json({
      success: true,
      message: `Migrated ${results.length} packages out of ${allPackages.length} total`,
      migrated: results
    });
  } catch (err) {
    console.error('[Migration] On-demand package migration failed:', err.message);
    res.status(500).json({ success: false, message: 'Package migration could not be completed.' });
  }
});

// Routes
app.use('/api/packages', packageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/quotations', quotationRoutes);

app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large' || err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Request is too large.' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  if (err?.code === 'LIMIT_UNEXPECTED_FILE' || err?.message === 'Only PDF brochures are supported.') {
    return res.status(400).json({ message: 'Only one PDF brochure can be uploaded.' });
  }
  if (err?.message === 'Origin is not allowed by the API.') {
    return res.status(403).json({ message: 'Origin is not allowed by the API.' });
  }
  console.error('[API] Unhandled request error:', err);
  return res.status(500).json({ message: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
