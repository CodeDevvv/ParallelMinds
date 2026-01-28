import express from 'express'

import { fetchData, fetchEvents, joinEvent, leaveEvent, submitFeedback, updateProfile } from '../controllers/userController.js'

const router = express.Router()

router.get('/fetchData', fetchData)
router.get('/fetchEvents', fetchEvents)
router.post('/joinEvent', joinEvent)
router.delete('/leaveEvent', leaveEvent)
router.patch('/updateProfile', updateProfile)
router.post('/submitFeedback', submitFeedback)

export default router

