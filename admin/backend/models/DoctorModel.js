import mongoose from "mongoose";


const { Schema } = mongoose

const DoctorSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

const DoctorModel = mongoose.model('Doctor', DoctorSchema)

export default DoctorModel