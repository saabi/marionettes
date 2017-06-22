({
    baseUrl: "../../../public/js",
    name: "phone",
    paths: {
        "socket.io-client": "../../node_modules/socket.io-client/socket.io"
    },
    shim: {
        "socket.io-client": {
            exports: 'socket.io-client'
        }
    },
    include: ["socket.io-client"],
    out: "../../../public/js/phone-built.js"
})
