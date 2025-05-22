import os from 'os';
import type {
  RtpCodecCapability,
  TransportListenInfo,
  WorkerLogTag
} from 'mediasoup/node/lib/types';

export const config = {
  listenIp: process.env.LISTEN_IP || '0.0.0.0',
  listenPort: Number(process.env.LISTEN_PORT) || 3016,

  mediasoup: {
    numWorkers: os.cpus().length,
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 40100,
      logLevel: 'debug',
      logTags: ['info','ice','dtls','rtp','rtcp','srtp'] as WorkerLogTag[]
    },
    router: {
      mediaCodecs: [
        { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
        { kind: 'video', mimeType: 'video/VP8', clockRate: 90000,
          parameters: { 'x-google-start-bitrate': 1000 }
        }
      ] as RtpCodecCapability[]
    },
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: process.env.ANNOUNCED_IP || "106.196.51.228"
        }
      ] as TransportListenInfo[],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000
    }
  }
} as const;