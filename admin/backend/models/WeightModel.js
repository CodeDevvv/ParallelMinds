import mongoose from "mongoose";

const { Schema } = mongoose

const WeightSchema = new Schema({
    TotalPHQ9Score: Number,
    TotalGAD7Score: Number,
    PHQ9Weight: Number,
    GAD7Weight: Number,
    LifeEventsWeight: Number,
    InterestsWeight: Number,
    LocationWeight: Number,
    matchingThreshold: Number,
    cutoffDistance: Number
})

const WeightModel = mongoose.model('Weight', WeightSchema)
export default WeightModel