require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'ShareBite Admin';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('[Error] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables (.env).');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharebite';

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB.');

    const normalizedEmail = adminEmail.toLowerCase().trim();
    let admin = await User.findOne({ email: normalizedEmail });

    if (admin) {
      console.log(`[Seed] Admin user with email '${normalizedEmail}' already exists. Updating credentials...`);
      admin.name = adminName;
      admin.password = adminPassword; // Pre-save hook will hash the password
      admin.role = 'admin';
      admin.verificationStatus = 'VERIFIED';
      await admin.save();
      console.log(`[Seed] Admin user '${normalizedEmail}' updated successfully.`);
    } else {
      console.log(`[Seed] Creating new Admin user '${normalizedEmail}'...`);
      admin = await User.create({
        name: adminName,
        email: normalizedEmail,
        password: adminPassword, // Pre-save hook will hash the password
        role: 'admin',
        verificationStatus: 'VERIFIED'
      });
      console.log(`[Seed] Admin user '${normalizedEmail}' created successfully with role 'admin'.`);
    }

    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
