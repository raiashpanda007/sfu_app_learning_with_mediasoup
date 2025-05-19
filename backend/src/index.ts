import dotenv from 'dotenv';
import express from 'express';
import ws from 'ws';
import { createServer } from 'http';
import websocketsManager from './lib/sockets';
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new ws.Server({ server ,path: '/'});

websocketsManager(wss);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
);

