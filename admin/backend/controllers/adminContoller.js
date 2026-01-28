import bcrypt from "bcrypt"
import { query } from "../config/db"
import { decryptMessage } from "../utils/encryption"
import { generateToken } from "../utils/generateToken"

// Authentication
export const auth = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminRes = await query(`SELECT id, name, password_hash FROM admins WHERE email = $1`, [email]);

        if (adminRes.rowCount === 0) {
            console.log(`[AdminAuth] Login failed: Admin not found for email: ${email}`);
            return res.status(401).json({ status: false, message: "Admin Not Found!" });
        }

        const { id, name, password_hash } = adminRes.rows[0];

        const matchpassword = await bcrypt.compare(password, password_hash);
        if (!matchpassword) {
            console.log(`[AdminAuth] Login failed: Invalid password for email: ${email}`);
            return res.status(401).json({ status: false, message: "Invalid Credentials!" });
        }

        const adminData = {
            email: email,
            name: name,
            id: id
        };

        const token = generateToken(id);

        console.log(`[AdminAuth] Success: Admin ${name} (ID: ${id}) logged in.`);

        return res.status(200).json({
            status: true,
            message: "Log in Successful!",
            adminData,
            token
        });

    } catch (error) {
        console.error(`[AdminAuth] Critical Error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

// Fetch Data
export const fetchUsers = async (req, res) => {
    const { role, page = 1, sort, search, searchType } = req.query;

    try {
        const tableMap = {
            users: 'users',
            admins: 'admins'
        };

        const tableName = tableMap[role];
        if (!tableName) {
            return res.status(400).json({ status: false, message: "Invalid role provided" });
        }

        let sql = `SELECT * FROM ${tableName}`;
        const params = [];
        const conditions = [];
        let paramCounter = 1;

        if (role === 'users' && search && searchType) {
            const allowedSearchColumns = ['full_name', 'email', 'phone', 'username'];

            if (allowedSearchColumns.includes(searchType)) {
                conditions.push(`${searchType} ILIKE $${paramCounter}`);
                params.push(`%${search}%`);
                paramCounter++;
            }
        }

        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }

        const sortDirection = sort === 'new' ? 'DESC' : 'ASC';
        sql += ` ORDER BY created_at ${sortDirection}, id ${sortDirection}`;

        const PAGE_LIMIT = 8;
        const skip = (Math.max(1, Number(page)) - 1) * PAGE_LIMIT;

        sql += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        params.push(PAGE_LIMIT + 1, skip);

        const result = await query(sql, params);

        const hasMore = result.rowCount > PAGE_LIMIT;
        const data = hasMore ? result.rows.slice(0, PAGE_LIMIT) : result.rows;

        return res.json({ status: true, data, hasMore });

    } catch (error) {
        console.error("[Account] Fetch Users Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const fetchCounts = async (req, res) => {
    try {
        const [userRes, ongoingRes, completedRes] = await Promise.all([
            query(`SELECT COUNT(*) AS count FROM users`),
            // query(`SELECT COUNT(*) AS count FROM doctors`), 
            query(`SELECT COUNT(*) AS count FROM events WHERE start_date_time > NOW()`),
            query(`SELECT COUNT(*) AS count FROM events WHERE start_date_time < NOW()`)
        ]);

        const stats = {
            users: parseInt(userRes.rows[0]?.count) || 0,
            // doctors: parseInt(doctorRes.rows[0]?.count) || 0,
            doctors: 0,
            ongoing: parseInt(ongoingRes.rows[0]?.count) || 0,
            completed: parseInt(completedRes.rows[0]?.count) || 0
        };

        console.log(`[AdminData] Stats fetched: ${stats.users} users, ${stats.ongoing} ongoing events.`);
        return res.status(200).json({ status: true, stats: stats });
    } catch (error) {
        console.error(`[AdminData] Critical Error during parsing:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

export const fetchQueries = async (req, res) => {
    const { status, page = 1 } = req.query;
    const PAGE_LIMIT = 7;
    const skip = (Math.max(1, page) - 1) * PAGE_LIMIT;

    try {
        const selectQuery = `
            SELECT * FROM support_tickets 
            WHERE status = $1 
            OFFSET $2 LIMIT $3;
        `;

        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        const ticketRes = await query(selectQuery, [formattedStatus, skip, PAGE_LIMIT + 1]);

        if (ticketRes.rowCount === 0) {
            return res.json({ status: false, data: [], hasMore: false });
        }

        const queries = ticketRes.rows;
        const hasMore = queries.length > PAGE_LIMIT;
        const results = hasMore ? queries.slice(0, PAGE_LIMIT) : queries;

        return res.json({ status: true, data: results, hasMore });

    } catch (error) {
        console.error("[Support] Error fetching tickets:", error.message);
        return res.status(500).json({
            status: false,
            message: "We encountered an issue retrieving support tickets. Please try again shortly."
        });
    }
};

export const fetchLogs = async (req, res) => {
    try {
        const systemLogsRes = await query(`SELECT * FROM system_logs ORDER BY created_at DESC`)
        return res.json({ systemLogs: systemLogsRes.rows })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}


export const fetchEventFeedbacks = async (req, res) => {
    const event_id = req.query.eventId
    try {
        const feedBackRes = await query(`SELECT * FROM event_feedback where event_id = $1 ORDER BY created_at`, [event_id])
        if (feedBackRes.rowCount === 0) {
            return res.json({ feedbacks: [] })
        }
        return res.json({ feedbacks: feedBackRes.rows })
    } catch (error) {
        console.log(error)
        return res.json({ feedback: [] })
    }
}

export const fetchGroups = async (req, res) => {
    try {
        const { page, sortOrder, status, searchQuery } = req.query;
        let sql = `
            SELECT 
                g.*, 
                -- 1. Get Count 
                (SELECT COUNT(*)::int FROM users u WHERE u.group_id = g.id) AS member_count,
                
                -- 2. Get Count of Events 
                (SELECT COUNT(*)::int FROM event_recommendations er WHERE er.group_id = g.id) AS event_count,

                -- 3. Get Array of IDs 
                (
                    SELECT COALESCE(ARRAY_AGG(u.id), '{}') 
                    FROM users u 
                    WHERE u.group_id = g.id
                ) AS "membersId"
            FROM groups g
        `;

        const conditions = [];
        const params = [];
        let paramCounter = 1;

        if (status && status !== "all") {
            if (status === 'open') {
                conditions.push(`g.is_open = true`);
            } else if (status === 'closed') {
                conditions.push(`g.is_open = false`);
            }
        }

        // Uncommented and Fixed Search (Assuming searching by Title)
        // if (searchQuery) {
        //     conditions.push(`g.title ILIKE $${paramCounter}`);
        //     params.push(`%${searchQuery}%`);
        //     paramCounter++;
        // }

        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }

        if (sortOrder === 'old') {
            sql += ` ORDER BY g.created_at ASC`;
        } else {
            sql += ` ORDER BY g.created_at DESC`;
        }

        const PAGE_LIMIT = 6;
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * PAGE_LIMIT;

        sql += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        params.push(PAGE_LIMIT + 1);
        params.push(skip);

        const groupsRes = await query(sql, params);

        const hasMore = groupsRes.rowCount > PAGE_LIMIT;
        const groups = hasMore ? groupsRes.rows.slice(0, PAGE_LIMIT) : groupsRes.rows;
        console.log(groups)
        return res.status(200).json({ status: true, groups, hasMore });

    } catch (error) {
        console.error(`[AdminGroups] Error:`, error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};

export const fetchChats = async (req, res) => {
    const groupId = req.query.groupId
    try {
        const chatRes = await query(`
                SELECT * FROM group_chat_messages WHERE group_id = $1 
                ORDER BY created_at ASC`, [groupId]);

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
        return res.json({ status: true, chats: decryptedChats })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const submitQueryResponse = async (req, res) => {
    try {
        const { admin_response, id } = req.body;

        const updateQuery = `
            UPDATE support_tickets 
            SET responded_at = NOW(), 
                admin_response = $1, 
                status = 'Closed'
            WHERE id = $2;
        `;
        console.log()
        const ticketRes = await query(updateQuery, [admin_response, id]);

        if (ticketRes.rowCount === 0) {
            return res.status(404).json({
                status: false,
                message: "Ticket not found or update failed."
            });
        }

        return res.json({
            status: true,
            message: "Response submitted successfully and ticket closed."
        });

    } catch (error) {
        console.error("[Support] Error submitting ticket response:", error.message);
        return res.status(500).json({
            status: false,
            message: "We couldn't submit your response. Please try again later."
        });
    }
};


export const deleteAccount = async (req, res) => {
    const { role, id } = req.query;

    if (!id) {
        return res.status(400).json({ status: false, message: "ID is required." });
    }

    const tableMap = {
        user: 'users',
        admin: 'admins',
        doctor: 'doctors'
    };

    const tableName = tableMap[role];
    if (!tableName) {
        return res.status(400).json({ status: false, message: "Invalid role provided." });
    }

    try {
        const deleteRes = await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
        if (deleteRes.rowCount === 0) {
            return res.status(404).json({ status: false, message: "Account not found." });
        }

        return res.json({ status: true, message: "Account deleted successfully." });
    } catch (error) {
        console.error("[Account] Delete Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "An error occurred while deleting the account."
        });
    }
};