declare global {
    interface Document {
        readonly mozFullScreenEnabled: boolean;
        readonly msFullscreenEnabled: boolean;
    }
}
