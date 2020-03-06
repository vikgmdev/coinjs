import { EventEmitter } from 'events';
import { Server, Socket, tcp } from '../wrappers';

export class Pool extends EventEmitter {
    server: Server;
    connected: boolean;

    options = {
        host: 'localhost',
        maxInbound: 20,
        port: 65378,
    };

    constructor() {
        super();

        this.connected = false;

        this.server = tcp.createServer();

        this.init();
    }

    private init() {
        this.server.on('error', (err: Error) => {
            this.emit('error', err);
        });

        this.server.on('connection', (socket: Socket) => {
            this.emit('connection', socket);
        });

        this.server.on('listening', () => {
            const data = this.server.address();
            console.info(`Pool server listening on ${data.address} (port=${data.port}).`);
            this.emit('listening', data);
        });
    }

    /**
     * Connect to the network.
     */
    async connect(): Promise<any> {
        return await this._connect();
    }

    /**
     * Connect to the network (no lock).
     */
    async _connect(): Promise<any> {
        if (this.connected) return;

        await this.listen();

        this.connected = true;
    }

    /**
     * Start listening on a server socket.
     */
    private async listen(): Promise<any> {
        if (this.connected) throw new Error('Already listening.');

        this.server.maxConnections = this.options.maxInbound;

        await this.server.listen(this.options.port, this.options.host);
    }
}
