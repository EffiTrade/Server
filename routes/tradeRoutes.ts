import express from 'express';
import { buyCoin, sellCoin } from '../controllers/tradeController';

const router = express.Router();

router.post('/buy', buyCoin);
router.post('/sell', sellCoin);

export default router;
