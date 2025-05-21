import { createWorker } from 'mediasoup';
import type { Router, Worker } from 'mediasoup/node/lib/types';
import { config } from '../config';

class WorkerPool {
  private static instance: WorkerPool;
  private router!: Router; // Definite assignment assertion

  private constructor() {}

  static async getInstance(): Promise<WorkerPool> {
    if (!WorkerPool.instance) {
      const pool = new WorkerPool();
      await pool.createWorkerAndRouter();
      WorkerPool.instance = pool;
    }
    return WorkerPool.instance;
  }

  private async createWorkerAndRouter() {
    const worker: Worker = await createWorker({
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags
    });

    worker.on('died', () => {
      console.error(`mediasoup Worker died [pid:${worker.pid}], exiting in 2s`);
      setTimeout(() => process.exit(1), 2000);
    });

    this.router = await worker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs });
  }

  getRouter(): Router {
    return this.router;
  }
}

export default WorkerPool;
