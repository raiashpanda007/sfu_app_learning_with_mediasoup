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
            data:{kind,
            rtpParameters,}
        }
        
        ws.send(JSON.stringify(message));
        ws.addEventListener('message',(event)=>{
            const message = JSON.parse(event.data);
            if(message.type === 'produced') {
                callback({id: message.id});
            } else {
                errback(new Error('Failed to produce'));
            }
        })
    })

    transport.on('connectionstatechange', (state) => {
        switch (state) {
            case 'connecting':
                console.log('Producer transport connecting');
                break;
            case 'connected':
                console.log('Producer transport connected');
                break;
            case 'failed':
                console.error('Producer transport failed');
                break;
            case 'disconnected':
                console.error('Producer transport disconnected');
                break;
            case 'closed':
                console.error('Producer transport closed');
                break;
            default:
                console.error('Unknown producer transport state:', state);
                break;
                
        }
    })

}

export default ProducerTransportCreated;