/**
 * Optional MongoDB persistence for Viking Lab
 * Set MONGODB_URI in environment to enable.
 * When unset, the JSON file store (store.js) is used.
 */
let mongoose = null;
let connected = false;

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  try {
    mongoose = require('mongoose');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log('✅ MongoDB connected');
    return true;
  } catch (e) {
    console.warn('⚠️ MongoDB unavailable, using JSON file store:', e.message);
    connected = false;
    return false;
  }
}

function isMongo() { return connected; }

module.exports = { connectMongo, isMongo };
