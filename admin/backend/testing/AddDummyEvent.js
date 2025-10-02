import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from '../utils/connectDb.js';
import EventModel from '../models/EventModel.js';

dotenv.config();

async function addSampleEvents() {
  try {
    connectDb()
    console.log('MongoDB connected');

    const now = new Date();

    const eventTypes = ['Social', 'Therapeutic', 'Educational', 'Wellness', 'Creative', 'Volunteering', 'Peer-Led'];
    const interests = [
      "Music & Concerts", "Dance / Performing Arts", "Outdoor Fitness",
      "Mindfulness & Yoga", "Volunteering", "Art & Craft", "Community Sports"
    ];
    const lifeTransitions = [
      "Started or lost a job",
      "Moved to a new city",
      "Major relationship change",
      "Serious health issue (self / family)"
    ];

    const createEvent = (idx, isFuture) => {
      const dayOffset = (idx % 10) + 1;
      const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (isFuture ? dayOffset : -dayOffset), 10 + (idx % 5), 0);

      return {
        title: `Event Title ${isFuture ? 'Future' : 'Past'} ${idx + 1}`,
        description: `This is a ${isFuture ? 'future' : 'past'} event number ${idx + 1}`,
        startDateTime: eventDate,
        capacity: 20 + (idx % 15),
        eventType: eventTypes[idx % eventTypes.length],
        targetInterests: interests.slice(0, (idx % interests.length) + 1),
        targetLifeTransitions: lifeTransitions.slice(0, (idx % lifeTransitions.length) + 1),
        targetPHQ9Severity: ['Any', 'Normal', 'Mild', 'Moderate', 'Severe'][idx % 5],
        targetGAD7Severity: ['Any', 'Normal', 'Mild', 'Moderate', 'Severe'][idx % 5],
        address: `${100 + idx} Main St, City`,
        placeId: `ChIJFakeEvent${isFuture ? 'F' : 'P'}${idx + 1}`,
        location: {
          type: 'Point',
          coordinates: [77.6 + idx * 0.01, 12.9 + idx * 0.01]
        },
        attendees: {
          users: [],
          doctors: []
        }
      };
    };

    const pastEvents = Array.from({ length: 10 }).map((_, idx) => createEvent(idx, false));
    const futureEvents = Array.from({ length: 10 }).map((_, idx) => createEvent(idx, true));

    await EventModel.insertMany([...pastEvents, ...futureEvents]);
    console.log('Inserted 20 dummy events (10 past, 10 future)');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error inserting events:', err);
    await mongoose.disconnect();
  }
}

addSampleEvents();
