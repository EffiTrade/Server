const { Spot } = require('@binance/connector');

const apiKey: string = process.env.BINANCE_API_KEY || '';
const apiSecret: string = process.env.BINANCE_SECRET_KEY || '';
const baseURL: string = process.env.BINANCE_API_BASE_URL || '';
export const client = new Spot(apiKey, apiSecret, { baseURL });

export const getAccountBalance = async (): Promise<any> => {
    try {
        const response = await client.account();
        return response.data.balances;
    } catch (error) {
        console.error('Error fetching account balance:', error);
        throw error;
    }
}

export const buy = async (baseAsset: string, quoteAsset: string, quantity: number): Promise<{ totalCostQuote: number, data: any }> => {
    const symbol: string = `${baseAsset}${quoteAsset}`;
    try {
        const response = await client.newOrder(symbol, 'BUY', 'MARKET', { quantity });
        const totalCostQuote: number = parseFloat(response.data.cummulativeQuoteQty);

        const { fills, ...logResponse } = response.data;
        console.log("\nTransaction details:", logResponse);

        return { totalCostQuote, data: response.data };
    } catch (error) {
        console.error(`Error buying ${symbol}:`, error);
        throw error;
    }
};

export const sell = async (baseAsset: string, quoteAsset: string, quantity: number): Promise<{ totalCostQuote: number, data: any }> => {
    const symbol: string = `${baseAsset}${quoteAsset}`;
    try {
        const response = await client.newOrder(symbol, 'SELL', 'MARKET', { quantity });
        const totalCostQuote: number = parseFloat(response.data.cummulativeQuoteQty);

        const { fills, ...logResponse } = response.data;
        console.log("\nTransaction details:", logResponse);

        return { totalCostQuote, data: response.data };
    } catch (error) {
        console.error(`Error selling ${symbol}:`, error);
        throw error;
    }
};
