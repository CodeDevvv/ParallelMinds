import express from 'express';
import http from "http"
import cors from "cors"
import dotenv from 'dotenv';
import process from 'process';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { initiateSocket } from './sockets/socket.js';

import AuthRoutes from './routes/AuthRoutes.js';
import UserRoutes from './routes/UserRoutes.js'
import ChatRoutes from './routes/ChatRouter.js'
import SupportRoutes from './routes/SupportRoutes.js'


const app = express();

// Middleware
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5174'
}))
app.use(express.json());
dotenv.config();
connectDB();

// Socket.io
const httpServer = http.createServer(app)
initiateSocket(httpServer);
require('./sockets/chatSocket.js')

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
})

// Api's
app.use('/api/auth', AuthRoutes)
app.use('/api/user', UserRoutes)
app.use('/api/chat', ChatRoutes)
app.use('/api/support', SupportRoutes)