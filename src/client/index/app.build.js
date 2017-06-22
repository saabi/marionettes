({
    baseUrl: "../../../public/js",
    name: "index",
    paths: {
        "socket.io-client": "../../node_modules/socket.io-client/socket.io"
    },
    shim: {
        "socket.io-client": {
            exports: 'socket.io-client'
        }
    },
    include: ["socket.io-client"],
    out: "../../../public/js/index-built.js"
})
