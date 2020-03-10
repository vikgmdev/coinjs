import { Server, tcp, Socket } from '../wrappers';
import { Pool } from './pool';
import { assert } from '../utils/assert';
import { InboundPeer } from './inbound-peer';

export class ServerPool extends Pool {
    server: Server;

    options = {
        host: 'localhost',
        maxInbound: 20,
        port: 65378,
        maxOutbound: 8,
    };

    constructor(port: number) {
        super();

        this.options.port = port;

        this.server = tcp.createServer();

        this.init();
    }

    /**
     * Start listening on a server socket.
     */
    async listen(): Promise<void> {
        assert(this.server);

        this.server.maxConnections = this.options.maxInbound;

        await this.server.listen(this.options.port, this.options.host);
    }

    private init(): void {
        this.server.on('error', (err: Error) => {
            console.log('Server error', err.message);
            this.emit('error', err);
        });

        this.server.on('connection', (socket: Socket) => {
            console.log('Server connection received');
            try {
                this.handleSocket(socket);
            } catch (e) {
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

    /**
     * Handle incoming connection.
     */
    private handleSocket(socket: Socket): void {
        if (!socket.remoteAddress) {
            console.debug('Ignoring disconnected peer.');
            socket.destroy();
            return;
        }

        this.addInbound(socket);
    }

    /**
     * Create an inbound peer from an existing socket.
     */
    private addInbound(socket: Socket): void {
        const peer = this.createInbound(socket);

        console.info('Added inbound peer (%s).', peer.hostname());

        this.peers.add(peer);
    }

    /**
     * Accept an inbound socket.
     */
    private createInbound(socket: Socket): InboundPeer {
        const peer = new InboundPeer(this.options, socket);

        this.bindPeer(peer);

        peer.tryOpen();

        return peer;
    }
}
