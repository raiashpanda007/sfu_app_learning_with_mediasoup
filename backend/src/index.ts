import express from 'express';
import { createServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import WebSocketHandler from './lib/sockets';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/' });

const socketHandler = new WebSocketHandler(wss);
socketHandler.init();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
