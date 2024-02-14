import dotenv from 'dotenv';
dotenv.config();

const mongoose = require('mongoose');
const uri = process.env.DB_KEY;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Connected to MongoDB");
  } finally {
    await mongoose.disconnect();
  }
}
run().catch(console.dir);
