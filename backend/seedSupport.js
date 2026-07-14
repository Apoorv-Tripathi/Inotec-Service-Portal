const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedSupport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: 'support@inotec.com' });
    if (existing) {
      console.log('Support user already exists');
      process.exit(0);
    }

    const supportUser = await User.create({
      role: 'support',
      name: 'Support Staff',
      email: 'support@inotec.com',
      mobileNumber: '+919999999999',
      password: 'support@123',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Support user created:', supportUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedSupport();