import express from 'express';
import { strategyController } from '../controllers/strategyController';

const router = express.Router();

router.post('/strategy', strategyController.setOrUpdateStrategy);
router.get('/strategy/execute/:baseAsset', strategyController.executeStrategy);
router.post('/strategy/stop/:baseAsset', strategyController.unscheduleStrategy);

export default router;
