import cron from 'node-cron';
import { executeCustomStrategy } from './tradingStrategiesService';

interface IndicatorConfig {
    name: string;
    options: any;
    thresholds?: {
        upper: number;
        lower: number;
    };
}

type StrategyConfig = {
    baseAsset: string;
    quoteAsset: string;
    quantity: number;
    indicators: IndicatorConfig[];
    historicalData: {
        timeframe: string;
        dataPoints: number;
    };
};

const strategyConfig: StrategyConfig = {
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    quantity: 0.01,
    indicators: [
        {
            name: 'SMA',
            options: { period: 20 },
            thresholds: { upper: 70000, lower: 60000 }
        },
        {
            name: 'MACD',
            options: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
            thresholds: { upper: 10, lower: -10 }
        },
        {
            name: 'BollingerBands',
            options: { period: 20, stdDev: 2 },
            thresholds: { upper: 75000, lower: 55000 }
        },
        {
            name: 'IchimokuCloud',
            options: { conversionPeriod: 9, basePeriod: 26, spanPeriod: 52, displacement: 26 },
            thresholds: { upper: 70000, lower: 60000 }
        },
        {
            name: 'ATR',
            options: { period: 14 },
            thresholds: { upper: 500, lower: 50 }
        },
        {
            name: 'RSI',
            options: { period: 14 },
            thresholds: { upper: 65, lower: 35 }
        },
        {
            name: 'Stochastic',
            options: { period: 14, signalPeriod: 3 },
            thresholds: { upper: 80, lower: 20 }
        }
    ],
    historicalData: {
        timeframe: '1h',
        dataPoints: 500
    }
};

cron.schedule('*/15 * * * * *', async () => {
    try {
        await executeCustomStrategy(strategyConfig);
        console.log('Strategy execution completed.\n');
    } catch (error) {
        console.error('Failed to execute strategy:', error);
    }
});