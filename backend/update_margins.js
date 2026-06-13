const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Package = require('./models/Package');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sreepayanam';

async function updateMargins() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Fetching all packages...');
    
    const packages = await Package.find({});
    console.log(`Found ${packages.length} packages. Recalculating margins...`);

    for (const pkg of packages) {
      const sellPrice = pkg.offerPrice || pkg.originalPrice;
      // Enforce: sellPrice = Math.round(baseCost * 1.10) => baseCost = Math.round(sellPrice / 1.10)
      const calculatedBaseCost = Math.round(sellPrice / 1.10);
      const calculatedOfferPrice = Math.round(calculatedBaseCost * 1.10);

      pkg.baseCost = calculatedBaseCost;
      pkg.profitMarginPercent = 10;
      pkg.offerPrice = calculatedOfferPrice; // Ensure strict alignment

      await pkg.save();
      console.log(`Updated "${pkg.title}":`);
      console.log(`  - Cost Price (Base): ₹${calculatedBaseCost.toLocaleString()}`);
      console.log(`  - Target Profit Margin: 10%`);
      console.log(`  - Selling Price (Offer): ₹${calculatedOfferPrice.toLocaleString()} (Profit of ₹${(calculatedOfferPrice - calculatedBaseCost).toLocaleString()})`);
    }

    console.log('\nAll packages successfully aligned with exactly a 10% profit margin standard!');
    process.exit(0);
  } catch (err) {
    console.error('Pricing calculation error:', err);
    process.exit(1);
  }
}

updateMargins();
