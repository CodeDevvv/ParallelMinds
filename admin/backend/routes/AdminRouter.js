import express from "express"
import { Auth, DeleteAccount, FetchChats, FetchCounts, FetchEventFeedbacks, FetchGroups, FetchLogs, FetchQueries, FetchUsers, SubmitQueryResponse } from "../controllers/AdminContoller";

const router = express.Router();

router.post("/auth", Auth)
router.get('/fetchUsers', FetchUsers)

router.get('/fetchCounts', FetchCounts)
router.get('/fetchQueries', FetchQueries)
router.post('/submitQueryResponse', SubmitQueryResponse)
router.get('/fetchLogs', FetchLogs)
router.delete('/deleteAccount', DeleteAccount)

router.get('/fetchEventFeedback', FetchEventFeedbacks)
router.get('/fetchGroups', FetchGroups)
router.get('/fetchChats', FetchChats)

export default router