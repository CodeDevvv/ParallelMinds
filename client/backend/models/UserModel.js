import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
    email: String,
    password: String,
    personalInfo: {
        name: String,
        dateOfBirth: String,
        gender: String
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }, // [long, lat]
        city: String,
        state: String,
        country: String,
        place_id: String,
        address: String
    },
    questionnaire: {
        completed: { type: Boolean, default: false, required: true },
        completedAt: Date,
        phq9Assessment: {
            totalScore: Number,
            category: { type: String, enum: ['Mild', 'Moderate', 'None-Minimal', 'Severe', 'Moderately severe'] }
        },
        gad7Assessment: {
            totalScore: Number,
            category: { type: String, enum: ['Mild', 'Moderate', 'None-Minimal', 'Severe'] }
        },
        lifeTransitions: {
            responses: [String]
        },
        interests: {
            responses: [String]
        }
    },
    groupId: {
        type: String,
        default: null
    },
    joinedEvents: [{
        type: Schema.Types.ObjectId,
        ref: 'events'
    }]

}, {
    timestamps: true
})

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;