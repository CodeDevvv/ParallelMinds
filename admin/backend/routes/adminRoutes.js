import express from "express";
import { auth, deleteAccount, fetchChats, fetchCounts, fetchEventFeedbacks, fetchGroups, fetchLogs, fetchQueries, fetchUsers, submitQueryResponse } from "../controllers/adminContoller";

const router = express.Router();

router.post("/auth", auth)
router.get('/fetchUsers', fetchUsers)

router.get('/fetchCounts', fetchCounts)
router.get('/fetchQueries', fetchQueries)
router.post('/submitQueryResponse', submitQueryResponse)
router.get('/fetchLogs', fetchLogs)
router.delete('/deleteAccount', deleteAccount)

router.get('/fetchEventFeedback', fetchEventFeedbacks)
router.get('/fetchGroups', fetchGroups)
router.get('/fetchChats', fetchChats)

export default router