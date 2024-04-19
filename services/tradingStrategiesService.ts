import { RSI } from 'technicalindicators';
import { buy, sell } from './binanceService';
import { getHistoricalPrices } from './marketDataService';

export const executeRSIStrategy = async (baseAsset: string, quoteAsset: string, rsiThresholds = { overbought: 70, oversold: 30 }) => {
    const symbol = `${baseAsset}${quoteAsset}`;
    const closingPrices = await getHistoricalPrices(symbol, '1h', 500);
    const rsiValues = RSI.calculate({ values: closingPrices, period: 14 });

    if (rsiValues.length === 0) {
        console.error('Not enough data to calculate RSI');
        return;
    }

    const currentRSI = rsiValues[rsiValues.length - 1];
    console.log(`Current RSI for ${symbol}: ${currentRSI}`);

    try {
        if (currentRSI < rsiThresholds.oversold) {
            console.log(`RSI is low (${currentRSI}). Buying ${symbol}`);
            const { totalCostQuote, data } = await buy(baseAsset, quoteAsset, 1); 
            console.log(`Bought ${symbol} for ${totalCostQuote}`, data);
        } else if (currentRSI > rsiThresholds.overbought) {
            console.log(`RSI is high (${currentRSI}). Selling ${symbol}`);
            const { totalCostQuote, data } = await sell(baseAsset, quoteAsset, 1);
            console.log(`Sold ${symbol} for ${totalCostQuote}`, data);
        } else {
            console.log(`RSI is ${currentRSI}, no action taken.`);
        }
    } catch (error) {
        console.error(`Error executing RSI strategy for ${symbol}:`, error);
    }
};
