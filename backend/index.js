const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const packageRoutes = require('./routes/packageRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
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
app.get('/api/migrate-packages', async (req, res) => {
  try {
    const Package = require('./models/Package');
    const allPackages = await Package.find({});
    const missingPackages = allPackages.filter(pkg => !pkg.packageId);
    
    const results = [];
    for (const pkg of missingPackages) {
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.use('/api/packages', packageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
