import cors from "cors"
import dotenv from "dotenv"
import express from "express"

import AdminRouter from "./routes/adminRoutes"
import EventRouter from "./routes/eventRoutes"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send(`<h1> Server is connected! </h1>`);
});

app.use("/api/admin", AdminRouter)
app.use("/api/admin/events", EventRouter)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
