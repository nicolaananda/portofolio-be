import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Portfolio } from '../src/models/portfolio.model';
import { generateUniqueSlug } from '../src/utils/slugUtils';

// Load environment variables
config();

/**
 * Migration script to generate slugs for all existing portfolios
 * Run with: ts-node scripts/migrate-portfolio-slugs.ts
 */
async function migrateSlugs() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all portfolios without slug or with empty slug
    const portfolios = await Portfolio.find({
      $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }],
    });

    console.log(`\n📋 Found ${portfolios.length} portfolios without slugs`);

    if (portfolios.length === 0) {
      console.log('✨ All portfolios already have slugs!');
      await mongoose.disconnect();
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Generate slugs for each portfolio
    for (const portfolio of portfolios) {
      try {
        if (!portfolio.title || portfolio.title.trim().length === 0) {
          console.log(
            `⚠️  Skipping portfolio ${String(portfolio._id)}: No title available`
          );
          errorCount++;
          continue;
        }

        const slug = await generateUniqueSlug(portfolio.title, String(portfolio._id));
        portfolio.slug = slug;
        await portfolio.save();

        console.log(`✓ Updated "${portfolio.title}" → slug: "${slug}"`);
        successCount++;
      } catch (error: any) {
        console.error(
          `✗ Error updating portfolio "${portfolio.title}" (${String(portfolio._id)}):`,
          error.message
        );
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${portfolios.length}`);

    // Verify: Check if all portfolios now have slugs
    const remaining = await Portfolio.countDocuments({
      $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }],
    });

    if (remaining === 0) {
      console.log('\n✨ Migration completed successfully! All portfolios now have slugs.');
    } else {
      console.log(
        `\n⚠️  Warning: ${remaining} portfolios still missing slugs. Please review.`
      );
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
migrateSlugs();

