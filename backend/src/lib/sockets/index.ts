import { WebSocketServer } from "ws";
const websocketsManager = async (ws:WebSocketServer) =>{
    ws.on('connection', (socket) => {
        console.log('New client connected');
    })
}

export default websocketsManager;