import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from '../utils/connectDb.js';
import QueryModel from '../models/QueryModel.js';

dotenv.config();

async function insertDummyQueries() {
  try {
    connectDb()
    console.log('MongoDB connected');

    const dummyQueries = Array.from({ length: 20 }).map((_, idx) => ({
      userId: `user${idx + 1}`,
      issueType: ['Technical', 'Billing', 'General'][idx % 3],
      subject: `Issue Subject ${idx + 1}`,
      query: `This is dummy query text for query number ${idx + 1}.`,
      status: idx % 2 === 0 ? 'Open' : 'Closed',
      response: idx % 2 === 0 ? null : `Response for query number ${idx + 1}.`,
      submittedAt: new Date(Date.now() - idx * 86400000), 
      respondedAt: idx % 2 === 0 ? null : new Date(Date.now() - (idx - 1) * 86400000)
    }));

    await QueryModel.insertMany(dummyQueries);
    console.log('Inserted 20 dummy query records!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error inserting dummy queries:', error);
    await mongoose.disconnect();
  }
}

insertDummyQueries();
