const mongoose = require('mongoose');
const Package = require('./models/Package');
const { ensureMandatoryPolicies } = require('./utils/policyConstants');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sreepayanam';

async function migrateNationalTerms() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Fetching all National category packages...');

    const nationalPackages = await Package.find({ packageCategory: 'National' });
    console.log(`Found ${nationalPackages.length} National packages. Checking policies...`);

    let updatedCount = 0;

    for (const pkg of nationalPackages) {
      let pkgObj = pkg.toObject();
      const originalTerms = pkgObj.termsAndConditions || '';
      const originalCancellation = pkgObj.cancellationPolicy || '';

      // Run our ensure function
      pkgObj = ensureMandatoryPolicies(pkgObj);

      // Only update if there are actual changes
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
        console.log(`[UPDATED] "${pkg.title}" (ID: ${pkg.packageId})`);
        updatedCount++;
      } else {
        console.log(`[SKIPPED] "${pkg.title}" (ID: ${pkg.packageId}) - already has policies`);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} out of ${nationalPackages.length} National packages.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateNationalTerms();
