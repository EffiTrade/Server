import { Request, Response } from 'express';
import { buy, sell } from '../services/binanceService';
import { emitAssetPurchase, emitAssetSale } from '../utils/socketUtils';

export const buyAsset = async (req: Request, res: Response): Promise<void> => {
    const { baseAsset, quoteAsset, quantity } = req.body;
    try {
        const { totalCostQuote, data } = await buy(baseAsset, quoteAsset, quantity);
        const transactionData = {
            baseAsset,
            quoteAsset,
            amount: totalCostQuote,
            quantity
        };
        emitAssetPurchase(transactionData);
        res.json(data);
    } catch (error) {
        const axiosError = error as { response?: { data?: { msg: string } } };
        const errorMessage = axiosError.response?.data?.msg || 'An error occurred during the purchase';
        res.status(400).json({ error: errorMessage });
    }
};

export const sellAsset = async (req: Request, res: Response): Promise<void> => {
    const { baseAsset, quoteAsset, quantity } = req.body;
    try {
        const { totalCostQuote, data } = await sell(baseAsset, quoteAsset, quantity);
        const transactionData = {
            baseAsset,
            quoteAsset,
            amount: totalCostQuote, 
            quantity
        };
        emitAssetSale(transactionData);
        res.json(data);
    } catch (error) {
        const axiosError = error as { response?: { data?: { msg: string } } };
        const errorMessage = axiosError.response?.data?.msg || 'An error occurred during the sale';
        res.status(400).json({ error: errorMessage });
    }
};
