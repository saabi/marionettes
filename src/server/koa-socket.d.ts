
declare module 'koa-socket' {
    export function attach(app):void;
    export function attachNamespace(app, id);
    export function use(fn);
    export function on(event, handler);
    export function off(event, handler);
    export function broadcast(event, data);
    export function onConnection(sock);
    export function onDisconnect(sock);
    export function updateConnections();
}

declare class IO {
    
}