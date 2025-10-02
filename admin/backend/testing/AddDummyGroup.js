import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from '../utils/connectDb.js';
import GroupModel from '../models/GroupModel.js';

dotenv.config();

async function insertDummyGroups() {
  try {
    connectDb()
    console.log('MongoDB connected');

    const commonLifeTransitionsOptions = [
      "Started or lost a job",
      "Moved to a new city",
      "Major relationship change",
      "Serious health issue (self / family)"
    ];

    const sharedInterestsOptions = [
      "Music & Concerts",
      "Dance / Performing Arts",
      "Outdoor Fitness",
      "Mindfulness & Yoga",
      "Volunteering",
      "Art & Craft",
      "Community Sports"
    ];

    const dummyGroups = Array.from({ length: 20 }).map((_, idx) => ({
      membersId: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => `user${idx * 10 + i + 1}`),
      groupProfile: {
        avgPHQ9Score: Math.random() * 27,
        avgGAD7Score: Math.random() * 21,
        commonLifeTransitions: commonLifeTransitionsOptions.slice(0, (idx % commonLifeTransitionsOptions.length) + 1),
        sharedInterests: sharedInterestsOptions.slice(0, (idx % sharedInterestsOptions.length) + 1),
        centralCoordinates: {
          type: 'Point',
          coordinates: [77.6 + idx * 0.01, 12.9 + idx * 0.01]
        }
      },
      settings: {
        maxSize: 10,
        currentSize: Math.floor(Math.random() * 10),
        isOpen: idx % 2 === 0
      },
      matchedEvents: [] 
    }));

    await GroupModel.insertMany(dummyGroups);
    console.log('Inserted 20 dummy groups');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error inserting dummy groups:', error);
    await mongoose.disconnect();
  }
}

insertDummyGroups();
