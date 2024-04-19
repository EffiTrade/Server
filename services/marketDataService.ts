import { client } from './binanceService';

export interface HistoricalPrices {
    highs: number[];
    lows: number[];
    closes: number[];
    opens: number[];
}

export async function getHistoricalPrices(symbol: string, interval: string, limit: number): Promise<HistoricalPrices> {
    try {
        const response = await client.klines(symbol, interval, { limit: limit });
        if (Array.isArray(response.data)) {
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
        } else {
            throw new Error('Unexpected response data structure');
        }
    } catch (error: any) {
        console.error('Error fetching klines:', error.message);
        throw error;
    }
}
