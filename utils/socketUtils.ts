import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const setSocketServerInstance = (ioInstance: SocketIOServer) => {
    io = ioInstance;
};

export const emitAssetPurchase = (transactionData: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('asset purchase', transactionData);
};

export const emitAssetSale = (transactionData: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('asset sale', transactionData);
}

export const emitBalanceUpdate = (balances: any) => {
    if (!io) {
        console.warn("Socket.IO server instance not set!");
        return;
    }
    io.emit('balance update', balances);
}