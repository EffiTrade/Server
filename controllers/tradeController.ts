import { Request, Response } from 'express';
import { buy, sell } from '../services/binanceService';
import { emitCoinPurchase, emitCoinSale } from '../socketUtils';

export const buyCoin = async (req: Request, res: Response) => {
    const { coin, quantity } = req.body;
    try {
        const { totalCostUSD, data } = await buy(coin.toUpperCase(), quantity);
        const transactionData = {
            coin: coin,
            amountInUSD: totalCostUSD,
            quantity: quantity
        };
        emitCoinPurchase(transactionData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during the purchase' });
    }
};

export const sellCoin = async (req: Request, res: Response) => {
    const { coin, quantity } = req.body;
    try {
        const { totalCostUSD, data } = await sell(coin.toUpperCase(), quantity);
        const transactionData = {
            coin: coin,
            amountInUSD: totalCostUSD,
            quantity: quantity
        };
        emitCoinSale(transactionData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during the sale' });
    }
};
