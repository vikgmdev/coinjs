import { Pool } from './pool';
import NetAddress from './helpers/netaddress';
import PeerList from './helpers/peerList';
import { assert } from '../utils/assert';
import { OutboundPeer } from './outbound-peer';

export class ClientPool extends Pool {
    /**
     * Interval for refilling outbound peers.
     */
    static REFILL_INTERVAL = 3000;

    refillTimer: NodeJS.Timeout | null;

    hosts: NetAddress[];

    seeds = [
        {
            host: 'localhost',
            port: 65378,
        },
        {
            host: 'localhost',
            port: 65379,
        },
        {
            host: 'localhost',
            port: 65380,
        },
        {
            host: 'localhost',
            port: 65381,
        },
    ];

    connected: boolean;

    options = {
        host: 'localhost',
        maxInbound: 20,
        port: 65378,
        maxOutbound: 8,
    };

    constructor(port: number) {
        super();

        this.connected = false;

        this.options.port = port;

        this.refillTimer = null;

        this.peers = new PeerList();

        this.hosts = this.seeds
            .filter(seed => seed.port !== this.options.port)
            .map(seed => NetAddress.fromHost(seed.host, seed.port));
    }

    /**
     * Connect to the network (no lock).
     */
    async connect(): Promise<void> {
        if (this.connected) return;

        this.fillOutbound();

        this.startTimer();

        this.connected = true;
    }

    /**
     * Attempt to refill the pool with peers (no lock).
     */
    private fillOutbound(): void {
        const need = this.options.maxOutbound - this.peers.outbound;

        if (need <= 0) return;

        console.log('Refilling %d peers (%d/%d).', need, this.peers.outbound, this.options.maxOutbound);

        for (const addr of this.hosts) this.addOutbound(addr);
    }

    /**
     * Create an outbound non-loader peer. These primarily
     * exist for transaction relaying.
     */
    private addOutbound(addr: NetAddress): void {
        if (this.peers.outbound >= this.options.maxOutbound) return;

        if (!addr) return;

        const peer = this.createOutbound(addr);

        this.peers.add(peer);

        this.emit('peer', peer);
    }

    /**
     * Create an outbound peer with no special purpose.
     */

    private createOutbound(addr: NetAddress): OutboundPeer {
        const peer = new OutboundPeer(this.options, addr);

        this.bindPeer(peer);

        console.debug('Connecting to %s.', peer.hostname());

        peer.tryOpen();

        return peer;
    }

    /**
     * Start discovery timer.
     */
    private startTimer(): void {
        assert(this.refillTimer == null, 'Refill timer already started.');

        this.refillTimer = setInterval(() => this.refill(), ClientPool.REFILL_INTERVAL);
    }

    /**
     * Attempt to refill the pool with peers (no lock).
     */
    private refill(): void {
        try {
            this.fillOutbound();
        } catch (e) {
            this.emit('error', e);
        }
    }
}
