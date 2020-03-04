import { EventEmitter } from "events";
import { Server, Socket, tcp } from '../wrappers';

export class Pool extends EventEmitter {

    server: Server;

    constructor() {
        super();

        this.server = tcp.createServer();

        this.init();
    }

    private init() {
        this.server.on('error', (err: Error) => {
            this.emit('error', err);
        });

        this.server.on('connection', (socket: Socket) => {
            try {
                this.handleSocket(socket, false);
            } catch(e) {
                this.emit('error', e);
                return;
            }
            this.emit('connection', socket);
        });

        this.server.on('listening', () => {
            const data = this.server.address();
            console.info(`Pool server listening on ${data.address} (port=${data.port}).`);
            this.emit('listening', data);
        });
    }
}