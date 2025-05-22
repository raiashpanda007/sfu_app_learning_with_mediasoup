import { useEffect, useRef, useState, useCallback } from 'react';
import { Device } from 'mediasoup-client';
import type { RtpCapabilities, Transport } from 'mediasoup-client/types';
import ProducerTransportCreated from './WebRTC/ProducerTransportCreated';
import CreateDevice from './WebRTC/CreateDevice';

type UseMediasoupReturn = {
  ws: WebSocket | null;
  device: Device | null;
  routerRtpCapabilities: RtpCapabilities | null;
  publish: () => Promise<void>;
};

const SIGNALING_URL = 'ws://localhost:8000';

export default function useMediasoup(): UseMediasoupReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [routerRtpCapabilities, setRouterRtpCapabilities] = useState<RtpCapabilities | null>(null);
  const producerTransportRef = useRef<Transport | null>(null);

  useEffect(() => {
    const ws = new WebSocket(SIGNALING_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket opened — requesting router RTP capabilities');
      ws.send(JSON.stringify({ type: 'getRouterRtpCapabilities' }));
    };

    ws.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);

      if (msg.type === 'routerRtpCapabilities') {
        setRouterRtpCapabilities(msg.data);

        const d = await CreateDevice(msg.data);
        if (!d) {
          console.error('Device creation failed');
          return;
        }
        setDevice(d);
        deviceRef.current = d;

        ws.send(JSON.stringify({ type: 'createProducerTransport' }));
      } else if (msg.type === 'producerTransportCreated') {
        const dev = deviceRef.current;
        if (!dev) {
          console.warn('Device not ready yet');
          return;
        }

        // Pass all transport data from server + iceServers config here
        const transport = dev.createSendTransport({
          id: msg.data.id,
          iceParameters: msg.data.iceParameters,
          iceCandidates: msg.data.iceCandidates,
          dtlsParameters: msg.data.dtlsParameters,
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // add TURN here if needed
        });

        producerTransportRef.current = transport;

        // Pass actual transport, not msg.data
        await ProducerTransportCreated(msg.data, dev, ws, transport);
      }
    };

    ws.onclose = () => console.log('WebSocket closed');
    ws.onerror = (e) => console.error('WebSocket error', e);

    return () => {
      ws.close();
    };
  }, []);

  const publish = useCallback(async () => {
    const transport = producerTransportRef.current;
    if (!transport) {
      console.warn('Transport not ready');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // local preview
      const videoEl = document.getElementById('local-video') as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
      }

      // produce each track
      for (const track of stream.getTracks()) {
        try {
          const producer = await transport.produce({
            track,
            encodings: [],
            codecOptions: {},
          });
          console.log(`Produced ${track.kind}:`, producer.id);
        } catch (err) {
          console.error(`Failed to produce ${track.kind}`, err);
        }
      }
    } catch (err) {
      console.error('Failed to getUserMedia:', err);
    }
  }, []);

  return {
    ws: wsRef.current,
    device,
    routerRtpCapabilities,
    publish,
  };
}
