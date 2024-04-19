import { RSI, SMA } from 'technicalindicators';
import { buy, sell } from './binanceService';
import { getHistoricalPrices } from './marketDataService';
import { emitAssetPurchase, emitAssetSale, emitBalanceUpdate } from '../utils/socketUtils';

type IndicatorConfig = {
    name: string;
    options: any;
    thresholds: {
        upper: number;
        lower: number;
    };
};

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

export const executeCustomStrategy = async (config: StrategyConfig) => {
    const symbol = `${config.baseAsset}${config.quoteAsset}`;
    const { timeframe, dataPoints } = config.historicalData;
    const closingPrices = await getHistoricalPrices(symbol, timeframe, dataPoints);

    const calculateIndicator = (indicatorConfig: IndicatorConfig, prices: number[]) => {
        switch (indicatorConfig.name) {
            case 'RSI':
                return RSI.calculate({ values: prices, period: indicatorConfig.options.period });
            case 'SMA':
                return SMA.calculate({ values: prices, period: indicatorConfig.options.period });
            default:
                return [];
        }
    };
    for (let indicatorConfig of config.indicators) {
        const values = calculateIndicator(indicatorConfig, closingPrices);
        const lastValue = values[values.length - 1];

        try {
            if (lastValue < indicatorConfig.thresholds.lower) {
                const buyResult = await buy(config.baseAsset, config.quoteAsset, config.quantity);
                const transactionData = {
                    baseAsset: config.baseAsset,
                    quoteAsset: config.quoteAsset,
                    amount: buyResult.totalCostQuote,
                    quantity: config.quantity
                };
                emitAssetPurchase(transactionData);
                emitBalanceUpdate(transactionData.amount);
            } else if (lastValue > indicatorConfig.thresholds.upper) {
                const sellResult = await sell(config.baseAsset, config.quoteAsset, config.quantity);
                const transactionData = {
                    baseAsset: config.baseAsset,
                    quoteAsset: config.quoteAsset,
                    amount: sellResult.totalCostQuote,
                    quantity: config.quantity
                };
                emitAssetSale(transactionData);
                emitBalanceUpdate(-transactionData.amount);
            }
        } catch (error) {
            console.error(`Error executing strategy for ${symbol}:`, error);
        }
    }
};
