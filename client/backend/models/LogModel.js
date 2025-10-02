import mongoose from "mongoose";

const { Schema } = mongoose

const LogSchema = new Schema({
    eventType: {
        type: String,
        enum: ['user_registered', 'feedback_submitted', 'query_submitted', 'doctor_registered', 'user_profile_updated']
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date
    },
    relatedType: {
        type: String,
        enum: ['user', 'event', 'feedback', 'query', 'other']
    }

})

const LogModel = mongoose.model('Log', LogSchema)

export default LogModel