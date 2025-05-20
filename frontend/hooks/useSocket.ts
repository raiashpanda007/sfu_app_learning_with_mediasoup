import { useEffect, useRef } from 'react';
import CreateDevice from './WebRTC/CreateDevice';

const socketURL = 'ws://localhost:3000';

const useSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);

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
          await CreateDevice(message.data);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return socketRef;
};

export default useSocket;
