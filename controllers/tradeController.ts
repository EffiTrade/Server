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
        const axiosError = error as { response?: { data?: { msg: string } } };
        const errorMessage = axiosError.response?.data?.msg || 'An error occurred during the transaction';
        res.status(400).json({ error: errorMessage });
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
        const axiosError = error as { response?: { data?: { msg: string } } };
        const errorMessage = axiosError.response?.data?.msg || 'An error occurred during the transaction';
        res.status(400).json({ error: errorMessage });
    }
};
