import { query } from "../config/db";
import { getUserIdFromToken } from "../utils/generateToken";

export const submitQuery = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Query] Access denied: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Query] Access denied: Invalid session token.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const { issueType, subject, query: message } = req.body;
        const insertQuery = `
            INSERT INTO support_tickets 
                (user_id , issue_type, subject , message_text) 
            VALUES
                ($1, $2, $3, $4)
        `;
        const supportRes = await query(insertQuery, [userId, issueType, subject, message]);
        
        if (supportRes.rowCount === 0) {
            console.log(`[Query] Failure: Database insert failed for User ${userId}`);
            return res.json({ status: false, message: "Query couldn't be submitted" });
        }

        await addSystemLog({
            eventType: 'query_submitted',
            relatedType: 'query',
            description: `User ${userId} submitted a support query regarding ${issueType}: ${subject}`
        });

        console.log(`[Query] Success: Query recorded for User ${userId}`);
        return res.status(200).json({ status: true, message: "Query submitted successfully. You can expect a response from us soon." });
    } catch (error) {
        console.error(`[Critical] Query error:`, error.message);
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." });
    }
};

export const fetchQueryHistory = async (req, res) => {
    try {
        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Query] Access denied: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in." });
        }
        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Query] Access denied: Invalid session token.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        // const queries = await QueryModel.find({ userId: user_id }).sort({ submittedAt: -1 })
        const supportRes = await query(`SELECT * FROM support_tickets WHERE user_id = $1`, [userId])
        if (supportRes.rowCount === 0) {
            return res.json({ status: true, queryHistory: [] })
        }
        return res.json({ status: true, queryHistory: supportRes.rows })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}