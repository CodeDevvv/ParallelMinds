import mongoose from "mongoose";

const { Schema } = mongoose;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: null
    },
    startDateTime: {
        type: Date,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    eventType: {
        type: String,
        required: true,
        enum: ['Social', 'Therapeutic', 'Educational', 'Wellness', 'Creative', 'Volunteering', 'Peer-Led'],
    },
    targetInterests: {
        type: [String],
        default: [],
        enum: ["Music & Concerts",
            "Dance / Performing Arts",
            "Outdoor Fitness",
            "Mindfulness & Yoga",
            "Volunteering",
            "Art & Craft",
            "Community Sports"]
    },
    targetLifeTransitions: {
        type: [String],
        default: [],
        enum: ["Started or lost a job",
            "Moved to a new city",
            "Major relationship change",
            "Serious health issue (self / family)"]
    },
    targetPHQ9Severity: {
        type: String,
        enum: ['Any', 'Normal', 'Mild', 'Moderate', 'Severe'],
        default: 'Any',
    },
    targetGAD7Severity: {
        type: String,
        enum: ['Any', 'Normal', 'Mild', 'Moderate', 'Severe'],
        default: 'Any',
    },
    address: {
        type: String,
        required: true
    },
    placeId: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    attendees: {
        users: [{
            type: Schema.Types.ObjectId,
            ref: 'users'
        }],
        doctors: [{
            type: Schema.Types.ObjectId,
            ref: 'doctors'
        }]
    }

}
    , {
        timestamps: true
    });

const EventModel = mongoose.model('Event', EventSchema);

export default EventModel;