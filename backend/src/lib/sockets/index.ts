import { WebSocketServer ,WebSocket} from "ws";
import { CreateWorker } from "../worker";
import { Router } from "mediasoup/node/lib/RouterTypes";

let mediaSoupRouter: Router;



const onRouterRtpCapabilities = (socket:WebSocket) =>{
    const message = JSON.stringify({data:mediaSoupRouter.rtpCapabilities,type:'routerRtpCapabilities',nature:'response'});

    socket.send(message);

}





const websocketsManager = async (ws:WebSocketServer) =>{
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
                    
                        
            }
        });
    })
}

export default websocketsManager;