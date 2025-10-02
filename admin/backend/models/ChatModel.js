import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
    },
    senderId: { type: String, required: true },
    message: {
        iv: { type: String, required: true },
        encryptedMessage: { type: String, required: true },
        authTag: { type: String, required: true },
    },
    timestamp: {
        type: Date,
        required: true,
    },
    senderName: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['user', 'admin', 'system'],
        default: 'user',
    },
});

ChatSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });
const ChatModel = mongoose.model('Chat', ChatSchema);

export default ChatModel;
