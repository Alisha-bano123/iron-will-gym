const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Connected to MongoDB');

  const existing = await User.findOne({ email: 'owner@gym.com' });
  if (existing) {
    console.log('⚠️  Owner already exists! Skipping seed.');
    process.exit(0);
  }

  await User.create({
    name:     'Gym Owner',
    email:    'owner@gym.com',
    password: 'gym@owner123',
    role:     'owner',
    status:   'approved'
  });

  console.log('✅ Owner account created successfully!');
  console.log('   📧 Email   : owner@gym.com');
  console.log('   🔑 Password: gym@owner123');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});