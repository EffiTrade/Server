import dotenv from 'dotenv';
dotenv.config(); 
import express, { Request, Response } from 'express';
import cors from 'cors';

const { Spot } = require('@binance/connector');

const app: express.Application = express();
app.use(cors()); // Allows all origins by default. Adjust for production!

const port: number = 5000;

const apiKey: string = process.env.BINANCE_API_KEY || '';
const apiSecret: string = process.env.BINANCE_SECRET_KEY || '';

const client = new Spot(apiKey, apiSecret, { baseURL: 'https://testnet.binance.vision'});

interface BinanceError {
    response?: {
        data: any;
    };
}

app.get('/balance', async (req: Request, res: Response) => {
    try {
        const response = await client.account();
        res.json(response.data.balances);
    } catch (error) {
        if (error instanceof Error) { // Check if error is an instance of the Error class
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});

app.post('/buy-bitcoin', async (req: Request, res: Response) => {
    try {
        const response = await client.newOrder('BTCUSDT', 'BUY', 'MARKET', { quantity: 0.5 });
        console.log('Binance Response:', response); 
        res.json(response.data);
    } catch (error) {
        const binanceError = error as BinanceError;

        if (binanceError.response?.data) {
            // Log the Binance Data Error to the console
            console.error('Binance Data Error:', binanceError.response.data); 

            // Check the msg from Binance and handle specific errors
            if (binanceError.response.data.code === -2010) {
                res.status(400).json({ error: 'You have insufficient funds to complete this action.' });
            } else {
                // Handle other Binance specific errors or messages here if needed, 
                // for now, we'll send the Binance msg directly to the user
                res.status(500).json({ error: binanceError.response.data.msg });
            }
        } else if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});



app.post('/buy-ethereum', async (req: Request, res: Response) => {
    try {
        const response = await client.newOrder('ETHUSDT', 'BUY', 'MARKET', { quantity: 0.5 });
        res.json(response.data);
    } catch (error) {
        if (error instanceof Error) { // Check if error is an instance of the Error class
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
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
    } catch (error) {
        if (error instanceof Error) { // Check if error is an instance of the Error class
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
