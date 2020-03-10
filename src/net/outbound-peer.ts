import { assert } from '../utils/assert';
import { Peer, PeerOptions } from './peer';
import { Socket, tcp } from '../wrappers';
import NetAddress from './helpers/netaddress';

export class OutboundPeer extends Peer {
    /**
     * Create outbound peer from net address.
     */
    constructor(options: PeerOptions, addr: NetAddress) {
        super(options);
        this.connect(addr);
    }

    /**
     * Create the socket and begin connecting. This method
     * will use `options.createSocket` if provided.
     */
    connect(addr: NetAddress): Socket {
        assert(!this.socket);

        const socket = tcp.createSocket(addr.port, addr.host);

        this.address = addr;
        this.outbound = true;
        this.connected = false;

        this._bind(socket);

        return socket;
    }
}
