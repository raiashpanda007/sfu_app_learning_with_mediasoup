import {createWorker} from 'mediasoup';
import { config } from '../config'
import { Worker, Router } from 'mediasoup/node/lib/types';
import { log } from 'console';

const worker: Array<{
    worker: Worker,
    router: Router
}> = []

let workerIndex = 0;

const CreateWorker = async () => {
    const newWorker = await createWorker({
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        
    });
    newWorker.on('died', () => {
        console.error('mediasoup worker died [pid:%d]', newWorker.pid);
        setTimeout(() => {
            console.log('worker died, exiting in 2 seconds...');
            process.exit(1);
        }
        , 2000);
        
    });
    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    const mediasoupRouter = await newWorker.createRouter({
        mediaCodecs
    });
    return mediasoupRouter;
}

export {CreateWorker}