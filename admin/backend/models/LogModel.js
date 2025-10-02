import mongoose from "mongoose";

const { Schema } = mongoose

const LogSchema = new Schema({
    eventType: {
        type: String,
        enum: ['user_registered', 'feedback_submitted', 'query_submitted', 'doctor_registered', 'user_profile_updated', 'delete_account']
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    relatedType: {
        type: String,
        required: true,
        enum: ['user', 'event', 'feedback', 'query', 'other']
    }
})

LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });
const LogModel = mongoose.model('Log', LogSchema)

export default LogModel