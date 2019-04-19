//import io from 'socket.io-client'; // use this for type checking

export interface MotionUpdate {

}

let socket: SocketIOClient.Socket;
let connected = false;

export async function init() {
    //connected = false;
    //const io = (await import('socket.io-client')); // use this for type checking
    const io = <SocketIOClientStatic>(<any>await import('socket.io-client/dist/socket.io'));

    socket = <SocketIOClientStatic>io.default();

    socket.on('connect', () => {
        connected = true;
        socket.emit('device', 'phone');
    });
}

export function sendMotionUpdate(payload: MotionUpdate) {
    if (connected) socket.emit('message', payload);
}
