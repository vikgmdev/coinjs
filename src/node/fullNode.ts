import { Node } from './node';
import { Pool } from '../net';

export class FullNode extends Node {
    pool: Pool;

    public constructor() {
        super();

        // Instantiate p2p pool.
        this.pool = new Pool();

        this.init();
    }

    /**
     * Initialize the node.
     */
    private init() {
        // Bind to errors
        this.pool.on('error', (err: Error) => this.error(err));
    }

    /**
     * Connect to the network.
     * @returns {Promise}
     */

    connect() {
        return this.pool.connect();
    }
}
