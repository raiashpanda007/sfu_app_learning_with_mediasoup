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
        ws.addEventListener('message', (event) =>{
            const message = JSON.parse(event.data);
            if(message.type === 'producerConnected') {
                callback();
            } else {
                errback(new Error('Failed to connect producer transport'));
            }
        })
        
        
    });
    transport.on('produce', async ({kind,rtpParameters},callback,errback) =>{
        const message = {
            type: 'produce',
            kind,
            rtpParameters,
        }
        
        ws.send(JSON.stringify(message));
    })

}

export default ProducerTransportCreated;