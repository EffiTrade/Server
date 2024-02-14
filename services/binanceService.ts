const { Spot } = require('@binance/connector');
const apiKey = process.env.BINANCE_API_KEY || '';
const apiSecret = process.env.BINANCE_SECRET_KEY || '';
const baseURL = process.env.BINANCE_API_BASE_URL || '';

const client = new Spot(apiKey, apiSecret, { baseURL });

export const getAccountBalance = async () => {
    try {
        const response = await client.account();
        return response.data.balances;
    } catch (error) {
        throw error;
    }
}

export const buy = async (coin: string, quantity: number): Promise<{ totalCostUSD: number, data: any }> => {
    try {
        const response = await client.newOrder(`${coin}USDT`, 'BUY', 'MARKET', { quantity });
        const totalCostUSD = parseFloat(response.data.cummulativeQuoteQty);
       
        console.log(`\nBUY (${quantity} ${coin} for $${parseFloat(response.data.cummulativeQuoteQty).toFixed(2)})`);
        const { fills, ...logResponse } = response.data; // Exclude fills
        console.log("Transaction details:", logResponse);

         const balances = await getAccountBalance();
         console.log("\nNew balance:")
         console.log(balances.find((bal: { asset: string; }) => bal.asset === coin));
         console.log(balances.find((bal: { asset: string; }) => bal.asset === 'USDT'));
     
        return { totalCostUSD, data: response.data };
    } catch (error) {
        console.error(`Error buying ${coin}:`, error);
        throw error;
    }
};

export const sell = async (coin: string, quantity: number): Promise<{ totalCostUSD: number, data: any }> => {
    try {
        const response = await client.newOrder(`${coin}USDT`, 'SELL', 'MARKET', { quantity });
        const totalCostUSD = parseFloat(response.data.cummulativeQuoteQty);

        console.log(`\nSELL (${quantity} ${coin} for $${parseFloat(response.data.cummulativeQuoteQty).toFixed(2)})`);
        const { fills, ...logResponse } = response.data; // Exclude fills
        console.log("Transaction details:", logResponse);

        const balances = await getAccountBalance();
        console.log("\nNew balance:")
        console.log(balances.find((bal: { asset: string; }) => bal.asset === coin));
        console.log(balances.find((bal: { asset: string; }) => bal.asset === 'USDT'));
    
        return { totalCostUSD, data: response.data };
    } catch (error) {
        console.error(`Error selling ${coin}:`, error);
        throw error;
    }
};


