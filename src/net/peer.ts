import { EventEmitter } from 'events';
import { Socket } from '../wrappers';
import { assert } from '../utils/assert';
import NetAddress from './helpers/netaddress';

/**
 * Represents a network peer.
 */
export class Peer extends EventEmitter {
    /**
     * Connection timeout.
     */
    static CONNECT_TIMEOUT: number = 15 * 1000;

    options: PeerOptions;
    socket!: Socket | null;
    stream!: Socket;
    address!: NetAddress;
    id: number;

    connected: boolean;
    destroyed: boolean;
    outbound: boolean;
    time: number;
    connectTimeout: NodeJS.Timeout | null;

    /**
     * Create a peer.
     * @alias module:net.Peer
     */
    constructor(options: PeerOptions) {
        super();

        this.options = options;
        this.id = -1;
        this.socket = null;

        this.address = new NetAddress();
        this.connected = false;
        this.destroyed = false;
        this.outbound = false;
        this.time = 0;
        this.connectTimeout = null;
    }

    /**
     * Getter to retrieve hostname.
     */
    hostname(): string {
        return this.address.hostname;
    }

    /**
     * Bind to socket.
     */
    _bind(socket: Socket): void {
        assert(!this.socket);

        this.socket = socket;
        this.stream = this.socket;

        this.socket.on('error', err => {
            if (!this.connected) return;

            this.error(err);
            this.destroy();
        });

        this.socket.once('close', () => {
            this.error('Socket hangup.');
            this.destroy();
        });

        this.stream.on('data', (chunk: Buffer) => {
            try {
                console.log('Peer data', chunk.toString());
            } catch (e) {
                this.error(e);
                this.destroy();
            }
        });

        this.socket.setNoDelay(true);
    }

    /**
     * Emit an error and destroy the peer.
     */
    private error(err: string | Error): void {
        if (typeof err === 'string') {
            err = new Error(err);
        }

        this.emit('error', err);
    }

    /**
     * Disconnect from and destroy the peer.
     */
    destroy(): void {
        const connected = this.connected;

        if (this.destroyed) return;

        this.destroyed = true;
        this.connected = false;

        this.socket?.destroy();
        this.socket = null;

        this.emit('close', connected);
    }

    /**
     * Open and perform initial handshake (without rejection).
     */
    async tryOpen(): Promise<void> {
        try {
            await this.open();
        } catch (e) {}
    }

    /**
     * Open and perform initial handshake.
     */
    async open(): Promise<void> {
        try {
            // Connect to peer.
            await this.initConnect();

            // Finally we can let the pool know
            // that this peer is ready to go.
            this.emit('open');
        } catch (e) {
            console.log('Closing peer:', this.hostname());
            this.error(e);
            this.destroy();
            throw e;
        }
    }

    /**
     * Wait for connection.
     */
    private async initConnect(): Promise<void> {
        if (this.connected) {
            assert(!this.outbound);
            return Promise.resolve();
        }

        assert(this.stream);
        assert(this.socket);

        return new Promise((resolve, reject) => {
            const cleanup = (): void => {
                if (this.connectTimeout != null) {
                    clearTimeout(this.connectTimeout);
                    this.connectTimeout = null;
                }

                if (this.socket) {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    this.socket.removeListener('error', onError);
                }
            };

            const onError = (err: Error): void => {
                cleanup();
                reject(err);
            };

            this.stream.once('connect', () => {
                this.time = Date.now();
                this.connected = true;
                this.emit('connect');

                cleanup();
                resolve();
            });

            this.socket?.once('error', onError);

            this.connectTimeout = setTimeout(() => {
                this.connectTimeout = null;
                cleanup();
                reject(new Error('Connection timed out.'));
            }, Peer.CONNECT_TIMEOUT);
        });
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PeerOptions {}
