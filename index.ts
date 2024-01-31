import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const { Spot } = require('@binance/connector');

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*" // Adjust this for production
  }
});

app.use(cors());

const port: number = 5000;

const apiKey: string = process.env.BINANCE_API_KEY || '';
const apiSecret: string = process.env.BINANCE_SECRET_KEY || '';

const client = new Spot(apiKey, apiSecret, { baseURL: 'https://testnet.binance.vision' });

interface BinanceError {
    response?: {
        data: any;
    };
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/balance', async (req: Request, res: Response) => {
    try {
        const response = await client.account();
        res.json(response.data.balances);
        io.emit('balance update', response.data.balances);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});

app.post('/buy-bitcoin', async (req: Request, res: Response) => {
    try {
        const response = await client.newOrder('BTCUSDT', 'BUY', 'MARKET', { quantity: 0.5 });
        res.json(response.data);
        io.emit('bitcoin purchase', response.data);
    } catch (error) {
        // ... error handling ...
    }
});

app.post('/buy-ethereum', async (req: Request, res: Response) => {
    try {
        const response = await client.newOrder('ETHUSDT', 'BUY', 'MARKET', { quantity: 0.5 });
        res.json(response.data);
        io.emit('ethereum purchase', response.data);
    } catch (error) {
        // ... error handling ...
    }
});

app.post('/sell/:coin', async (req: Request, res: Response) => {
    const coin = req.params.coin.toUpperCase();
    
    if (!['BTC', 'ETH'].includes(coin)) {
        return res.status(400).json({ error: 'Unsupported coin' });
    }
    
    try {
        const response = await client.newOrder(`${coin}USDT`, 'SELL', 'MARKET', { quantity: 0.5 });
        res.json(response.data);
        io.emit('coin sale', response.data); // Emit coin sale update
    } catch (error) {
        // ... error handling ...
    }
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
