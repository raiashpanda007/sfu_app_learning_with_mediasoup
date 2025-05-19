import CreateDevice from './WebRTC/CreateDevice';
import { useEffect } from 'react';
const socketURL = 'ws://localhost:3000/'
const useSocket = async () => {
    useEffect(() => {
        const ws = new WebSocket(socketURL);
        ws.onopen = () => {
            console.log('WebSocket Client Connected');
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'getRouterRtpCapabilities':
                    console.log('Router RTP Capabilities:', message.data);
                    CreateDevice(message.data);
                    break;
            }


        }

        
    }, [])


}