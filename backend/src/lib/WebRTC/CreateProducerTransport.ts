import { Router } from "mediasoup/node/lib/RouterTypes";
import { config } from "../../config";
const createProducerTransport = async (mediasoupRouter: Router) => {
    const {
        maxIncomeBitrate,
        initialAvailableOutgoingBitrate
    } = config.mediasoup.webRtcTransport;


    const transport = await mediasoupRouter.createWebRtcTransport({
        listenIps: config.mediasoup.webRtcTransport.listenIps,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate,

    });
await transport.setMaxIncomingBitrate(maxIncomeBitrate);
    if (maxIncomeBitrate) {
        try {
            await transport.setMaxIncomingBitrate(maxIncomeBitrate);
        } catch (error) {
            console.error('Error setting max incoming bitrate:', error);
        }

    }

    return {
        transport,
        params:{
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        }
    }
}


export default createProducerTransport;