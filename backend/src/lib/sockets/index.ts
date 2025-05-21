import { WebSocketServer, WebSocket } from "ws";
import { CreateWorker } from "../worker";
import { Router } from "mediasoup/node/lib/RouterTypes";
import CreateProducerTransport from '../WebRTC/CreateProducerTransport'
import { Transport } from "mediasoup/node/lib/TransportTypes";
import { DtlsParameters } from "mediasoup/node/lib/WebRtcTransportTypes";

let mediaSoupRouter: Router;
let producerTransport: Transport;


const onRouterRtpCapabilities = (socket: WebSocket) => {
    const message = JSON.stringify({ data: mediaSoupRouter.rtpCapabilities, type: 'routerRtpCapabilities', nature: 'response' });
    socket.send(message);

}

const onCreateProducerTransport = async  (ws:WebSocket) =>{
    const { transport, params } = await CreateProducerTransport(mediaSoupRouter);
    const message = JSON.stringify({data: params, type: 'producerTransportCreated', nature: 'response'});
    producerTransport = transport;
    ws.send(message);
}
const onConnectProducerTransport = async (dtlsParameters:DtlsParameters,ws:WebSocket) =>{
    await producerTransport.connect({dtlsParameters });
    ws.send(JSON.stringify({
        type:"producerConnected",
        
    }))
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
                    onConnectProducerTransport(message.dtlsParameters,socket)
                    break;
            }
        });
    })
}

export default websocketsManager;