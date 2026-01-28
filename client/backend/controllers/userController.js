

import { query } from "../config/db";
import { getUserIdFromToken } from "../utils/generateToken";
import { addSystemLog } from "./logController";

export const fetchData = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Data] Fetch blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }
        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Data] Fetch blocked: Invalid token decode.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        if (req.query.datafor === 'user') {
            const userQuery = `
                SELECT 
                    id, 
                    email, 
                    full_name, 
                    date_of_birth, 
                    gender, 
                    city, 
                    state, 
                    country, 
                    place_id, 
                    address,
                    is_questionnaire_completed,
                    phq_score, 
                    phq_category,
                    gad_score, 
                    gad_category,
                    interests,
                    life_transitions,
                    group_id,
                    completed_at,
                    ST_AsGeoJSON(location)::jsonb AS location 
                FROM users 
                WHERE id = $1
            `;

            const userDataRes = await query(userQuery, [userId]);

            if (userDataRes.rowCount === 0) {
                console.log(`[Data] Resource error: User ${userId} not found in database.`);
                return res.status(404).json({ status: false, message: "User not found" });
            }

            console.log(`[Data] Success: Profile data retrieved for User ${userId}.`);
            return res.json({ status: true, user: userDataRes.rows[0] });
        }

        console.log(`[Data] Request ignored: Invalid 'datafor' parameter: ${req.query.datafor}`);
        return res.status(400).json({ status: false, message: "Invalid request type." });

    } catch (error) {
        console.error(`[Critical] Data fetch error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const fetchEvents = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Events] Fetch blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Events] Fetch blocked: Invalid token decode.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const { status, tags, sort, showMissedOnly, forDashboard } = req.query;

        if (status === 'joined') {
            const joinedEventsQuery = `
                SELECT 
                    e.*, ST_AsGeoJSON(e.location)::jsonb AS location, true as is_joined 
                FROM events e JOIN user_events ue 
                ON e.id = ue.event_id
                WHERE 
                    ue.user_id = $1
                    AND e.start_date_time > NOW()
                ORDER BY e.start_date_time ASC
            `;

            const eventJoinedRes = await query(joinedEventsQuery, [userId]);

            if (eventJoinedRes.rowCount === 0) {
                console.log(`[Events] No joined events found for User ${userId}.`);
                return res.status(200).json({ status: true, events: [] })
            } else {
                console.log(`[Events] Retrieved ${eventJoinedRes.rowCount} joined events for User ${userId}.`);
            }

            return res.status(200).json({ status: true, events: eventJoinedRes.rows });

        } else {
            const userRes = await query(`SELECT group_id FROM users WHERE id = $1`, [userId]);

            if (userRes.rowCount === 0 || !userRes.rows[0].group_id) {
                console.log(`[Events] Fetch idle: User ${userId} has no group assignment.`);
                return res.status(200).json({ events: [] });
            }

            const groupId = userRes.rows[0].group_id;

            let eventFetchQuery = `
            SELECT 
                    e.id, e.title, e.description, e.start_date_time, e.capacity,
                    e.event_type, e.target_interests, e.target_life_transitions, e.address, e.created_at,
                    ST_AsGeoJSON(e.location)::jsonb AS location,
                    EXISTS (
                        SELECT 1 FROM user_events ue 
                        WHERE ue.event_id = e.id AND ue.user_id = $1
                    ) as is_joined
                FROM events e
                JOIN event_recommendations er ON e.id = er.event_id
                WHERE er.group_id = $2
            `;

            const params = [userId, groupId];
            let paramCounter = 3;

            if (status === 'upcoming') {
                eventFetchQuery += ` AND e.start_date_time > NOW()`;
                eventFetchQuery += ` AND NOT EXISTS (
                    SELECT 1 FROM user_events ue 
                    WHERE ue.event_id = e.id AND ue.user_id = $1
                )`;
            } else if (status === 'completed') {
                eventFetchQuery += ` AND e.start_date_time <= NOW()`;
            } else {
                console.log(`[Events] Fetch rejected: Missing or invalid status parameter.`);
                return res.status(400).json({ status: false, message: "A 'status' query parameter is required." });
            }

            if (status === 'completed' && showMissedOnly === 'true') {
                eventFetchQuery += ` AND NOT EXISTS (
                    SELECT 1 FROM user_events ue 
                    WHERE ue.event_id = e.id AND ue.user_id = $1
                )`;
            }

            if (tags) {
                const tagsArray = tags.split(',');
                eventFetchQuery += ` AND (
                    e.event_type::text = ANY($${paramCounter}) 
                    OR 
                    e.target_interests && $${paramCounter}
                )`;
                params.push(tagsArray);
                paramCounter++;
            }

            if (sort === 'oldest') {
                eventFetchQuery += ` ORDER BY e.start_date_time ASC`;
            } else {
                eventFetchQuery += ` ORDER BY e.start_date_time DESC`;
            }

            if (forDashboard === 'true') {
                eventFetchQuery += ` LIMIT 3`;
            }

            const eventRes = await query(eventFetchQuery, params);
            console.log(`[Events] Successfully fetched ${eventRes.rowCount} events for Group ${groupId}.`);
            return res.status(200).json({ status: true, events: eventRes.rows });
        }

    } catch (error) {
        console.error(`[Critical] Events fetch error:`, error.message);
        return res.status(500).json({ status: false, message: "Internal server error. Please refresh the page or try again later." });
    }
};

export const joinEvent = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Event] Join blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Event] Join blocked: Invalid token decode.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const { eventId } = req.body;
        if (!eventId) {
            console.log(`[Event] Join rejected: Missing event_id for User ${userId}`);
            return res.status(400).json({ status: false, message: "Event identifier is required." });
        }

        const joinEventRes = await query(`
            INSERT INTO user_events (user_id, event_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, event_id) DO NOTHING
        `, [userId, eventId]);

        if (joinEventRes.rowCount === 0) {
            console.log(`[Event] Join idle: User ${userId} is already registered for Event ${event_id}`);
            return res.status(409).json({ status: false, message: "You have already joined this event." });
        }

        console.log(`[Event] Success: User ${userId} joined Event ${eventId}`);
        return res.status(200).json({ status: true });

    } catch (error) {
        console.error(`[Critical] Event join error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const leaveEvent = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Event] Exit blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Event] Exit blocked: Invalid token decode.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const { eventId } = req.query;
        if (!eventId) {
            console.log(`[Event] Exit rejected: Missing eventId for User ${userId}`);
            return res.status(400).json({ status: false, message: "Event identifier is required." });
        }

        const deleteJoinEvent = await query(`
            DELETE FROM user_events WHERE user_id = $1 AND event_id = $2
        `, [userId, eventId]);

        if (deleteJoinEvent.rowCount === 0) {
            console.log(`[Event] Exit idle: User ${userId} was not registered for Event ${eventId}`);
            return res.status(404).json({ status: false, message: "You are not registered for this event." });
        }

        console.log(`[Event] Success: User ${userId} left Event ${eventId}`);
        return res.status(200).json({ status: true });

    } catch (error) {
        console.error(`[Critical] Event exit error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Profile] Update blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Profile] Update blocked: Invalid session token.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const data = req.body.data;

        if (!data || !data.name) {
            console.log(`[Profile] Update rejected: Missing name field for User ${userId}`);
            return res.status(400).json({ status: false, message: "Required fields are missing." });
        }

        const updateRes = await query(
            `UPDATE users SET full_name = $1 WHERE id = $2`,
            [data.name, userId]
        );

        if (updateRes.rowCount === 0) {
            console.log(`[Profile] Resource error: User ${userId} not found for update.`);
            
            await addSystemLog({
                eventType: 'user_profile_updated',
                relatedType: 'user',
                description: `Update failed: User ID ${userId} not found.`
            });

            return res.status(404).json({ status: false, message: "Profile update failed. User not found." });
        }

        console.log(`[Profile] Success: Name updated for User ${userId}.`);

        await addSystemLog({
            eventType: 'user_profile_updated',
            relatedType: 'user',
            description: `Successfully updated profile name for User ID: ${userId}`
        });

        return res.status(200).json({ status: true });

    } catch (error) {
        console.error(`[Critical] Profile update error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Feedback] Submission blocked: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Feedback] Submission blocked: Invalid token decode.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const { rating, comment, eventId } = req.body.feedback || {};

        if (!rating || !eventId) {
            console.log(`[Feedback] Submission rejected: Missing fields for User ${userId}`);
            return res.status(400).json({ status: false, message: "Rating and Event ID are required." });
        }

        const insertQuery = `
            INSERT INTO event_feedback 
                (event_id, user_id, rating, comment)
            VALUES  
                ($1, $2, $3, $4)
            RETURNING id;
        `;

        const insertFeedbackRes = await query(insertQuery, [eventId, userId, rating, comment]);

        if (insertFeedbackRes.rowCount === 0) {
            console.log(`[Feedback] Database error: Failed to insert feedback for User ${userId}`);
            return res.status(500).json({ status: false, message: "Unable to save feedback at this time." });
        }

        const feedbackId = insertFeedbackRes.rows[0].id;
        console.log(`[Feedback] Success: Feedback ${feedbackId} submitted by User ${userId}`);

        await addSystemLog({
            eventType: 'feedback_submitted',
            relatedType: 'feedback',
            description: `User ${userId} submitted feedback (ID: ${feedbackId}) for Event ${eventId}`
        });

        return res.status(201).json({ status: true, message: "Feedback submitted! Thank you." });

    } catch (error) {
        console.error(`[Critical] Feedback error:`, error.message);
        return res.status(500).json({ 
            status: false, 
            message: "Internal server error. Please refresh the page or try again later." 
        });
    }
};