import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import { connectDb } from "./utils/connectDb"
import AdminRouter from "./routes/AdminRouter"
import EventRouter from "./routes/EventRouter"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
connectDb()

app.get('/', (req, res) => {
    res.send(`<h1> Server is connected! </h1>`);
});

app.use("/api/admin", AdminRouter)
app.use("/api/admin/events", EventRouter)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
