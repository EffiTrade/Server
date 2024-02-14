import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

// Set the Socket.IO server instance
export const setSocketServerInstance = (ioInstance: SocketIOServer) => {
    io = ioInstance;
};

export const emitCoinPurchase = (transactionData: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('coin purchase', transactionData);
};

export const emitCoinSale = (transactionData: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('coin sale', transactionData);
}

export const emitBalanceUpdate = (balances: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('balance update', balances);
}