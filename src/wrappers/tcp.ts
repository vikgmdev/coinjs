import { EventEmitter } from 'events';
import net from 'net';

export class Server extends EventEmitter {

    server: net.Server;
    _reject: any;

    /**
     * Create a TCP server.
     * @constructor
     * @param {Function?} handler
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
        return (this.server.address()) as net.AddressInfo;
    }

    close() {
        return new Promise((resolve, reject) => {
            this._reject = reject;

            const cb = (err?: Error) => {
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

    getConnections() {
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

    listen(...args) {
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

    get listening() {
        return this.server.listening;
    }

    set listening(value) {}

    get maxConnections() {
        return this.server.maxConnections;
    }

    set maxConnections(value) {
        this.server.maxConnections = value;
    }

    ref() {
        this.server.ref();
        return this;
    }

    unref() {
        this.server.unref();
        return this;
    }
}

export class Socket extends net.Socket {};

/**
 * Create a TCP server.
 * @param {Function?} handler
 * @returns {Object}
 */
function createServer(handler?: () => void) {
    return new Server(handler);
};

export const tcp = {
    createServer
}
