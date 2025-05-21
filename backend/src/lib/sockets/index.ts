import { WebSocketServer, WebSocket } from 'ws';
import WorkerPool from '../worker';
import CreateProducerTransport from '../WebRTC/CreateProducerTransport';
import type { Router, Transport, Producer } from 'mediasoup/node/lib/types';
import type { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import type { MediaKind, RtpParameters } from 'mediasoup/node/lib/rtpParametersTypes';

type Client = {
  socket: WebSocket;
  producerTransport?: Transport;
  producer?: Producer;
};

class WebSocketHandler {
  private wss: WebSocketServer;
  private router!: Router;
  private clients = new Map<WebSocket, Client>();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
  }

  public async init() {
    const workerPool = await WorkerPool.getInstance();
    this.router = workerPool.getRouter();

    this.wss.on('connection', (socket: WebSocket) => {
      this.clients.set(socket, { socket });

      socket.on('message', async (msg) => {
        const message = JSON.parse(msg.toString());

        switch (message.type) {
          case 'getRouterRtpCapabilities':
            this.send(socket, 'routerRtpCapabilities', this.router.rtpCapabilities);
            break;

          case 'createProducerTransport':
            await this.createProducerTransport(socket);
            break;

          case 'connectProducerTransport':
            await this.connectProducerTransport(socket, message.dtlsParameters);
            break;

          case 'produce':
            await this.produce(socket, message.data);
            break;

          default:
            console.warn('Unknown message type', message.type);
        }
      });

      socket.on('close', () => {
        this.cleanupClient(socket);
      });
    });
  }

  private send(socket: WebSocket, type: string, data: any) {
    socket.send(JSON.stringify({ type, data, nature: 'response' }));
  }

  private async createProducerTransport(socket: WebSocket) {
    const producerTransport = await CreateProducerTransport.create(this.router);
    const params = producerTransport.params;

    // Save the transport for this client
    const client = this.clients.get(socket);
    if (!client) return;
    client.producerTransport = producerTransport['transport']; // accessing internal transport

    this.send(socket, 'producerTransportCreated', params);
  }

  private async connectProducerTransport(socket: WebSocket, dtlsParameters: DtlsParameters) {
    const client = this.clients.get(socket);
    if (!client || !client.producerTransport) {
      this.send(socket, 'error', 'No producer transport found');
      return;
    }

    await client.producerTransport.connect({ dtlsParameters });
    this.send(socket, 'producerConnected', {});
  }

  private async produce(socket: WebSocket, data: { kind: MediaKind; rtpParameters: RtpParameters }) {
    const client = this.clients.get(socket);
    if (!client || !client.producerTransport) {
      this.send(socket, 'error', 'No producer transport found');
      return;
    }

    const producer = await client.producerTransport.produce({
      kind: data.kind,
      rtpParameters: data.rtpParameters
    });

    client.producer = producer;

    this.send(socket, 'produced', { id: producer.id });

    // Broadcast new producer event to other clients
    this.wss.clients.forEach((otherSocket) => {
      if (otherSocket !== socket && otherSocket.readyState === WebSocket.OPEN) {
        otherSocket.send(JSON.stringify({ type: 'newProducer', data: { producerId: producer.id } }));
      }
    });
  }

  private cleanupClient(socket: WebSocket) {
    const client = this.clients.get(socket);
    if (!client) return;

    // Close transports & producers cleanly if needed
    if (client.producer) {
      client.producer.close();
    }
    if (client.producerTransport) {
      client.producerTransport.close();
    }

    this.clients.delete(socket);
  }
}

export default WebSocketHandler;
