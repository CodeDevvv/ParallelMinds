import { query } from "../config/db";

/**
 * @param {Object} options
 * @param {'event_joined'|'user_registered'|'feedback_submitted'|'query_submitted'|'doctor_registered'|'user_profile_updated'} options.eventType
 * @param {'user'|'event'|'feedback'|'query'|'other'} options.relatedType
 * @param {string} options.description
 */
export const addSystemLog = async ({eventType, relatedType, description}) => {
    try {
        const insertQuery = `
            INSERT INTO system_logs 
                (event_type, related_type, description)
            VALUES 
                ($1, $2, $3)
        `;

        const insertSystemLogRes = await query(insertQuery, [eventType, relatedType, description]);
        if (insertSystemLogRes.rowCount === 0) {
            console.log(`[SystemLog] Warning: Log entry failed for event type: ${eventType}`);
        } else {
            console.log(`[SystemLog] Entry recorded: ${eventType}`);
        }

    } catch (error) {
        console.error(`[SystemLog] Critical: Background logging failed:`, error.message);
    }
};