import { Socket } from '../../wrappers';

/**
 * Net Address
 * Represents a network address.s
 */
export default class NetAddress {
    host: string;
    port: number;
    services: number;
    time: number;
    hostname: string;

    constructor(options?: NetAddressOptions) {
        this.host = '0.0.0.0';
        this.port = 0;
        this.services = 0;
        this.time = 0;
        this.hostname = '0.0.0.0:0';

        if (options) this.fromOptions(options);
    }

    /**
     * Inject properties from options object.
     */
    private fromOptions(options: NetAddressOptions): NetAddress {
        if (typeof options.host !== 'string') throw new Error('Property host should be a string');
        if (typeof options.port !== 'number') throw new Error('Property port should be a number');

        this.host = this.host;
        this.port = options.port;

        if (options.time) {
            if (typeof options.time !== 'number') throw new Error('Property time should be a number');
            this.time = options.time;
        }

        this.hostname = `${this.host}:${this.port}`;

        return this;
    }

    fromHost(host: string, port: number): NetAddress {
        if (port <= 0 || port >= 0xffff) throw new Error('Invalid PORT');

        this.host = host;
        this.port = port;
        this.hostname = `${this.host}:${this.port}`;

        return this;
    }

    /**
     * Instantiate a network address
     * from a host and port.
     */

    static fromHost(host: string, port: number): NetAddress {
        return new NetAddress().fromHost(host, port);
    }

    /**
     * Inject properties from socket.
     * @private
     * @param {net.Socket} socket
     */
    private fromSocket(socket: Socket): NetAddress {
        const host = socket.remoteAddress;
        const port = socket.remotePort;
        if (typeof host !== 'string') throw new Error('Property host should be a string');
        if (typeof port !== 'number') throw new Error('Property port should be a number');
        return this.fromHost(host, port);
    }

    /**
     * Instantiate a network address
     * from a socket.
     */
    static fromSocket(hostname: Socket): NetAddress {
        return new NetAddress().fromSocket(hostname);
    }
}

interface NetAddressOptions {
    host: string;
    port: number;
    time: number;
    hostname: string;
}
