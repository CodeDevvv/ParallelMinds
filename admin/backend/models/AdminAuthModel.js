import mongoose from "mongoose"

const { Schema } = mongoose

const AdminSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
}
)


const AdminModel = mongoose.model('admin', AdminSchema)
export default AdminModel

