import express from 'express';
import { buyAsset, sellAsset } from '../controllers/tradeController';

const router = express.Router();

router.post('/buy', buyAsset);
router.post('/sell', sellAsset);

export default router;
