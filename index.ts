import dotenv from 'dotenv';
dotenv.config();

import './db'; 
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setSocketServerInstance } from './utils/socketUtils';
import balanceRoutes from './routes/balanceRoutes';
import tradeRoutes from './routes/tradeRoutes';
import strategyRoutes from './routes/strategyRoutes';

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: process.env.CORS_ORIGIN }});

setSocketServerInstance(io);

app.use('/api', balanceRoutes);
app.use('/api', tradeRoutes);
app.use('/api', strategyRoutes);

const port: number = parseInt(process.env.PORT || '5000');
server.listen(port, () => console.log(`Server started on http://localhost:${port}`));

const endpoints = [
    { method: "GET", path: "/api/balance", description: "Get account balance" },
    { method: "POST", path: "/api/order", description: "Create a new order" },
    { method: "DELETE", path: "/api/order/:id", description: "Cancel an order" },
    { method: "POST", path: "/api/strategy", description: "Set or update a trading strategy" },
    { method: "POST", path: "/api/strategy/:baseAsset/execute", description: "Execute a trading strategy" }
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