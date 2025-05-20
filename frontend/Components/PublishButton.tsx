import { RtpCapabilities } from "mediasoup-client/types"


const Publish = (ws:WebSocket,rtpCapabilities:RtpCapabilities) =>{
  const message = {
    type: 'createWebRtcTransport',
    rtpCapabilities: rtpCapabilities,
    forceTcp: false,
  }
}
function PublishButton(ws:WebSocket,rtpCapabilities:RtpCapabilities) {
  return (
    <button onClick={()=>Publish(ws,rtpCapabilities)}>PublishButton</button>
  )
}

export default PublishButton