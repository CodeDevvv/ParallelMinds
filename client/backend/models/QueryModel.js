import mongoose from "mongoose";

const { Schema } = mongoose

const QuerySchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    issueType: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Open",
        enum: ['Closed', 'Open']
    },
    response: {
        type: String,
    },
    submittedAt: {
        type: Date,
        required: true
    },
    respondedAt: {
        type: Date
    }
})

const QueryModel = mongoose.model('Query', QuerySchema)

export default QueryModel