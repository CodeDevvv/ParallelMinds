import { query } from "../config/db"

import { getIO } from "../sockets/socket"
import { encryptMessage } from "../utils/encryption"

const io = getIO()

const Community = io.of('/community')

Community.on('connection', (socket) => {
    const { group_id, user_id, full_name } = socket.handshake.auth;

    if (!group_id || !user_id) {
        console.log(`[Socket] Connection rejected: Missing auth data for User ${user_id || 'unknown'}`);
        return socket.disconnect();
    }

    socket.join(group_id);
    console.log(`[Socket] User ${user_id} (${full_name}) joined Room ${group_id}`);

    socket.on('sendMessage', async (messageData, callback) => {
        try {
            const messagePayload = encryptMessage(messageData.message);

            const insertQuery = `
                INSERT INTO group_chat_messages 
                (group_id, sender_id, sender_name, iv, encrypted_payload, auth_tag, message_type, is_admin_message)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id, created_at;
            `;

            const insertParams = [
                group_id,
                user_id,
                full_name,
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
                group_id: group_id,
                sender_id: user_id,
                senderName: full_name,
                message: messageData.message,
                created_at: created_at,
                messageType: messageData.messageType || 'user',
                isAdmin: messageData.is_admin_message || false
            };

            callback({ status: 'ok', data: finalMessage });

            Community.to(group_id).emit('newMessage', finalMessage);

            console.log(`[Socket] Message ${id} broadcasted to Room ${group_id} by User ${user_id}`);

        } catch (error) {
            console.error(`[Socket] Delivery error:`, error.message);
            callback({ status: 'error', message: "Failed to deliver message" });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] User ${user_id} disconnected from Room ${group_id}`);
    });
});

io.engine.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
});
