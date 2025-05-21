import { useEffect, useRef } from 'react';
import CreateDevice from './WebRTC/CreateDevice';
import { Device } from 'mediasoup-client/types';
import ProducerTransportCreated from './WebRTC/ProducerTransportCreated';

const socketURL = 'ws://localhost:3000';

const useSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const deviceRef = useRef<Device>(null);

  useEffect(() => {
    const ws = new WebSocket(socketURL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'getRouterRtpCapabilities':
          console.log('Router RTP Capabilities:', message.data);
          deviceRef.current = await CreateDevice(message.data);
          break;

        case 'ProducerTransportCreated':
          if(!deviceRef.current) {
            console.error('Device not initialized');
            return;
          }
          if (!socketRef.current) {
            console.error('WebSocket not initialized');
            return;
          }
          await ProducerTransportCreated(message.data, deviceRef.current, socketRef.current);
          
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return socketRef;
};

export default useSocket;
