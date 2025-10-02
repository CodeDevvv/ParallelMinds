import { Server } from "socket.io";

let io = null;

export function initiateSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            methods: ["GET", "POST"]
        }
    })
    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.IO not initailzed")
    return io;
}

