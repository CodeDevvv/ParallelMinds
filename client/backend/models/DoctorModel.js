import mongoose from 'mongoose';
const { Schema } = mongoose;

const DoctorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    approvalStatus: {
        type: Boolean,
        default: false
    }
    
})

const Doctor = mongoose.model('Doctor', DoctorSchema);
export default Doctor;