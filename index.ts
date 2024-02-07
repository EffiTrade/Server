import dotenv from 'dotenv';
dotenv.config();

import './db';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const { Spot } = require('@binance/connector');

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*" 
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

app.post('/buy', async (req: Request, res: Response) => {
    console.log(req.body);
    const coin = req.body.coin.toUpperCase();
    const quantity = req.body.quantity;

    try {
        const response = await client.newOrder(`${coin}USDT`, 'BUY', 'MARKET', { quantity: quantity });
        const totalCostUSD = response.data.fills.reduce((acc: number, fill: any) => acc + parseFloat(fill.price) * parseFloat(fill.qty), 0);
        const transactionData = {
            coin: coin,
            amountInUSD: totalCostUSD,
            quantity: quantity
        };
        res.json(response.data);
        io.emit('coin purchase', transactionData);
    } catch (error) {
        // ... error handling ...
    }
});

app.post('/sell', async (req: Request, res: Response) => {
    console.log(req.body);
    const coin = req.body.coin.toUpperCase();
    const quantity = req.body.quantity;

    try {
        const response = await client.newOrder(`${coin}USDT`, 'SELL', 'MARKET', { quantity: quantity });
        const totalCostUSD = response.data.fills.reduce((acc: number, fill: any) => acc + parseFloat(fill.price) * parseFloat(fill.qty), 0);
        const transactionData = {
            coin: coin,
            amountInUSD: totalCostUSD,
            quantity: quantity
        };
        res.json(response.data);
        io.emit('coin sale', transactionData);
    } catch (error) {
        // ... error handling ...
    }
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
