import { query } from "../config/db"
import { EVENT_TYPE_WEIGHTS, GAD7_SEVERITY_RANGES, PHQ9_SEVERITY_RANGES } from "../utils/constants"

export const hostEvent = async (req, res) => {
    const eventDetails = req.body;
    if (!eventDetails) {
        console.log("[AdminEvent] Host failed: No payload provided.");
        return res.status(400).json({ status: false, message: "Invalid payload." });
    }

    const {
        title, description, eventDate, eventType, location, capacity,
        targetInterests, targetLifeTransitions, targetPHQ9Severity, targetGAD7Severity
    } = eventDetails;

    try {
        const insertEventQuery = `
            INSERT INTO events (
                title, description, start_date_time, event_type, capacity,
                target_interests, target_life_transitions, 
                target_phq_severity, target_gad_severity,
                address, location
            ) VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, 
                $8, $9, 
                $10, 
                ST_SetSRID(ST_MakePoint($11, $12), 4326)
            ) RETURNING id;
        `;

        const eventRes = await query(insertEventQuery, [
            title, description, new Date(eventDate), eventType, capacity,
            targetInterests, targetLifeTransitions,
            [targetPHQ9Severity], [targetGAD7Severity],
            location.formatted, location.lon, location.lat
        ]);

        const eventId = eventRes.rows[0].id;

        const weights = EVENT_TYPE_WEIGHTS[eventType] || EVENT_TYPE_WEIGHTS['Default'];
        const phqRange = PHQ9_SEVERITY_RANGES[targetPHQ9Severity] || { min: 0, max: 27 };
        const gadRange = GAD7_SEVERITY_RANGES[targetGAD7Severity] || { min: 0, max: 21 };

        const matchedGroupIds = await matchEventToGroupsSQL({
            eventId,
            eventLon: location.lon,
            eventLat: location.lat,
            targetInterests,
            targetLifeTransitions,
            phqMin: phqRange.min,
            phqMax: phqRange.max,
            gadMin: gadRange.min,
            gadMax: gadRange.max,
            weights
        });

        console.log(`[AdminEvent] Success: Event ${eventId} created and matched to ${matchedGroupIds.length} groups.`);

        return res.status(201).json({
            status: true,
            message: "Event Created and Distributed!",
            groupIds: matchedGroupIds,
            eventId
        });

    } catch (error) {
        console.error(`[AdminEvent] Critical Error:`, error.message);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};

const PAGE_LIMIT = 8;

export const fetchEvents = async (req, res) => {
    try {
        const { status, page } = req.query;
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * PAGE_LIMIT;

        let fetchEventQuery = `
            SELECT 
                id, title, description, start_date_time, capacity, event_type, 
                target_interests, target_life_transitions, 
                target_phq_severity, target_gad_severity, 
                address, 
                created_at,
                ST_AsGeoJSON(location)::jsonb AS location 
            FROM events
        `;

        if (status === "upcoming") {
            fetchEventQuery += ` WHERE start_date_time > NOW() ORDER BY start_date_time ASC`;
        } else {
            fetchEventQuery += ` WHERE start_date_time <= NOW() ORDER BY start_date_time DESC`;
        }

        fetchEventQuery += ` LIMIT $1 OFFSET $2`;
        const eventRes = await query(fetchEventQuery, [PAGE_LIMIT + 1, skip]);
        const hasMore = eventRes.rowCount > PAGE_LIMIT;
        const events = hasMore ? eventRes.rows.slice(0, PAGE_LIMIT) : eventRes.rows;
        console.log(`[AdminEvents] Fetched page ${currentPage} of ${status} events. Count: ${events.length}`);
        return res.status(200).json({ status: true, events, hasMore });
    } catch (error) {
        console.error(`[AdminEvents] Critical Error:`, error);
        return res.status(500).json({
            status: false,
            message: "Internal server error."
        });
    }
};
// Core Function
const matchEventToGroupsSQL = async (params) => {
    const MATCHING_THRESHOLD = 0.40;
    const MAX_DISTANCE_METERS = 50000; // 50km

    const matchingQuery = `
        WITH candidates AS (
            SELECT 
                id,
                avg_phq_score,
                avg_gad_score,
                shared_interests,
                common_life_transitions
            FROM groups
            WHERE ST_DWithin(
                centroid, 
                ST_SetSRID(ST_MakePoint($1, $2), 4326), 
                $3
            )
        ),
        scored_groups AS (
            SELECT 
                id,
                (
                    SELECT COUNT(*) 
                    FROM UNNEST(shared_interests) 
                    WHERE UNNEST = ANY($4::text[])
                )::float / NULLIF((array_length(shared_interests, 1) + array_length($4::text[], 1) - (
                    SELECT COUNT(*) 
                    FROM UNNEST(shared_interests) 
                    WHERE UNNEST = ANY($4::text[])
                )), 0) AS interest_score,

                (
                    SELECT COUNT(*) 
                    FROM UNNEST(common_life_transitions) 
                    WHERE UNNEST = ANY($5::text[])
                )::float / NULLIF((array_length(common_life_transitions, 1) + array_length($5::text[], 1) - (
                    SELECT COUNT(*) 
                    FROM UNNEST(common_life_transitions) 
                    WHERE UNNEST = ANY($5::text[])
                )), 0) AS transition_score,

                CASE 
                    WHEN (avg_phq_score BETWEEN $6 AND $7) OR (avg_gad_score BETWEEN $8 AND $9) 
                    THEN 1.0 
                    ELSE 0.0 
                END AS clinical_score
            FROM candidates
        )
        INSERT INTO event_recommendations (group_id, event_id, match_score)
        SELECT 
            id, 
            $13, 
            (
                (interest_score * $10) + 
                (transition_score * $11) + 
                (clinical_score * $12)
            ) as final_score
        FROM scored_groups
        WHERE 
            (
                (interest_score * $10) + 
                (transition_score * $11) + 
                (clinical_score * $12)
            ) >= $14 -- The Threshold
        RETURNING group_id;
    `;

    const safeInterests = params.targetInterests || [];
    const safeTransitions = params.targetLifeTransitions || [];

    const result = await query(matchingQuery, [
        params.eventLon,            // $1
        params.eventLat,            // $2
        MAX_DISTANCE_METERS,        // $3
        safeInterests,              // $4
        safeTransitions,            // $5
        params.phqMin,              // $6
        params.phqMax,              // $7
        params.gadMin,              // $8
        params.gadMax,              // $9
        params.weights.interest,    // $10
        params.weights.transition,  // $11
        params.weights.clinical,    // $12
        params.eventId,             // $13
        MATCHING_THRESHOLD          // $14
    ]);

    return result.rows.map(row => row.group_id);
};