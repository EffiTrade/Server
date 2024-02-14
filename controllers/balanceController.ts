import { Request, Response } from 'express';
import { getAccountBalance } from '../services/binanceService';
import { emitBalanceUpdate } from '../socketUtils';

export const getBalance = async (req: Request, res: Response) => {
    try {
        const balances = await getAccountBalance();
        emitBalanceUpdate(balances);
        res.json(balances);
    } catch (error) {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
};
