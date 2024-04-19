import { RSI, SMA, MACD, ATR, IchimokuCloud, BollingerBands, Stochastic } from 'technicalindicators';
import { buy, sell } from './binanceService';
import { emitAssetPurchase, emitAssetSale } from '../utils/socketUtils';
import { client } from './binanceService';

interface HistoricalPrices {
    highs: number[];
    lows: number[];
    closes: number[];
    opens: number[];
}

type IndicatorConfig = {
    name: string;
    options: any;
    thresholds?: {
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

export async function getHistoricalPrices(symbol: string, interval: string, limit: number): Promise<HistoricalPrices> {
    const response = await client.klines(symbol, interval, { limit });
    const highs: number[] = [];
    const lows: number[] = [];
    const closes: number[] = [];
    const opens: number[] = [];

    response.data.forEach((kline: (string | number)[]) => {
        opens.push(parseFloat(kline[1] as string));
        highs.push(parseFloat(kline[2] as string));
        lows.push(parseFloat(kline[3] as string));
        closes.push(parseFloat(kline[4] as string));
    });

    return { highs, lows, closes, opens };
}
export const executeCustomStrategy = async (config: StrategyConfig) => {
    const symbol = `${config.baseAsset}${config.quoteAsset}`;
    const { timeframe, dataPoints } = config.historicalData;
    const prices = await getHistoricalPrices(symbol, timeframe, dataPoints);

    console.log(`Executing strategy for ${symbol}`);
    console.log(`Timeframe: ${timeframe}, Data Points: ${dataPoints}`);

    let buyVotes = 0;
    let sellVotes = 0;

    for (const indicatorConfig of config.indicators) {
        const results = calculateIndicator(indicatorConfig, prices);
        const lastResult = results[results.length - 1] as number;  // Cast lastResult as number
        console.log(`\n${indicatorConfig.name} Result: ${lastResult.toFixed(2)}`);
        console.log(`Upper threshold: ${indicatorConfig.thresholds?.upper}, Lower threshold: ${indicatorConfig.thresholds?.lower}`);


        if (indicatorConfig.thresholds && lastResult !== undefined) {
            if (indicatorConfig.thresholds.upper !== undefined && lastResult > indicatorConfig.thresholds.upper) {
                buyVotes++;
                console.log(`BUY vote from ${indicatorConfig.name}`);
            } else if (indicatorConfig.thresholds.lower !== undefined && lastResult < indicatorConfig.thresholds.lower) {
                sellVotes++;
                console.log(`SELL vote from ${indicatorConfig.name}`);
            }
            else {
                console.log(`No vote from ${indicatorConfig.name}`);
            }
        }
    }

    const majority = Math.ceil(config.indicators.length / 2);
    if (buyVotes >= majority) {
        console.log(`\nConsensus for BUY with ${buyVotes} votes out of ${config.indicators.length} indicators`);
        await executeTrade('buy', config, symbol);
    } else if (sellVotes >= majority) {
        console.log(`\nConsensus for SELL with ${sellVotes} votes out of ${config.indicators.length} indicators`);
        await executeTrade('sell', config, symbol);
    } else {
        console.log(`\nNo consensus reached: ${buyVotes} buys, ${sellVotes} sells, and ${config.indicators.length - buyVotes - sellVotes} abstained`);
    }
};

async function executeTrade(action: 'buy' | 'sell', config: StrategyConfig, symbol: string) {
    const tradeResult = action === 'buy' ? await buy(config.baseAsset, config.quoteAsset, config.quantity) :
                                           await sell(config.baseAsset, config.quoteAsset, config.quantity);
    const transactionData = {
        baseAsset: config.baseAsset,
        quoteAsset: config.quoteAsset,
        amount: tradeResult.totalCostQuote,
        quantity: config.quantity
    };
    action === 'buy' ? emitAssetPurchase(transactionData) : emitAssetSale(transactionData);
}


function calculateIndicator(indicatorConfig: IndicatorConfig, prices: HistoricalPrices) {
    switch (indicatorConfig.name) {
        case 'RSI':
            return RSI.calculate({ values: prices.closes, period: indicatorConfig.options.period });
        case 'SMA':
            return SMA.calculate({ values: prices.closes, period: indicatorConfig.options.period });
        case 'MACD':
            return MACD.calculate({
                values: prices.closes,
                fastPeriod: indicatorConfig.options.fastPeriod,
                slowPeriod: indicatorConfig.options.slowPeriod,
                signalPeriod: indicatorConfig.options.signalPeriod,
                SimpleMAOscillator: false,
                SimpleMASignal: false
            }).map(m => m.histogram);
        case 'BollingerBands':
            return BollingerBands.calculate({
                values: prices.closes,
                period: indicatorConfig.options.period,
                stdDev: indicatorConfig.options.stdDev
            }).map(b => b.middle);
        case 'Stochastic':
            return Stochastic.calculate({
                high: prices.highs,
                low: prices.lows,
                close: prices.closes,
                period: indicatorConfig.options.period,
                signalPeriod: indicatorConfig.options.signalPeriod
            }).map(s => s.k);
        case 'ATR':
            return ATR.calculate({
                high: prices.highs,
                low: prices.lows,
                close: prices.closes,
                period: indicatorConfig.options.period
            });
        case 'IchimokuCloud':
            return IchimokuCloud.calculate({
                high: prices.highs,
                low: prices.lows,
                conversionPeriod: indicatorConfig.options.conversionPeriod,
                basePeriod: indicatorConfig.options.basePeriod,
                spanPeriod: indicatorConfig.options.spanPeriod,
                displacement: indicatorConfig.options.displacement
            }).map(i => i.spanA);
        default:
            return [];
    }
};
