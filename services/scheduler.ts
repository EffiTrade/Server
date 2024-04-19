import cron from 'node-cron';
import { executeRSIStrategy } from './tradingStrategiesService';

cron.schedule('*/10 * * * * *', async () => {
    console.log('Running RSI strategy...');
    await executeRSIStrategy('BTC', 'USDT');
});