import { Device } from "mediasoup-client";

const ProducerTransportCreated = async (event:any,device:Device,ws:WebSocket) =>{
    if(event.error) {
        console.error('Error creating producer transport:', event.error);
        return;
    }
    const transport = device.createSendTransport(event.data);
    transport.on('connect' , async ({dtlsParameters},callback,errback) =>{
        const message = {
            type: 'connectProducerTransport',
            dtlsParameters,

        }

        ws.send(JSON.stringify(message));
        callback();
        
        
    })

}

export default ProducerTransportCreated;