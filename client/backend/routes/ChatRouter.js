import express from "express"
import { chatHistory } from "../controllers/ChatController.js"

const router = express.Router()

router.get('/history', chatHistory)

export default router