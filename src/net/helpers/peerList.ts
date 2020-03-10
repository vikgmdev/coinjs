import { assert } from '../../utils/assert';
import { List } from '../../utils';
import { Peer } from '../peer';

/**
 * Peer List
 * @alias module:net.PeerList
 */
export default class PeerList {
    map: Map<string, Peer>;
    ids: Map<number, Peer>;
    list: List<Peer>;
    load: Peer | null;
    inbound: number;
    outbound: number;

    /**
     * Create peer list.
     */
    constructor() {
        this.map = new Map();
        this.ids = new Map();
        this.list = new List();
        this.load = null;
        this.inbound = 0;
        this.outbound = 0;
    }

    /**
     * Get the list head.
     */
    head(): Peer {
        return this.list.head;
    }

    /**
     * Get the list tail.
     */
    tail(): Peer {
        return this.list.tail;
    }

    /**
     * Get list size.
     */
    size(): number {
        return this.list.size;
    }

    /**
     * Add peer to list.
     */
    add(peer: Peer): void {
        assert(this.list.push(peer));

        assert(!this.map.has(peer.hostname()));
        this.map.set(peer.hostname(), peer);

        assert(!this.ids.has(peer.id));
        this.ids.set(peer.id, peer);

        if (peer.outbound) this.outbound += 1;
        else this.inbound += 1;
    }

    /**
     * Remove peer from list.
     */
    remove(peer: Peer): void {
        assert(this.list.remove(peer));

        assert(this.ids.has(peer.id));
        this.ids.delete(peer.id);

        assert(this.map.has(peer.hostname()));
        this.map.delete(peer.hostname());

        if (peer === this.load) {
            assert(peer.loader);
            peer.loader = false;
            this.load = null;
        }

        if (peer.outbound) this.outbound -= 1;
        else this.inbound -= 1;
    }

    /**
     * Get peer by hostname.
     */
    get(hostname: string): Peer {
        return this.map.get(hostname) as Peer;
    }

    /**
     * Test whether a peer exists.
     */
    has(hostname: string): boolean {
        return this.map.has(hostname);
    }

    /**
     * Get peer by ID.
     */
    find(id: number): Peer {
        return this.ids.get(id) as Peer;
    }

    /**
     * Destroy peer list (kills peers).
     */
    destroy(): void {
        let next;

        for (let peer = this.list._head; peer; peer = next) {
            next = peer.next;
            peer.value.destroy();
        }
    }
}
