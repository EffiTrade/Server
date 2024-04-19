import { client } from './binanceService';

export async function getHistoricalPrices(symbol: string, interval: string, limit: number): Promise<number[]> {
    try {
        const response = await client.klines(symbol, interval, { limit: limit });
        console.log(response.data);
        if (Array.isArray(response.data)) {
            return response.data.map((kline: (string | number)[]) => parseFloat(kline[4] as string));
        } else {
            throw new Error('Unexpected response data structure');
        }
    } catch (error: any) {
        console.error('Error fetching klines:', error.message);
        throw error;
    }
}