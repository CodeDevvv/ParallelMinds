import express from 'express';
import { authorizeUser, doctorLogin, doctorRegister, logoutUser, questionnaire, userLogin, userRegister } from '../controllers/authController.js';

const router = express.Router();

// User Routes
router.post('/userlogin', userLogin)
router.post('/userregister', userRegister)
router.post('/submitQuestionaire', questionnaire)
router.get('/authorized', authorizeUser)

// Doctor Routes
router.post('/doctorlogin', doctorLogin)
router.post('/doctorregister', doctorRegister)

router.get('/logout', logoutUser)

// router.post('/adminlogin')
// router.post('/adminregister')

export default router
