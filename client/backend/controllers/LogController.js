import mongoose from "mongoose";
import LogModel from "../models/LogModel";

/**
 * @param {Object} options
 * @param {'event_joined'|'user_registered'|'feedback_submitted'|'query_submitted'|'doctor_registered'|'user_profile_updated'} options.eventType
 * @param {'user'|'event'|'feedback'|'query'|'other'} options.relatedType
 * @param {string} options.description
 */
export const addLog = async ({ eventType, relatedType, description }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await LogModel.create(
            [{ eventType, description, relatedType, createdAt: new Date() }],
            { session }
        );

        const count = await LogModel.countDocuments({}, { session });
        if (count > 6) {
            const oldestDoc = await LogModel.findOne({})
                .sort({ createdAt: 1 })
                .session(session);

            if (oldestDoc) {
                await LogModel.deleteOne({ _id: oldestDoc._id }).session(session);
            }
        }
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.warn('New log entry failed:', error.message, ` for eventType: `, eventType);
    } finally {
        session.endSession();
    }
};

