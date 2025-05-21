import { WebSocketServer, WebSocket } from "ws";
import { CreateWorker } from "../worker";
import { Router } from "mediasoup/node/lib/RouterTypes";
import CreateProducerTransport from '../WebRTC/CreateProducerTransport'
import { Transport } from "mediasoup/node/lib/TransportTypes";
import { DtlsParameters } from "mediasoup/node/lib/WebRtcTransportTypes";
import { MediaKind, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes";
import { Producer } from "mediasoup/node/lib/ProducerTypes";

let mediaSoupRouter: Router;
let producerTransport: Transport;
let producer: Producer;

const broadcast = (data: any, type: string, ws: WebSocketServer) => {
    const message = {
        type,
        data
    }
    ws.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    })
}

const onRouterRtpCapabilities = (socket: WebSocket) => {
    const message = JSON.stringify({ data: mediaSoupRouter.rtpCapabilities, type: 'routerRtpCapabilities', nature: 'response' });
    socket.send(message);

}

const onCreateProducerTransport = async (ws: WebSocket) => {
    const { transport, params } = await CreateProducerTransport(mediaSoupRouter);
    const message = JSON.stringify({ data: params, type: 'producerTransportCreated', nature: 'response' });
    producerTransport = transport;
    ws.send(message);
}
const onConnectProducerTransport = async (dtlsParameters: DtlsParameters, ws: WebSocket) => {
    await producerTransport.connect({ dtlsParameters });
    ws.send(JSON.stringify({
        type: "producerConnected",

    }))

}

const onProduce = async (data: { kind: MediaKind, rtpParameters: RtpParameters }, ws: WebSocket,wss: WebSocketServer) => {
    const { kind, rtpParameters } = data;
    producer = await producerTransport.produce({ kind, rtpParameters });
    const message = {
        id: producer.id,

    }

    ws.send(JSON.stringify({
        type: 'produced',
        data: message,
    }))
    broadcast('new user', 'newProducer', wss);
}

const websocketsManager = async (ws: WebSocketServer) => {
    try {
        mediaSoupRouter = await CreateWorker();
    } catch (error) {
        throw new Error(`Error creating worker: ${error}`);
    }
    ws.on('connection', (socket) => {
        console.log('New client connected');
        socket.on('message', (event) => {
            const message = JSON.parse(event.toString());
            switch (message.type) {
                case 'getRouterRtpCapabilities':
                    onRouterRtpCapabilities(socket);
                    break;
                case 'createProducerTransport':
                    onCreateProducerTransport(socket);
                    break;
                case 'connectProducerTransport':
                    onConnectProducerTransport(message.dtlsParameters, socket)
                    break;
                case 'produce':
                    onProduce(message.data, socket,ws);
                    break;
            }
        });
    })


}

export default websocketsManager;