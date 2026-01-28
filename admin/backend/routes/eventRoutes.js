import express from "express"
import { fetchEvents, hostEvent } from "../controllers/eventController"

const router = express.Router()

router.post('/hostevent', hostEvent)
router.get("/fetchEvents", fetchEvents)

export default router