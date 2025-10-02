import express from 'express'

import { FetchData, fetchEvents, joinEvent, leaveEvent, submitFeedback, updateProfile } from '../controllers/UserController.js'

const router = express.Router()

router.get('/fetchData', FetchData)
router.get('/fetchEvents', fetchEvents)
router.post('/joinEvent', joinEvent)
router.delete('/leaveEvent', leaveEvent)
router.patch('/updateProfile', updateProfile)
router.post('/submitFeedback', submitFeedback)

export default router

