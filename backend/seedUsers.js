import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    name: 'Admin Demo',
    email: 'admin@test.com',
    password: 'demo123',
    role: 'admin'
  },
  {
    name: 'Editor Demo',
    email: 'editor@test.com',
    password: 'demo123',
    role: 'editor'
  },
  {
    name: 'Viewer Demo',
    email: 'viewer@test.com',
    password: 'demo123',
    role: 'viewer'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo users
    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('===============================');
    users.forEach(u => {
      console.log(`${u.role.toUpperCase()}: ${u.email} / demo123`);
    });
    console.log('===============================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
