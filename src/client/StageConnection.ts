import { addMarionette, removeMarionette, update } from "./Stage";

export async function init() {
    const io = <SocketIOClientStatic>(<any>await import('socket.io-client/dist/socket.io'));
    let socket = io.default();
    socket.on('connect', () => {
        socket.emit('device', 'desktop');
    });
    
    socket.on('phoneadded', addMarionette);
    socket.on('phoneremoved', removeMarionette);
    socket.on('motion', update);
}

export function close() {}