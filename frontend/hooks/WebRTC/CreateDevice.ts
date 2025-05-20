import { Device } from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/types";


const CreateDevice = async (routerRtpCapabilities: RtpCapabilities) => {
  try {
    const device = new Device();
    await device.load({ routerRtpCapabilities });
    console.log("Mediasoup Device created and loaded");
    return device;
  } catch (error: any) {
    if (error?.name === 'UnsupportedError') {
      console.error('Browser not supported');
    } else {
      console.error('Failed to create or load device:', error);
    }
    return null;
  }
};


export default CreateDevice;