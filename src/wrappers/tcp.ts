import { EventEmitter } from 'events';
import net, { AddressInfo } from 'net';

export class Server extends EventEmitter {
    server: net.Server;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _reject: any;

    /**
     * Create a TCP server.
     */
    constructor(handler?: () => void) {
        super();

        this.server = new net.Server(handler);
        this._reject = null;

        this.server.on('close', () => {
            this.emit('close');
        });

        this.server.on('connection', (socket: net.Socket) => {
            this.emit('connection', socket);
        });

        this.server.on('error', (err: Error) => {
            const reject = this._reject;

            if (reject) {
                this._reject = null;
                reject(err);
                return;
            }

            this.emit('error', err);
        });

        this.server.on('listening', () => {
            this.emit('listening', this.address());
        });
    }

    address(): net.AddressInfo {
        return this.server.address() as net.AddressInfo;
    }

    close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._reject = reject;

            const cb = (err?: Error): void => {
                this._reject = null;

                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            };

            try {
                this.server.close(cb);
            } catch (e) {
                this._reject = null;
                reject(e);
            }
        });
    }

    getConnections(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server.getConnections((err: Error | null, count) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(count);
            });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listen(...args: any[]): Promise<AddressInfo> {
        return new Promise((resolve, reject) => {
            this._reject = reject;

            args.push(() => {
                this._reject = null;
                resolve(this.address());
            });

            try {
                this.server.listen(...args);
            } catch (e) {
                this._reject = null;
                reject(e);
            }
        });
    }

    get listening(): boolean {
        return this.server.listening;
    }

    get maxConnections(): number {
        return this.server.maxConnections;
    }

    set maxConnections(value: number) {
        this.server.maxConnections = value;
    }

    ref(): Server {
        this.server.ref();
        return this;
    }

    unref(): Server {
        this.server.unref();
        return this;
    }
}

export class Socket extends net.Socket {}

/**
 * Create a TCP server.
 */
function createServer(handler?: () => void): Server {
    return new Server(handler);
}

/**
 * Create a TCP socket and connect.
 */
const createSocket = (port: number, host: string): Socket => net.connect(port, host);

export const tcp = {
    createServer,
    createSocket,
};
