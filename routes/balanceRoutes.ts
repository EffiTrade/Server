import express from 'express';
const router = express.Router();
import { getBalance } from '../controllers/balanceController';

router.get('/balance', getBalance);

export default router;
