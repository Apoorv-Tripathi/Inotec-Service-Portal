const mongoose = require('mongoose');
require('dotenv').config();

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected DB:', mongoose.connection.name);

    const collections = await mongoose.connection.db.collections();

    if (collections.length === 0) {
      console.log('No collections found');
    }

    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared: ${collection.collectionName}`);
    }

    console.log('✅ DATABASE CLEARED SUCCESSFULLY');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

clearDB();