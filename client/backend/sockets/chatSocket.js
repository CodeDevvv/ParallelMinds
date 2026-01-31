import { query } from "../config/db"
import { getOnlineUserCount, handleHeartBeat } from "../controllers/communityController"

import { getIO } from "../sockets/socket"
import { encryptMessage } from "../utils/encryption"

const io = getIO()

const Community = io.of('/community')

Community.on('connection', async (socket) => {
    const { groupId, userId, name } = socket.handshake.auth;

    if (!groupId || !userId) {
        console.log(`[Socket] Connection rejected: Missing auth data for User ${userId || 'unknown'}`);
        return socket.disconnect();
    }

    socket.join(groupId);
    console.log(`[Socket] User ${userId} (${name}) joined Room ${groupId}`);
    await handleHeartBeat(socket, groupId, userId);
    const count = await getOnlineUserCount(groupId);
    Community.to(groupId).emit("online_users_count_update", count);
    socket.on('sendMessage', async (messageData, callback) => {
        try {
            const messagePayload = encryptMessage(messageData.message);

            const insertQuery = `
                INSERT INTO group_chat_messages 
                (groupId, sender_id, sender_name, iv, encrypted_payload, auth_tag, message_type, is_admin_message)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id, created_at;
            `;

            const insertParams = [
                groupId,
                userId,
                name,
                messagePayload.iv,
                messagePayload.encryptedMessage,
                messagePayload.authTag,
                messageData.messageType || 'user',
                messageData.is_admin_message || false
            ];

            const insertRes = await query(insertQuery, insertParams);

            if (insertRes.rowCount === 0) {
                throw new Error("Database failed to record message.");
            }

            const { id, created_at } = insertRes.rows[0];

            const finalMessage = {
                id: id,
                groupId: groupId,
                sender_id: userId,
                senderName: name,
                message: messageData.message,
                created_at: created_at,
                messageType: messageData.messageType || 'user',
                isAdmin: messageData.is_admin_message || false
            };

            callback({ status: 'ok', data: finalMessage });
            Community.to(groupId).emit('newMessage', finalMessage);
            console.log(`[Socket] Message ${id} broadcasted to Room ${groupId} by User ${userId}`);


        } catch (error) {
            console.error(`[Socket] Delivery error:`, error.message);
            callback({ status: 'error', message: "Failed to deliver message" });
        }
    });
    // Online status check
    socket.on("heartbeat", async () => {
        await handleHeartBeat(socket, groupId, userId);
        const count = await getOnlineUserCount(groupId);
        console.log(count)
        Community.to(groupId).emit("online_users_count_update", count)
    })

    socket.on('disconnect', () => {
        console.log(`[Socket] User ${userId} disconnected from Room ${groupId}`);
    });
});

io.engine.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
});
