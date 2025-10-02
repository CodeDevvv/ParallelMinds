import ChatModel from "../models/ChatModel"

import { getIO } from "../sockets/socket"
import { decryptMessage, encryptMessage } from "../utils/EncryptDecrypt"

const io = getIO()

const Community = io.of('/community')
Community.on('connection', (socket) => {
    const groupId = socket.handshake.auth.group_id
    socket.join(groupId)
    socket.on('sendMessage', async (messageData, callback) => {
        try {
            messageData.message = (encryptMessage(messageData.message))
            const saveMessage = await ChatModel.insertOne(messageData)
            if (!saveMessage) throw new Error()
            callback({ status: 'ok' })
            messageData.message = decryptMessage(saveMessage.message)
            Community.to(groupId).emit('newMessage', messageData)
        } catch (error) {
            console.log(error)
            callback({ status: 'error', message: "Failed to deliver message" })
        }
    })
})

io.engine.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
});
