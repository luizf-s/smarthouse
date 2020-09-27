import TcpSocket from 'react-native-tcp-socket';

const options = {
    host: "localhost",
    port: 5000
}

const client = TcpSocket.createConnection(options, () => {
    client.write('Hello server!');

    client.destroy();
});
