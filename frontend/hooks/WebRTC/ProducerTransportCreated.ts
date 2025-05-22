import { Device } from 'mediasoup-client';
import type { Transport } from 'mediasoup-client/types';

const ProducerTransportCreated = async (
  data: any,
  device: Device,
  ws: WebSocket,
  transport: Transport
) => {
  if (data.error) {
    console.error('Error creating producer transport:', data.error);
    return;
  }

  transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
    try {
      ws.send(JSON.stringify({
        type: 'connectProducerTransport',
        dtlsParameters
      }));

      const handler = (event: MessageEvent) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'producerConnected') {
          ws.removeEventListener('message', handler);
          callback();
        } else {
          ws.removeEventListener('message', handler);
          errback(new Error('Failed to connect producer transport'));
        }
      };

      ws.addEventListener('message', handler);
    } catch (err:any) {
        console.error('Error in connect event:', err);
      errback(err);
    }
  });

  transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
  ws.send(JSON.stringify({
    type: 'produce',
    data: { kind, rtpParameters }
  }));

  const handler = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'produced') {
      ws.removeEventListener('message', handler);
      // ← fix: read from msg.data.id
      callback({ id: msg.data.id });
    } else {
      ws.removeEventListener('message', handler);
      errback(new Error('Failed to produce'));
    }
  };
  ws.addEventListener('message', handler);
});


  transport.on('connectionstatechange', (state) => {
    switch (state) {
      case 'connecting':
        console.log('Producer transport connecting...');
        break;
      case 'connected':
        console.log('Producer transport connected.');
        break;
      case 'failed':
        console.error('Producer transport failed.');
        break;
      case 'disconnected':
        console.warn('Producer transport disconnected.');
        break;
      case 'closed':
        console.warn('Producer transport closed.');
        break;
      default:
        console.warn('Unknown state:', state);
        break;
    }
  });
};

export default ProducerTransportCreated;
