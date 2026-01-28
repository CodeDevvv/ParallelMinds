import express from "express"
import { fetchCommunityData } from "../controllers/communityController"

const router = express.Router()

router.get('/fetchCommunityData', fetchCommunityData)

export default router