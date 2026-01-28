import express from "express"

import { fetchQueryHistory, submitQuery } from "../controllers/supportController.js"

const route = express.Router()

route.post('/submitQuery', submitQuery)
route.get('/fetchQueryHistory', fetchQueryHistory)

export default route