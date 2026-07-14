const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@inotec.in' });
    
    // Create new admin
    const admin = await User.create({
      role: 'admin',
      email: 'amitadmin@inotec.in',
      password: 'Amit@9450',
      name: 'Amit Tripathi',
      mobileNumber: '+911234567890',
      isVerified: true,
      isActive: true
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', 'amitadmin@inotec.in');
    console.log('🔑 Password:', 'Amit@9450');
    console.log('🆔 ID:', admin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();