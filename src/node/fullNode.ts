import { Node } from './node';
import { ClientPool, ServerPool } from '../net';

export class FullNode extends Node {
    serverPool: ServerPool;
    clientPool: ClientPool;

    public constructor(port: number) {
        super();

        // Instantiate p2p pool.
        this.serverPool = new ServerPool(port);
        this.clientPool = new ClientPool(port);

        this.init();
    }

    /**
     * Initialize the node.
     */
    private init(): void {
        // Bind to errors
        this.serverPool.on('error', (err: Error) => this.error(err));
        this.clientPool.on('error', (err: Error) => this.error(err));
    }

    /**
     * Connect to the network.
     */
    public async connect(): Promise<void> {
        await this.serverPool.listen();
        await this.clientPool.connect();
    }
}
