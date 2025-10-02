import mongoose from "mongoose";

const { Schema } = mongoose

const GroupSchema = new Schema({
    membersId: [String],
    groupProfile: {
        avgPHQ9Score: Number,
        avgGAD7Score: Number,
        commonLifeTransitions: {
            type: [String],
            enum: ["Started or lost a job",
                "Moved to a new city",
                "Major relationship change",
                "Serious health issue (self / family)"]
        },
        sharedInterests: {
            type: [String],
            enum: ["Music & Concerts",
                "Dance / Performing Arts",
                "Outdoor Fitness",
                "Mindfulness & Yoga",
                "Volunteering",
                "Art & Craft",
                "Community Sports"]

        },
        centralCoordinates: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
        }
    },
    settings: {
        maxSize: { type: Number, default: 10 },
        currentSize: { type: Number, default: 0 },
        isOpen: { type: Boolean, default: true }
    },
    matchedEvents: [{
        type: Schema.Types.ObjectId,
        ref: 'events'
    }]
},
    {
        timestamps: true
    }
)

const GroupModel = mongoose.model('Group', GroupSchema)

export default GroupModel