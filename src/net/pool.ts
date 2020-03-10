import { EventEmitter } from 'events';
import { Peer } from './peer';
import PeerList from './helpers/peerList';

export class Pool extends EventEmitter {
    id: number;

    peers: PeerList;

    constructor() {
        super();

        this.id = 0;

        this.peers = new PeerList();
    }

    /**
     * Bind to peer events.
     */
    protected bindPeer(peer: Peer): void {
        peer.id = this.uid();

        peer.on('error', err => {
            console.log('ON - PEER - ERROR', err);
        });

        peer.once('connect', async () => {
            try {
                await this.handleConnect(peer);
            } catch (e) {
                this.emit('error', e);
            }
        });

        peer.once('open', async () => {
            try {
                await this.handleOpen(peer);
            } catch (e) {
                this.emit('error', e);
            }
        });

        peer.once('close', async connected => {
            try {
                await this.handleClose(peer, connected);
            } catch (e) {
                this.emit('error', e);
            }
        });
    }

    /**
     * Allocate new peer id.
     */
    uid(): number {
        const MAX = Number.MAX_SAFE_INTEGER;

        if (this.id >= MAX - this.peers.size() - 1) this.id = 0;

        // Once we overflow, there's a chance
        // of collisions. Unlikely to happen
        // unless we have tried to connect 9
        // quadrillion times, but still
        // account for it.
        do {
            this.id += 1;
        } while (this.peers.find(this.id));

        return this.id;
    }

    /**
     * Handle peer connect event.
     */

    private async handleConnect(peer: Peer): Promise<void> {
        console.info('Connected to %s.', peer.hostname());

        this.emit('peer connect', peer);
    }

    /**
     * Handle peer open event.
     */
    private async handleOpen(peer: Peer): Promise<void> {
        this.emit('peer open', peer);
    }

    /**
     * Handle peer close event.
     */
    private async handleClose(peer: Peer, connected: boolean): Promise<void> {
        this.removePeer(peer);

        this.emit('peer close', peer, connected);
    }

    /**
     * Remove a peer from any list. Drop all load requests.
     */
    private removePeer(peer: Peer): void {
        try {
            this.peers.remove(peer);
        } catch (err) {
            // console.log('removepeer:', err)
        }
    }
}
