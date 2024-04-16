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

// Display available endpoints on the server's root url
const endpoints = [
    { method: "GET", path: "/api/balance", description: "Get account balance" },
    { method: "POST", path: "/api/order", description: "Create a new order" },
    { method: "DELETE", path: "/api/order/:id", description: "Cancel an order" },
];

app.get('/', (req, res) => {
    const html = `
        <h1>EffiTrade Server</h1>
        <h2>Available API Endpoints</h2>
        <ul>
            ${endpoints.map(endpoint => `<li><strong>${endpoint.method}</strong> ${endpoint.path} - ${endpoint.description}</li>`).join('')}
        </ul>
    `;
    res.send(html);
});