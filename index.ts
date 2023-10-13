import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import Binance from 'node-binance-api';
import cors from 'cors';

const app = express();
const PORT = 4000;

interface BinanceError {
  body: string;
  code?: number;
  message?: string;
}

interface BinanceResponse {
  symbol: string;
  orderId: number;
  // ... other properties of the Binance order response
}

// Initialize Binance with futures testnet options
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY!,
  APISECRET: process.env.BINANCE_SECRET_KEY!,
  useServerTime: true,
  test: true,
  baseURL: 'https://testnet.binancefuture.com', // Point to futures testnet
  futures: true  // This enables futures trading on the Binance API
});

app.use(cors());

// Create an HTTP server instance and pass the Express app to it
const httpServer = http.createServer(app);

// Setup Socket.io with the HTTP server and CORS options
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for order requests from frontend
  socket.on('placeOrder', async (data) => {
    try {
        console.info( await binance.futuresBalance() );

      // Place a futures order
      binance.futuresBuy(data.symbol, data.quantity, data.price, { type: 'LIMIT' }, (error: BinanceError, response: BinanceResponse) => {
        if (error) {
          socket.emit('orderError', JSON.parse(error.body).msg);
        } else {
          socket.emit('orderResult', response);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        socket.emit('orderError', error.message);
      } else {
        socket.emit('orderError', 'An unknown error occurred.');
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
