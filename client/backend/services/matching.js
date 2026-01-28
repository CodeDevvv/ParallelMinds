
export const matchGroupSQL = async (user, client) => {
    console.log("Triggered matchGroupSQL method")
    const W_PHQ = 0.3;
    const W_GAD = 0.2;
    const W_INTEREST = 0.2;
    const W_LIFE = 0.3;
    const [userLon, userLat] = user.location.coordinates;
    const MAX_DISTANCE_METERS = 50000

const groupMatchQuery = `
    SELECT id, 
    (
        ($1 * (1 - (ABS(avg_phq_score - $2) / 27.0))) +
        ($3 * (1 - (ABS(avg_gad_score - $4) / 21.0))) +
        ($5 * (
                cardinality(ARRAY(
                    SELECT UNNEST(shared_interests) 
                    INTERSECT 
                    SELECT UNNEST($6::text[])
                )) / 5.0
            )) +
        ($7 * (
                cardinality(ARRAY(
                    SELECT UNNEST(common_life_transitions) 
                    INTERSECT 
                    SELECT UNNEST($8::text[])
                )) / 1.0
            ))
        ) AS compatibility_score
        FROM groups
        WHERE 
            -- Spatial Filter
            ST_DWithin(
                centroid, 
                ST_SetSRID(ST_MakePoint($9, $10), 4326), 
                $11
            )
            AND current_size < max_size
            AND is_open = true
        ORDER BY compatibility_score DESC
        LIMIT 1;
    `;

    const values = [
        W_PHQ, user.phq_score,
        W_GAD, user.gad_score,
        W_INTEREST, user.interests,
        W_LIFE, user.life_transitions,
        userLon, userLat, MAX_DISTANCE_METERS
    ];

    const result = await client.query(groupMatchQuery, values);
    if (result.rows.length > 0) {
        console.log("Found matching group returning id: ", result.rows[0].group_id)
        return result.rows[0].id;
    }
    
    return null;
}