import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n⚠️  Troubleshooting steps:`);
    console.error(`   1. Check if your IP is whitelisted in MongoDB Atlas`);
    console.error(`   2. Go to: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)`);
    console.error(`   3. Verify your connection string is correct`);
    console.error(`   4. Check if antivirus/firewall is blocking MongoDB connection\n`);
    process.exit(1);
  }
};

export default connectDB;
