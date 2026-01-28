import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import http from "http";
import process from 'process';

import { initiateSocket } from './sockets/socket.js';

import AuthRoutes from './routes/authRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import SupportRoutes from './routes/supportRoutes.js';
import UserRoutes from './routes/userRoutes.js';


const app = express();

// Middleware
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5174'
}))
app.use(express.json());
dotenv.config();


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
app.use('/api/community', communityRoutes)
app.use('/api/support', SupportRoutes)