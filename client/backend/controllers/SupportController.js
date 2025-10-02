import QueryModel from "../models/QueryModel";

import { verifyToken } from "../utils/generateToken"
import { addLog } from "./LogController";

export const submitQuery = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token)
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        const user_id = decodedToken.id
        const query = req.body
        query["userId"] = user_id
        query["submittedAt"] = new Date()
        const addQuery = await QueryModel.insertOne(query)
        if (!addQuery) return res.json({ status: false, message: "Query couldn't be submitted" })
        addLog({eventType : 'query_submitted', relatedType: 'query' , description: `New query submitted. ID: ${addQuery._id}`})
        return res.status(200).json({ status: true, message: "Query submitted successfully. You can expect a response from us soon." })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const fetchQueryHistory = async (req, res) => {
    try {
        const decodedToken = verifyToken(req.cookies.user_token)
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        const user_id = decodedToken.id
        const queries = await QueryModel.find({ userId: user_id }).sort({ submittedAt: -1 })
        return res.json({ status: true, queryHistory: queries })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}