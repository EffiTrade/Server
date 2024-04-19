import axios from 'axios';

export async function getHistoricalPrices(symbol: string, interval: string, limit: number) {
    const apiKey = process.env.BINANCE_API_KEY;
    const url = `https://testnet.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    try {
        const response = await axios.get(url, {
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        console.log(response.data);
        return response.data.map((kline: any) => parseFloat(kline[4]));
    } catch (error) {
        console.error('Error fetching klines:', error);
        throw error;
    }
}

getHistoricalPrices('BTCUSDT', '1h', 500);

