"use strict";
exports.__esModule = true;
var react_native_tcp_socket_1 = require("react-native-tcp-socket");
var options = {
    host: "localhost",
    port: 5000
};
var client = react_native_tcp_socket_1["default"].createConnection(options, function () {
    client.write('Hello server!');
    client.destroy();
});
