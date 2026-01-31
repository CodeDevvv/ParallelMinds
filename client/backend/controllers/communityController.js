import { query } from "../config/db";
import redis from "../config/redis";

import { decryptMessage } from "../utils/encryption";
import { getUserIdFromToken } from "../utils/generateToken";
import Redis from "ioredis";


export const fetchCommunityData = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Community] Access denied: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Community] Access denied: Invalid session token.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const userRes = await query(`SELECT group_id, completed_at FROM users WHERE id = $1`, [userId]);

        if (userRes.rowCount === 0) {
            console.log(`[Community] Resource error: User ${userId} not found.`);
            return res.status(404).json({ status: false, message: "User not found." });
        }

        const { group_id, completed_at } = userRes.rows[0];

        if (!group_id) {
            console.log(`[Community] Fetch idle: User ${userId} has no group_id.`);
            return res.json({
                status: false,
                message: "You haven't joined a support group yet."
            });
        }

        const [chatRes, groupRes, membersRes, eventCountRes] = await Promise.all([
            query(`
                SELECT * FROM group_chat_messages 
                WHERE group_id = $1 
                ORDER BY created_at ASC
            `, [group_id]),

            query(`SELECT shared_interests FROM groups WHERE id = $1`, [group_id]),

            query(`SELECT id, full_name FROM users WHERE group_id = $1`, [group_id]),

            query(`SELECT COUNT(*) as count FROM event_recommendations WHERE group_id = $1`, [group_id])
        ]);

        const decryptedChats = chatRes.rows.map(chat => {
            const messageObject = {
                iv: chat.iv,
                encryptedMessage: chat.encrypted_payload,
                authTag: chat.auth_tag
            };

            let decryptedContent = "[Message Unavailable]";
            try {
                decryptedContent = decryptMessage(messageObject);
            } catch (err) {
                console.error(`[Community] Decryption failed for message ID ${chat.id}:`, err.message);
            }

            return {
                ...chat,
                message: decryptedContent,
                iv: undefined,
                encrypted_payload: undefined,
                auth_tag: undefined
            };
        });

        const groupInfo = {
            members: membersRes.rows.map(m => ({ name: m.full_name, id: m.id })),
            memberCount: membersRes.rowCount,
            joinedDate: completed_at,
            eventsMatched: parseInt(eventCountRes.rows[0].count) || 0,
            sharedInterests: groupRes.rows[0]?.shared_interests || []
        };

        console.log(`[Community] Success: Aggregated community data for Group ${group_id}.`);
        return res.json({
            status: true,
            chatHistory: decryptedChats,
            groupInfo: groupInfo
        });

    } catch (error) {
        console.error(`[Critical] Community Data error:`, error.message);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};

// Whose Online?
export const handleHeartBeat = async (socket, groupId, userId) => {
    const pipeline = redis.pipeline()

    // "Online List" for the group
    pipeline.sadd(`group:${groupId}:online`, userId);
    console.log(groupId + " "+ userId)
    // Self destructing key , if no ping for 15 secs , it means user is offline , delete the key
    pipeline.set(`user:${userId}:status`, "online", "EX", 15);

    await pipeline.exec()
}

export const getOnlineUserCount = async (groupId) => {
    const allUsersInGroup = await redis.smembers(`group:${groupId}:online`);
    if (allUsersInGroup.length === 0) return 0;

    const checkPipeline = redis.pipeline();
    allUsersInGroup.forEach((userId) => {
        checkPipeline.exists(`user:${userId}:status`);
    });

    const results = await checkPipeline.exec();

    let onlineCount = 0;
    const cleanUpPipeline = redis.pipeline();

    allUsersInGroup.forEach((userId, index) => {
        const [err, exists] = results[index];
        if (exists === 1) {
            onlineCount++;
        } else {
            cleanUpPipeline.srem(`group:${groupId}:online`, userId);
        }
    });

    if (onlineCount !== allUsersInGroup.length) {
        cleanUpPipeline.exec();
    }

    return onlineCount;
}
