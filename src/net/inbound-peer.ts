import { assert } from '../utils/assert';
import { Peer, PeerOptions } from './peer';
import { Socket } from '../wrappers';
import NetAddress from './helpers/netaddress';

export class InboundPeer extends Peer {
    /**
     * Create inbound peer from socket.
     */
    constructor(options: PeerOptions, socket: Socket) {
        super(options);
        this.accept(socket);
    }

    /**
     * Accept an inbound socket.
     */
    accept(socket: Socket): Socket {
        assert(!this.socket);

        this.address = NetAddress.fromSocket(socket);
        this.address.services = 0;
        this.outbound = false;

        this._bind(socket);

        this.time = Date.now();
        this.connected = true;

        return socket;
    }
}
