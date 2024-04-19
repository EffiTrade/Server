import cron from 'node-cron';
import { executeCustomStrategy } from './tradingStrategiesService';

cron.schedule('*/1 * * * * *', async () => {
    const strategyConfig = {
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        quantity: 0.01,
        indicators: [
            {
                name: 'RSI',
                options: { period: 14 },
                thresholds: { upper: 70, lower: 30 }
            },
            {
                name: 'SMA',
                options: { period: 50 },
                thresholds: { upper: 20000, lower: 5000 }
            }
        ],
        historicalData: {
            timeframe: '1h',
            dataPoints: 500
        }

    };

    await executeCustomStrategy(strategyConfig);
});