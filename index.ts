import dotenv from 'dotenv';
dotenv.config();

import './db'; // Connect to MongoDB
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setSocketServerInstance } from './socketUtils';
import balanceRoutes from './routes/balanceRoutes';
import tradeRoutes from './routes/tradeRoutes';

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: process.env.CORS_ORIGIN }});

// Set the Socket.IO server instance on the app
setSocketServerInstance(io);

// Setup routes
app.use('/api', balanceRoutes);
app.use('/api', tradeRoutes);

const port: number = parseInt(process.env.PORT || '5000');
server.listen(port, () => console.log(`Server started on http://localhost:${port}`));
