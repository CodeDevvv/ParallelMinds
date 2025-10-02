import mongoose from "mongoose"

import EventModel from "../models/EventModel"
import FeedbackModel from "../models/FeedbackModel"
import GroupModel from "../models/GroupModel"
import UserModel from "../models/UserModel"

import { verifyToken } from "../utils/generateToken"
import { addLog } from "./LogController"

export const FetchData = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token)
        const user_id = decodedToken.id
        if (req.query.datafor === 'user') {
            const userData = await UserModel.findOne({ _id: user_id })
            return res.json(userData)
        }
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const fetchEvents = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token);
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        const userId = decodedToken.id;
        const { status, tags, sort, showMissedOnly, forDashboard } = req.query;
        let eventsFromDb;
        if (status === 'joined') {
            const joinedevents = await UserModel.findById(userId).select('joinedEvents').lean();
            eventsFromDb = await EventModel.find({ _id: { $in: joinedevents.joinedEvents }, startDateTime: { $gt: new Date() } });
        } else {
            const user = await UserModel.findById(userId).select('groupId').lean();
            if (!user || !user.groupId) return res.status(200).json({ success: true, events: [] });

            const grp = await GroupModel.findById(user.groupId).select('matchedEvents').lean();
            if (!grp || !grp.matchedEvents || grp.matchedEvents.length === 0) {
                return res.status(200).json({ success: true, events: [] });
            }

            let filter = { _id: { $in: grp.matchedEvents } };

            if (status === 'upcoming') {
                filter.startDateTime = { $gt: new Date() };
                filter["attendees.users"] = { $nin: [userId] };
            } else if (status === 'completed') {
                filter.startDateTime = { $lte: new Date() };
            } else {
                return res.status(400).json({ message: "A 'status' query parameter is required." });
            }

            if (tags) {
                const tagsArray = tags.split(',');
                filter.$or = [{ eventType: { $in: tagsArray } }, { targetInterests: { $in: tagsArray } }];
            }

            if (status === 'completed' && showMissedOnly === 'true') {
                filter['attendees.users'] = { $ne: new mongoose.Types.ObjectId(userId) };
            }

            const sortOrder = sort === 'oldest' ? 1 : -1;
            const limit = forDashboard === "true" ? 3 : 0;

            eventsFromDb = await EventModel.find(filter).sort({ startDateTime: sortOrder }).limit(limit);
        }
        
        const events = await transformEvents(eventsFromDb, userId, status);
        res.status(200).json({ success: true, events });

    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};

// Helper for fetchEvents
const transformEvents = async (eventsFromDb, userId, status) => {
    const eventPromises = eventsFromDb.map(async (event) => {
        const eventObject = event.toObject ? event.toObject() : { ...event };

        if (status === 'completed' || new Date(eventObject.startDateTime) <= new Date()) {
            const attendedUsers = eventObject.attendees.users.map(id => id.toString());
            eventObject.attended = attendedUsers.includes(userId.toString());

            const feedback = await FeedbackModel.findOne({ event: eventObject._id, user: userId });
            eventObject.feedback = !!feedback;
        }

        eventObject.tags = [eventObject.eventType, ...eventObject.targetInterests];
        eventObject.summary = eventObject.description;
        return eventObject;
    });

    return Promise.all(eventPromises);
};

export const joinEvent = async (req, res) => {
    const decodedToken = verifyToken(req.cookies.user_token)
    if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
    }
    const user_id = decodedToken.id
    const event_id = req.body.event_id
    if (!event_id) { return res.status(404).json({ status: false, message: "Event not found!" }) }

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const joinevent = await UserModel.updateOne({ _id: user_id }, { $addToSet: { joinedEvents: event_id } }, { session })
        if (!joinevent) return res.status(400).json({ status: false, message: "Couldn't Join the event!" })
        const updateEventData = await EventModel.updateOne({ _id: event_id, capacity: { $gt: 0 } }, { $addToSet: { "attendees.users": user_id }, $inc: { capacity: -1 } }, { session })
        if (updateEventData.modifiedCount === 0) return res.status(400).json({ status: false, message: "Couldn't Join the event!" })
        await session.commitTransaction()
        return res.status(200).json({ status: true })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    } finally {
        await session.endSession()
    }
}

export const leaveEvent = async (req, res) => {
    const decodedToken = verifyToken(req.cookies.user_token)
    if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
    }
    const user_id = decodedToken.id
    const event_id = req.query.id
    if (!event_id) { return res.status(404).json({ status: false, message: "Event not found!" }) }

    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const leaveevent = await UserModel.updateOne({ _id: user_id }, { $pull: { joinedEvents: event_id } }, { session })
        if (!leaveevent) return res.status(400).json({ status: false, message: "Couldn't Join the event!" })
        const updateEventData = await EventModel.updateOne({ _id: event_id }, { $pull: { "attendees.users": user_id } }, { session })
        if (updateEventData.modifiedCount === 0) return res.status(400).json({ status: false, message: "Couldn't Join the event!" })
        await session.commitTransaction()
        return res.status(200).json({ status: true })
    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    } finally {
        await session.endSession()
    }
}

export const updateProfile = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token)
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        const user_id = decodedToken.id
        const data = req.body.data
        const updateProfile = await UserModel.updateOne({ _id: user_id }, { $set: { "personalInfo.name": data.name } })
        if (updateProfile.modifiedCount === 0) return res.status(400).json({ status: false, message: "Couldn't update profile!" })
        addLog({ eventType: 'user_profile_updated', relatedType: 'user', description: `User : ${updateProfile._id}, updated there profile` })
        return res.status(200).json({ status: true })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const submitFeedback = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token)
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        const user_id = decodedToken.id
        const feedback = req.body
        feedback["user"] = user_id
        const submit = await FeedbackModel.insertOne(feedback)
        if (!submit) return res.json({ status: false, message: "Failed to submit feedback" })
        addLog({
            eventType: 'feedback_submitted',
            relatedType: 'feedback',
            description: `New feedback submitted. ID: ${submit._id}`
        })
        return res.json({ status: true, message: "Feedback submitted!, Thank you" })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}