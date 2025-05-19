import { Device } from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/types";


const CreateDevice = async (routerRtpCapabilities:RtpCapabilities) => {
    let device;
    try {
         device = new Device();
    } catch (error: any) {
        if ( !device || error?.name === 'UnsupportedError') {
            console.error('Browser not supported');
            return;
        }
    }
    
    await device.load({
        routerRtpCapabilities,
    });
}

export default CreateDevice;