import express from "express"
import { FetchEvents, HostEvent } from "../controllers/EventController"

const router = express.Router()

router.post('/hostevent', HostEvent)
router.get("/fetchEvents", FetchEvents)

export default router