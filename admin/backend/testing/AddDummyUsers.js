import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js';
import dotenv from "dotenv"
import { connectDb } from '../utils/connectDb.js';
mongoose.set('debug', true);
dotenv.config()

async function run() {
  await connectDb();

  const dummyUsers = Array.from({ length: 20 }).map((_, idx) => ({
    email: `user${idx + 1}@example.com`,
    password: `hashedpassword${idx + 1}`,
    personalInfo: {
      name: `User ${idx + 1}`,
      dateOfBirth: `199${idx % 10}-01-01`,
      gender: idx % 2 === 0 ? 'Male' : 'Female',
    },
    location: {
      type: 'Point',
      coordinates: [77.6 + idx * 0.01, 12.9 + idx * 0.01],
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      place_id: `ChIJ${idx}dummy`,
      address: `123${idx} Main St, Bengaluru`
    },
    questionnaire: {
      completed: idx % 3 === 0,
      completedAt: idx % 3 === 0 ? new Date() : null,
      phq9Assessment: {
        totalScore: Math.floor(Math.random() * 27),
        category: ['Mild', 'Moderate', 'None-Minimal', 'Severe', 'Moderately severe'][idx % 5]
      },
      gad7Assessment: {
        totalScore: Math.floor(Math.random() * 21),
        category: ['Mild', 'Moderate', 'None-Minimal', 'Severe'][idx % 4]
      },
      lifeTransitions: {
        responses: [`Transition${idx + 1}`]
      },
      interests: {
        responses: [`Interest${idx + 1}`]
      }
    },
    groupId: idx < 10 ? `group${Math.floor(idx/5) + 1}` : null
  }));

  await UserModel.insertMany(dummyUsers);
  console.log('20 dummy users inserted!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error in script:', err);
  mongoose.disconnect();
});
