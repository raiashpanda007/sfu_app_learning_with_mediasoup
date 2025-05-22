import type { Router } from 'mediasoup/node/lib/types';
import type { WebRtcTransport, Producer } from 'mediasoup/node/lib/types';
import { config } from '../../config';

class ProducerTransport {
  private transport: WebRtcTransport;

  private constructor(transport: WebRtcTransport) {
    this.transport = transport;
  }

  static async create(router: Router): Promise<ProducerTransport> {
    const opts = config.mediasoup.webRtcTransport;
    const transport = await router.createWebRtcTransport({
      listenIps: opts.listenIps,
      enableUdp: true,
      enableTcp: false,
      preferUdp: true,
      initialAvailableOutgoingBitrate: opts.initialAvailableOutgoingBitrate
    });

    console.log('🕵️  Producer transport listening on candidates:', transport.iceCandidates);

    if (opts.maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(opts.maxIncomingBitrate);
      } catch (err) {
        console.warn('failed to set max bitrate', err);
      }
    }
    return new ProducerTransport(transport);
  }

  get params() {
    return {
      id: this.transport.id,
      iceParameters: this.transport.iceParameters,
      iceCandidates: this.transport.iceCandidates,
      dtlsParameters: this.transport.dtlsParameters
    };
  }

  async connect(dtlsParameters: any) {
    await this.transport.connect({ dtlsParameters });
  }

  async produce(kind: 'audio' | 'video', rtpParameters: any) {
    return this.transport.produce({ kind, rtpParameters });
  }

  get transportInstance() {
    return this.transport;
  }
}



export default ProducerTransport;